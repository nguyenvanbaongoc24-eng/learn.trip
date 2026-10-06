import * as THREE from 'three';
import { WALK_SPEED, RUN_MULT, PLANET_R, WATER_LEVEL } from '../config/constants';
import { heightAt } from '../planet/terrain';
import { DestinationDef } from '../config/destinations';
import { dirFromLatLon } from '../interact/poiManager';
import { Keyboard } from '../input/keyboard';
import { collisionSystem } from '../physics/collision';

const tmp = new THREE.Vector3();
const tmp2 = new THREE.Vector3();
const wish = new THREE.Vector3();

export class Controller {
  dir: THREE.Vector3;
  heading: THREE.Vector3;
  pos: THREE.Vector3;
  quat: THREE.Quaternion;
  h: number = 0;
  moving: boolean = false;
  currentSpeed: number = 0;

  // Previous physics state for render interpolation (anti-jitter)
  private prevPos = new THREE.Vector3();
  private prevQuat = new THREE.Quaternion();
  renderPos = new THREE.Vector3();
  renderQuat = new THREE.Quaternion();

  // Click-to-move destination
  targetDir: THREE.Vector3 | null = null;
  onTargetReached?: () => void;
  onTargetChanged?: (target: THREE.Vector3 | null) => void;

  constructor(dest: DestinationDef) {
    this.dir = dirFromLatLon(dest.stages[0].dir[0], dest.stages[0].dir[1]);
    const spawnOffset = dest.stages[0].spawnOffset;
    if (spawnOffset) {
      const north = new THREE.Vector3(0, 1, 0);
      let tangent = new THREE.Vector3().crossVectors(this.dir, north).normalize();
      if (tangent.lengthSq() < 0.001) tangent.set(1, 0, 0);
      const axis = new THREE.Vector3().copy(tangent).applyAxisAngle(this.dir, spawnOffset.bearing);
      this.dir.applyAxisAngle(axis, spawnOffset.dist / PLANET_R).normalize();
    }

    // Nudge away from water if spawn is submerged
    for (let attempt = 0; attempt < 20; attempt++) {
      const h = heightAt(this.dir);
      if (h > WATER_LEVEL + 0.15) break;
      const north = new THREE.Vector3(0, 1, 0);
      let tangent = new THREE.Vector3().crossVectors(this.dir, north).normalize();
      if (tangent.lengthSq() < 0.001) tangent.set(1, 0, 0);
      this.dir.applyAxisAngle(tangent, 0.5 / PLANET_R).normalize();
    }

    this.heading = new THREE.Vector3(0, 0, -1);
    this.pos = new THREE.Vector3();
    this.quat = new THREE.Quaternion();
    this.syncTransform();
    this.prevPos.copy(this.pos);
    this.prevQuat.copy(this.quat);
    this.renderPos.copy(this.pos);
    this.renderQuat.copy(this.quat);
  }

  syncTransform() {
    this.dir.normalize();
    this.heading.sub(tmp.copy(this.dir).multiplyScalar(this.heading.dot(this.dir))).normalize();
    this.h = heightAt(this.dir);
    this.pos.copy(this.dir).multiplyScalar(PLANET_R + this.h);
    const z = tmp.copy(this.heading).negate();
    const x = new THREE.Vector3().crossVectors(this.dir, z).normalize();
    const m = new THREE.Matrix4().makeBasis(x, this.dir, z);
    this.quat.setFromRotationMatrix(m);
  }

  setTargetDir(target: THREE.Vector3 | null) {
    if (!target) {
      this.cancelTarget();
      return;
    }
    // Verify target is walkable
    const targetH = heightAt(target);
    if (targetH <= WATER_LEVEL + 0.02) {
      // Find nearest walkable point nudged toward current position
      const dirToPlayer = tmp.copy(this.dir).sub(target).normalize();
      const adjusted = target.clone().addScaledVector(dirToPlayer, 0.5 / PLANET_R).normalize();
      if (heightAt(adjusted) > WATER_LEVEL + 0.02) {
        this.targetDir = adjusted;
      } else {
        return; // Non-walkable water
      }
    } else {
      this.targetDir = target.clone().normalize();
    }
    this.onTargetChanged?.(this.targetDir);
  }

  cancelTarget() {
    if (this.targetDir) {
      this.targetDir = null;
      this.onTargetChanged?.(null);
    }
  }

  /** Call before each physics step to snapshot state for interpolation */
  saveState() {
    this.prevPos.copy(this.pos);
    this.prevQuat.copy(this.quat);
  }

  /** Interpolate between previous and current physics state for smooth rendering */
  interpolate(alpha: number) {
    this.renderPos.lerpVectors(this.prevPos, this.pos, alpha);
    this.renderQuat.slerpQuaternions(this.prevQuat, this.quat, alpha);
  }

  update(dt: number, keyboard: Keyboard, camFwd: THREE.Vector3) {
    const up = this.dir;
    const moveInput = keyboard.getMoveVector();

    // Any manual keyboard movement immediately cancels click-to-move
    if (moveInput.isMoving && this.targetDir) {
      this.cancelTarget();
    }

    let hasWish = false;
    wish.set(0, 0, 0);

    if (moveInput.isMoving) {
      // Direction relative to camera tangent plane
      const right = tmp.crossVectors(camFwd, up).normalize();
      wish.addScaledVector(camFwd, moveInput.z).addScaledVector(right, moveInput.x);
      if (wish.lengthSq() > 1e-4) {
        wish.normalize();
        hasWish = true;
      }
    } else if (this.targetDir) {
      // Move towards click-to-move destination along great circle tangent
      const angle = this.dir.angleTo(this.targetDir);
      const distOnSphere = angle * PLANET_R;

      if (distOnSphere < 0.28) {
        // Target reached!
        this.cancelTarget();
        this.onTargetReached?.();
      } else {
        // Tangent vector from this.dir toward targetDir
        wish.copy(this.targetDir).sub(tmp.copy(this.dir).multiplyScalar(this.targetDir.dot(this.dir)));
        if (wish.lengthSq() > 1e-4) {
          wish.normalize();
          hasWish = true;
        }
      }
    }

    // Smooth Acceleration & Deceleration
    const targetSpeed = hasWish ? (WALK_SPEED * (moveInput.run ? RUN_MULT : 1.0)) : 0;
    const accelRate = hasWish ? 14.0 : 18.0;
    this.currentSpeed += (targetSpeed - this.currentSpeed) * (1 - Math.exp(-dt * accelRate));

    if (this.currentSpeed < 0.02 && !hasWish) {
      this.currentSpeed = 0;
      this.moving = false;
    } else {
      this.moving = this.currentSpeed > 0.05;
    }

    if (hasWish) {
      // Smooth heading rotation towards wish vector
      this.heading.lerp(wish, 1 - Math.exp(-dt * 14)).normalize();
    }

    if (this.currentSpeed > 0) {
      const ang = (this.currentSpeed * dt) / PLANET_R;
      const WALKABLE_MIN_H = WATER_LEVEL + 0.05;
      const isWalkable = (d: THREE.Vector3) => heightAt(d) > WALKABLE_MIN_H;

      let moved = false;
      // Multi-angle clearance probe (straight, +/- 28 deg, +/- 57 deg)
      for (const a of [0, 0.48, -0.48, 0.95, -0.95]) {
        const h2 = tmp2.copy(this.heading).applyAxisAngle(up, a);
        const axis = tmp.crossVectors(up, h2).normalize();
        const rawNextD = this.dir.clone().applyAxisAngle(axis, ang);

        // Resolve collision with all solid obstacles (houses, trees, poles) and shoreline barrier
        const { resolvedDir, collided } = collisionSystem.resolvePlayerMovement(this.dir, rawNextD);

        if (isWalkable(resolvedDir)) {
          this.dir.copy(resolvedDir);
          if (a !== 0 && !collided) {
            this.heading.copy(h2);
          }
          moved = true;
          break;
        }
      }

      if (!moved && this.targetDir) {
        // Obstructed path during click-to-move, cancel target
        this.cancelTarget();
      }
    }

    // Arithmetic drift stabilization
    this.dir.normalize();
    this.heading.sub(tmp.copy(this.dir).multiplyScalar(this.heading.dot(this.dir))).normalize();

    // Height & Ground Snapping with Anti-Jitter Deadzone (Mục 7)
    const targetH = heightAt(this.dir);
    if (!this.moving) {
      // When standing still, snap cleanly within epsilon deadzone to eliminate microscopic jitter
      const diff = Math.abs(targetH - this.h);
      if (diff < 0.003) {
        this.h = targetH;
      } else {
        this.h += (targetH - this.h) * (1 - Math.exp(-dt * 24));
      }
    } else {
      this.h += (targetH - this.h) * (1 - Math.exp(-dt * 20));
    }

    this.pos.copy(this.dir).multiplyScalar(PLANET_R + this.h);

    // Orientation: up = dir, forward = heading
    const z = tmp.copy(this.heading).negate();
    const x = tmp2.crossVectors(this.dir, z).normalize();
    const m = new THREE.Matrix4().makeBasis(x, this.dir, z);
    this.quat.setFromRotationMatrix(m);

    // Update collision debug capsule (phím F1)
    collisionSystem.updatePlayerDebug(this.pos, this.quat);
  }
}
