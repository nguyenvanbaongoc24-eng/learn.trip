import * as THREE from 'three';
import { PLANET_R, WATER_LEVEL } from '../config/constants';
import { heightAt } from '../planet/terrain';

export interface BoxCollider {
  type: 'box';
  id: string;
  center: THREE.Vector3;
  halfExtents: THREE.Vector3;
  rotation: THREE.Quaternion;
  invMatrix: THREE.Matrix4;
  matrix: THREE.Matrix4;
}

export interface CylinderCollider {
  type: 'cylinder';
  id: string;
  center: THREE.Vector3;
  radius: number;
  height: number;
  normal: THREE.Vector3;
}

export class CollisionSystem {
  boxColliders: BoxCollider[] = [];
  cylinderColliders: CylinderCollider[] = [];
  debugGroup: THREE.Group;
  debugMode: boolean = false;

  private playerDebugMesh?: THREE.LineSegments;
  private debugMeshes: THREE.Object3D[] = [];

  constructor() {
    this.debugGroup = new THREE.Group();
    this.debugGroup.name = 'CollisionDebugGroup';
    this.debugGroup.visible = false;
  }

  clear() {
    this.boxColliders = [];
    this.cylinderColliders = [];
    this.debugGroup.clear();
    this.debugMeshes = [];
  }

  addBox(id: string, center: THREE.Vector3, size: THREE.Vector3, rotation: THREE.Quaternion = new THREE.Quaternion()): BoxCollider {
    const halfExtents = size.clone().multiplyScalar(0.5);
    const matrix = new THREE.Matrix4().compose(center, rotation, new THREE.Vector3(1, 1, 1));
    const invMatrix = matrix.clone().invert();

    const box: BoxCollider = {
      type: 'box',
      id,
      center: center.clone(),
      halfExtents,
      rotation: rotation.clone(),
      matrix,
      invMatrix,
    };
    this.boxColliders.push(box);

    // Wireframe debug mesh
    const wireGeo = new THREE.WireframeGeometry(new THREE.BoxGeometry(size.x, size.y, size.z));
    const wireMat = new THREE.LineBasicMaterial({ color: 0x00f0ff });
    const wire = new THREE.LineSegments(wireGeo, wireMat);
    wire.position.copy(center);
    wire.quaternion.copy(rotation);
    this.debugGroup.add(wire);
    this.debugMeshes.push(wire);

    return box;
  }

  addCylinder(id: string, center: THREE.Vector3, radius: number, height: number, normal: THREE.Vector3 = new THREE.Vector3(0, 1, 0)): CylinderCollider {
    const cyl: CylinderCollider = {
      type: 'cylinder',
      id,
      center: center.clone(),
      radius,
      height,
      normal: normal.clone().normalize(),
    };
    this.cylinderColliders.push(cyl);

    // Wireframe debug mesh
    const wireGeo = new THREE.WireframeGeometry(new THREE.CylinderGeometry(radius, radius, height, 12));
    const wireMat = new THREE.LineBasicMaterial({ color: 0xffea00 });
    const wire = new THREE.LineSegments(wireGeo, wireMat);
    wire.position.copy(center);
    wire.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
    this.debugGroup.add(wire);
    this.debugMeshes.push(wire);

    return cyl;
  }

  addLocalBox(id: string, parent: THREE.Object3D, localCenter: THREE.Vector3, localSize: THREE.Vector3): BoxCollider {
    parent.updateWorldMatrix(true, false);
    const worldPos = localCenter.clone().applyMatrix4(parent.matrixWorld);
    const worldQuat = parent.getWorldQuaternion(new THREE.Quaternion());
    const worldScale = parent.getWorldScale(new THREE.Vector3());
    const worldSize = localSize.clone().multiply(worldScale);
    return this.addBox(id, worldPos, worldSize, worldQuat);
  }

  addLocalCylinder(id: string, parent: THREE.Object3D, localCenter: THREE.Vector3, radius: number, height: number): CylinderCollider {
    parent.updateWorldMatrix(true, false);
    const worldPos = localCenter.clone().applyMatrix4(parent.matrixWorld);
    const worldQuat = parent.getWorldQuaternion(new THREE.Quaternion());
    const worldNormal = new THREE.Vector3(0, 1, 0).applyQuaternion(worldQuat).normalize();
    const worldScale = parent.getWorldScale(new THREE.Vector3());
    return this.addCylinder(id, worldPos, radius * Math.max(worldScale.x, worldScale.z), height * worldScale.y, worldNormal);
  }

  toggleDebug(): boolean {
    this.debugMode = !this.debugMode;
    this.debugGroup.visible = this.debugMode;
    return this.debugMode;
  }

  /**
   * Resolves collision for player capsule against static boxes, cylinders, and terrain water barrier.
   * Modifies pos and dir with smooth sliding response along obstacle surfaces.
   */
  resolvePlayerMovement(
    currentDir: THREE.Vector3,
    proposedDir: THREE.Vector3,
    playerRadius: number = 0.38
  ): { resolvedDir: THREE.Vector3; collided: boolean } {
    const up = currentDir.clone().normalize();
    const currentH = heightAt(currentDir);
    const proposedH = heightAt(proposedDir);

    const playerPos = proposedDir.clone().multiplyScalar(PLANET_R + proposedH + 0.6);
    let collided = false;

    // 1. Water Shoreline & Steep Cliff Barrier (Mục 3: cách mép nước 0.3m, không xuống nước)
    const SHORELINE_BARRIER = WATER_LEVEL + 0.08;
    if (proposedH <= SHORELINE_BARRIER) {
      // Push back along tangent toward current direction
      const diff = proposedDir.clone().sub(currentDir);
      const dot = diff.dot(up);
      diff.sub(up.clone().multiplyScalar(dot));
      proposedDir.copy(currentDir);
      collided = true;
      return { resolvedDir: proposedDir.normalize(), collided: true };
    }

    // Slope barrier: Prevent climbing cliffs steeper than ~55 degrees
    const slopeTestStep = 0.4 / PLANET_R;
    const testNorth = proposedDir.clone().applyAxisAngle(new THREE.Vector3(1, 0, 0), slopeTestStep);
    const testEast = proposedDir.clone().applyAxisAngle(new THREE.Vector3(0, 0, 1), slopeTestStep);
    const maxSlopeH = Math.max(Math.abs(heightAt(testNorth) - proposedH), Math.abs(heightAt(testEast) - proposedH));
    if (maxSlopeH > 0.45) {
      // Too steep cliff
      return { resolvedDir: currentDir.clone().normalize(), collided: true };
    }

    // 2. Solid Cylinder Colliders (Tree trunks, poles, pillars)
    const probeP = playerPos.clone();
    for (const cyl of this.cylinderColliders) {
      const distToCenter = probeP.distanceTo(cyl.center);
      if (distToCenter > cyl.radius + cyl.height + 1.5) continue;

      // Project onto cylinder axis
      const v = probeP.clone().sub(cyl.center);
      const hDot = v.dot(cyl.normal);
      if (hDot < -0.2 || hDot > cyl.height + 0.5) continue;

      // Radial vector perpendicular to axis
      const radial = v.clone().sub(cyl.normal.clone().multiplyScalar(hDot));
      const rDist = radial.length();
      const minDist = cyl.radius + playerRadius;

      if (rDist < minDist && rDist > 0.001) {
        collided = true;
        const pushNormal = radial.normalize();
        const penetration = minDist - rDist;
        probeP.addScaledVector(pushNormal, penetration);

        // Update proposedDir from corrected probe position
        proposedDir.copy(probeP).normalize();
      }
    }

    // 3. Solid OBB Box Colliders (Houses, walls, temples, shrines, tables)
    for (const box of this.boxColliders) {
      const distToCenter = probeP.distanceTo(box.center);
      const maxExt = box.halfExtents.length();
      if (distToCenter > maxExt + playerRadius + 1.0) continue;

      // Transform point into box local coordinates
      const localP = probeP.clone().applyMatrix4(box.invMatrix);

      // Find closest point on box
      const clamped = new THREE.Vector3(
        THREE.MathUtils.clamp(localP.x, -box.halfExtents.x, box.halfExtents.x),
        THREE.MathUtils.clamp(localP.y, -box.halfExtents.y, box.halfExtents.y),
        THREE.MathUtils.clamp(localP.z, -box.halfExtents.z, box.halfExtents.z)
      );

      const localDiff = localP.clone().sub(clamped);
      const localDistSq = localDiff.lengthSq();

      // Check if point is inside or overlapping player radius
      const isInside = (
        Math.abs(localP.x) < box.halfExtents.x &&
        Math.abs(localP.y) < box.halfExtents.y &&
        Math.abs(localP.z) < box.halfExtents.z
      );

      if (isInside || localDistSq < playerRadius * playerRadius) {
        collided = true;
        let localNormal: THREE.Vector3;
        let penetration: number;

        if (isInside) {
          // Push out to closest face
          const dx = box.halfExtents.x - Math.abs(localP.x);
          const dy = box.halfExtents.y - Math.abs(localP.y);
          const dz = box.halfExtents.z - Math.abs(localP.z);

          if (dx < dy && dx < dz) {
            localNormal = new THREE.Vector3(Math.sign(localP.x), 0, 0);
            penetration = dx + playerRadius;
          } else if (dy < dz) {
            localNormal = new THREE.Vector3(0, Math.sign(localP.y), 0);
            penetration = dy + playerRadius;
          } else {
            localNormal = new THREE.Vector3(0, 0, Math.sign(localP.z));
            penetration = dz + playerRadius;
          }
        } else {
          const d = Math.sqrt(localDistSq);
          localNormal = d > 0.0001 ? localDiff.divideScalar(d) : new THREE.Vector3(0, 1, 0);
          penetration = playerRadius - d;
        }

        // Transform normal back to world space
        const worldNormal = localNormal.applyQuaternion(box.rotation).normalize();
        probeP.addScaledVector(worldNormal, penetration);

        // Update proposedDir
        proposedDir.copy(probeP).normalize();
      }
    }

    return { resolvedDir: proposedDir.normalize(), collided };
  }

  updatePlayerDebug(pos: THREE.Vector3, quat: THREE.Quaternion) {
    if (!this.debugMode) return;
    if (!this.playerDebugMesh) {
      const geo = new THREE.WireframeGeometry(new THREE.CapsuleGeometry(0.38, 0.8, 6, 12));
      const mat = new THREE.LineBasicMaterial({ color: 0x00ff44 });
      this.playerDebugMesh = new THREE.LineSegments(geo, mat);
      this.debugGroup.add(this.playerDebugMesh);
    }
    this.playerDebugMesh.position.copy(pos).add(new THREE.Vector3(0, 0.7, 0).applyQuaternion(quat));
    this.playerDebugMesh.quaternion.copy(quat);
  }
}

// Global collision singleton instance
export const collisionSystem = new CollisionSystem();

/**
 * Registers stage-specific static colliders (buildings, walls, pillars, obstacles)
 * into collisionSystem using local coordinates transformed by landmarkGroup's world matrix.
 */
export function registerLandmarkColliders(stageId: string, group: THREE.Group) {
  if (stageId === 'loc-hoankiem') {
    collisionSystem.addLocalCylinder('hoankiem-tower', group, new THREE.Vector3(0, 0.4, 0), 2.8, 4.0);
    collisionSystem.addLocalBox('hoankiem-temple', group, new THREE.Vector3(4.4, 1.2, -2.8), new THREE.Vector3(3.2, 2.5, 2.6));
    collisionSystem.addLocalBox('hoankiem-balustrade', group, new THREE.Vector3(0, 0.4, 3.8), new THREE.Vector3(9.2, 0.8, 0.4));
    collisionSystem.addLocalCylinder('hoankiem-lantern-1', group, new THREE.Vector3(-3.2, 0.6, 4.4), 0.35, 1.6);
    collisionSystem.addLocalCylinder('hoankiem-lantern-2', group, new THREE.Vector3(3.2, 0.6, 4.4), 0.35, 1.6);
  } else if (stageId === 'loc-phoco') {
    for (let i = 0; i < 10; i++) {
      const side = i < 5 ? -1 : 1;
      const zPos = (i % 5 - 2) * 2.5;
      collisionSystem.addLocalBox(`phoco-house-${i}`, group, new THREE.Vector3(side * 2.35, 2.0, zPos), new THREE.Vector3(2.2, 4.5, 1.8));
    }
    collisionSystem.addLocalCylinder('phoco-pole-1', group, new THREE.Vector3(-1.4, 2.2, -4.5), 0.22, 4.8);
    collisionSystem.addLocalCylinder('phoco-pole-2', group, new THREE.Vector3(1.4, 2.2, 4.5), 0.22, 4.8);
    collisionSystem.addLocalBox('phoco-stall', group, new THREE.Vector3(-1.25, 0.4, 0.8), new THREE.Vector3(0.9, 0.8, 1.2));
  } else if (stageId === 'loc-vanmieu') {
    collisionSystem.addLocalBox('vanmieu-kvc', group, new THREE.Vector3(0, 1.5, -1.2), new THREE.Vector3(2.6, 3.2, 2.6));
    collisionSystem.addLocalBox('vanmieu-well', group, new THREE.Vector3(0, 0.4, 2.6), new THREE.Vector3(3.4, 0.8, 3.4));
    collisionSystem.addLocalBox('vanmieu-gate-left', group, new THREE.Vector3(-1.8, 2.0, -4.5), new THREE.Vector3(2.6, 4.0, 0.9));
    collisionSystem.addLocalBox('vanmieu-gate-right', group, new THREE.Vector3(1.8, 2.0, -4.5), new THREE.Vector3(2.6, 4.0, 0.9));
  } else if (stageId === 'loc-amthuc') {
    collisionSystem.addLocalBox('amthuc-cart', group, new THREE.Vector3(-1.8, 0.9, -1.2), new THREE.Vector3(2.5, 1.8, 1.4));
    collisionSystem.addLocalBox('amthuc-table-0', group, new THREE.Vector3(1.4, 0.4, -1.5), new THREE.Vector3(1.3, 0.8, 1.0));
    collisionSystem.addLocalBox('amthuc-table-1', group, new THREE.Vector3(1.4, 0.4, 0.5), new THREE.Vector3(1.3, 0.8, 1.0));
    collisionSystem.addLocalBox('amthuc-table-2', group, new THREE.Vector3(1.4, 0.4, 2.5), new THREE.Vector3(1.3, 0.8, 1.0));
    collisionSystem.addLocalCylinder('amthuc-post-1', group, new THREE.Vector3(-3.1, 1.7, -2.5), 0.12, 3.5);
    collisionSystem.addLocalCylinder('amthuc-post-2', group, new THREE.Vector3(-3.1, 1.7, 2.5), 0.12, 3.5);
    collisionSystem.addLocalCylinder('amthuc-post-3', group, new THREE.Vector3(3.1, 1.7, -2.5), 0.12, 3.5);
    collisionSystem.addLocalCylinder('amthuc-post-4', group, new THREE.Vector3(3.1, 1.7, 2.5), 0.12, 3.5);
  } else if (stageId === 'loc-longbien') {
    collisionSystem.addLocalBox('longbien-deck-left-rail', group, new THREE.Vector3(0, 1.2, -1.7), new THREE.Vector3(24.0, 2.2, 0.3));
    collisionSystem.addLocalBox('longbien-deck-right-rail', group, new THREE.Vector3(0, 1.2, 1.7), new THREE.Vector3(24.0, 2.2, 0.3));
    collisionSystem.addLocalCylinder('longbien-pier-1', group, new THREE.Vector3(-5.5, -0.2, 0), 1.2, 2.0);
    collisionSystem.addLocalCylinder('longbien-pier-2', group, new THREE.Vector3(5.5, -0.2, 0), 1.2, 2.0);
  } else if (stageId === 'loc-motcot') {
    collisionSystem.addLocalBox('motcot-pond-n', group, new THREE.Vector3(0, 0.3, 4.7), new THREE.Vector3(5.3, 0.8, 0.4));
    collisionSystem.addLocalBox('motcot-pond-s', group, new THREE.Vector3(0, 0.3, -0.3), new THREE.Vector3(5.3, 0.8, 0.4));
    collisionSystem.addLocalBox('motcot-pond-e', group, new THREE.Vector3(2.5, 0.3, 2.2), new THREE.Vector3(0.4, 0.8, 5.3));
    collisionSystem.addLocalBox('motcot-pond-w', group, new THREE.Vector3(-2.5, 0.3, 2.2), new THREE.Vector3(0.4, 0.8, 5.3));
    collisionSystem.addLocalCylinder('motcot-pillar', group, new THREE.Vector3(0, 1.1, 2.2), 0.65, 3.0);
    collisionSystem.addLocalCylinder('motcot-flagpole', group, new THREE.Vector3(0, 3.0, -1.8), 0.18, 6.2);
    collisionSystem.addLocalBox('motcot-mausoleum', group, new THREE.Vector3(0, 2.2, -6.5), new THREE.Vector3(8.5, 4.5, 5.5));
  }
}

