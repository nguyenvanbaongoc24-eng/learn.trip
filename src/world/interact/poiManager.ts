import * as THREE from 'three';
import { POI_TITLE_R, POI_NEAR_R, PLANET_R } from '../config/constants';
import { createPoiBeam, PoiBeamHandle } from '../props/poiBeam';
import { DestinationDef, StageDef } from '../config/destinations';
import { placeOnPlanet } from '../place/placeOnPlanet';
import { heightAt } from '../planet/terrain';
import { applyDitherToObject } from '../materials/dither';
import { registerLandmarkColliders } from '../physics/collision';

const overviewBaseGeometry = new THREE.CylinderGeometry(1.45, 1.75, 0.22, 8);
const overviewPillarGeometry = new THREE.CylinderGeometry(0.34, 0.42, 2.2, 6);
const overviewRoofGeometry = new THREE.ConeGeometry(1.1, 0.72, 4);
const overviewBlockGeometry = new THREE.BoxGeometry(0.82, 1.35, 0.82);
const overviewBridgeGeometry = new THREE.BoxGeometry(3.4, 0.22, 0.52);
const overviewLakeGeometry = new THREE.CylinderGeometry(3.25, 3.25, 0.14, 12);
const overviewStallGeometry = new THREE.BoxGeometry(1.8, 0.2, 1.15);

const sceneGroundMaterials: Record<StageDef['ground'], THREE.MeshLambertMaterial> = {
  lawn: new THREE.MeshLambertMaterial({ color: 0x6d9d55 }),
  paved: new THREE.MeshLambertMaterial({ color: 0xb7a27b }),
  sand: new THREE.MeshLambertMaterial({ color: 0xc6a977 }),
  terrace: new THREE.MeshLambertMaterial({ color: 0xa9a25f }),
};

function addSceneGround(group: THREE.Group, stage: StageDef) {
  // Foundation skirt — makes landmarks look "built into" the planet, not floating.
  // Creates a tapered stone/earth platform that extends below the ground plane.
  const r = stage.flatR * 0.85;
  const groundMat = sceneGroundMaterials[stage.ground] ?? sceneGroundMaterials.lawn;

  // 1. Surface ground disc matching terrain color (very thin, sits right at y=0)
  const discGeo = new THREE.CylinderGeometry(r, r, 0.04, 16);
  const disc = new THREE.Mesh(discGeo, groundMat);
  disc.position.y = 0.01;
  disc.receiveShadow = true;
  group.add(disc);

  // 2. Foundation skirt — extends below ground, tapers inward (like excavated earth)
  const skirtH = 1.2 + r * 0.15; // deeper for larger landmarks
  const skirtGeo = new THREE.CylinderGeometry(r * 0.95, r * 0.6, skirtH, 16);
  const skirtMat = new THREE.MeshLambertMaterial({ color: 0x7a6a52 }); // dark earth/stone
  const skirt = new THREE.Mesh(skirtGeo, skirtMat);
  skirt.position.y = -skirtH * 0.5 + 0.02;
  skirt.receiveShadow = true;
  group.add(skirt);

  // 3. Stone rubble ring around the edge for organic transition
  const rubbleGeo = new THREE.TorusGeometry(r * 0.92, 0.12 + r * 0.025, 6, 16);
  const rubbleMat = new THREE.MeshLambertMaterial({ color: 0x8a7c66 });
  const rubble = new THREE.Mesh(rubbleGeo, rubbleMat);
  rubble.rotation.x = Math.PI / 2;
  rubble.position.y = 0.05;
  rubble.receiveShadow = true;
  group.add(rubble);
}

function createOverviewLandmark(stage: StageDef) {
  const group = new THREE.Group();
  const hue = (stage.index * 0.11 + 0.02) % 1;
  const baseMaterial = new THREE.MeshLambertMaterial({ color: new THREE.Color().setHSL(hue, 0.42, 0.48) });
  const accentMaterial = new THREE.MeshLambertMaterial({ color: new THREE.Color().setHSL(hue, 0.58, 0.66) });
  const roofMaterial = new THREE.MeshLambertMaterial({ color: 0xc75b36 });
  const waterMaterial = new THREE.MeshLambertMaterial({ color: 0x4fc6c0, transparent: true, opacity: 0.92 });
  const creamMaterial = new THREE.MeshLambertMaterial({ color: 0xf4e6bd });

  if (stage.index === 1) {
    const lake = new THREE.Mesh(overviewLakeGeometry, waterMaterial);
    lake.position.y = 0.06;
    group.add(lake);
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.16, 0.38), roofMaterial);
    bridge.position.set(1.7, 0.22, 0);
    group.add(bridge);
    const tower = new THREE.Mesh(overviewPillarGeometry, creamMaterial);
    tower.scale.set(0.36, 0.58, 0.36);
    tower.position.set(-0.35, 0.72, 0);
    group.add(tower);
  }
  const base = new THREE.Mesh(overviewBaseGeometry, baseMaterial);
  base.position.y = 0.11;
  group.add(base);

  if (stage.index === 5) {
    const bridge = new THREE.Mesh(overviewBridgeGeometry, accentMaterial);
    bridge.position.y = 0.58;
    group.add(bridge);
    for (const x of [-1.1, 0, 1.1]) {
      const support = new THREE.Mesh(overviewPillarGeometry, baseMaterial);
      support.scale.set(0.42, 0.5, 0.42);
      support.position.set(x, 0.5, 0);
      group.add(support);
    }
  } else if (stage.index === 2) {
    for (const x of [-0.68, 0, 0.68]) {
      const house = new THREE.Mesh(overviewBlockGeometry, accentMaterial);
      house.position.set(x, 0.86, 0);
      house.scale.y = x === 0 ? 1.25 : 0.88;
      group.add(house);
    }
  } else if (stage.index === 3) {
    const gateWidth = 2.5;
    for (const x of [-gateWidth / 2, gateWidth / 2]) {
      const post = new THREE.Mesh(overviewPillarGeometry, baseMaterial);
      post.scale.set(0.45, 0.85, 0.45);
      post.position.set(x, 0.9, 0);
      group.add(post);
    }
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.32, 0.72), roofMaterial);
    lintel.position.y = 1.85;
    group.add(lintel);
  } else if (stage.index === 4) {
    const stall = new THREE.Mesh(overviewStallGeometry, roofMaterial);
    stall.position.y = 0.7;
    group.add(stall);
    const canopy = new THREE.Mesh(new THREE.ConeGeometry(1.3, 0.7, 4), accentMaterial);
    canopy.position.y = 1.35;
    canopy.rotation.y = Math.PI / 4;
    group.add(canopy);
    const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.52, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), creamMaterial);
    bowl.position.set(0, 0.9, 0.52);
    group.add(bowl);
  } else if (stage.index === 6) {
    const pond = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 0.12, 10), waterMaterial);
    pond.position.y = 0.06;
    group.add(pond);
    const pagoda = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.22, 1.5), accentMaterial);
    pagoda.position.y = 1.05;
    group.add(pagoda);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.32, 0.8, 4), roofMaterial);
    roof.position.y = 1.62;
    roof.rotation.y = Math.PI / 4;
    group.add(roof);
  } else {
    const pillar = new THREE.Mesh(overviewPillarGeometry, accentMaterial);
    pillar.position.y = 1.2;
    group.add(pillar);
    const roof = new THREE.Mesh(overviewRoofGeometry, roofMaterial);
    roof.position.y = 2.65;
    roof.rotation.y = Math.PI / 4;
    group.add(roof);
  }
  group.scale.setScalar(1.45);
  return group;
}

export const dirFromLatLon = (latDeg: number, lonDeg: number) =>
  new THREE.Vector3().setFromSphericalCoords(1, Math.PI/2 - THREE.MathUtils.degToRad(latDeg), THREE.MathUtils.degToRad(lonDeg));

export class PoiManager {
  stages: StageDef[];
  beaconHandles: PoiBeamHandle[] = [];
  landmarks: THREE.Group;
  overviewLandmarks: THREE.Group;
  overviewRoutes: THREE.Group;
  landmarkGroups: Array<THREE.Group | null> = [];
  currentTitleId: string | null = null;
  currentInteractId: string | null = null;
  onNear: (id: string | null, canInteract: boolean) => void;
  onOpen: (id: string) => void;
  lastOpenedId: string | null = null;
  stageDirs: THREE.Vector3[] = [];
  nearStageDir: THREE.Vector3 | null = null;
  nearStageFocus: THREE.Vector3 | null = null;
  landmarkFocusPoints: Array<THREE.Vector3 | null> = [];
  // A selected POI owns the walking scene. Hanoi's compact globe coordinates
  // intentionally sit close together, so using only the nearest point can
  // otherwise swap the scene while the arrival animation is still running.
  activeStageIndex: number | null = null;
  checkedInIds: Set<string>;
  
  updateCallbacks: Array<(dt: number, playerPos?: THREE.Vector3) => void> = [];

  constructor(dest: DestinationDef, scene: THREE.Object3D, checkedIn: string[], onNear: (id: string | null, canInteract: boolean) => void, onOpen: (id: string) => void) {
    this.stages = dest.stages;
    this.onNear = onNear;
    this.onOpen = onOpen;
    this.checkedInIds = new Set(checkedIn);
    this.landmarks = new THREE.Group();
    this.overviewLandmarks = new THREE.Group();
    this.overviewRoutes = new THREE.Group();
    
    for (const s of this.stages) {
      const vDir = dirFromLatLon(s.dir[0], s.dir[1]);
      this.stageDirs.push(vDir);
      
      // Create soft beacon
      const isChecked = this.checkedInIds.has(s.id);
      const handle = createPoiBeam(vDir, isChecked);
      this.beaconHandles.push(handle);
      scene.add(handle.mesh);
      scene.add(handle.ring);
      
      // Build and place landmark
      try {
        const buildCtx: any = {};
        const landmarkGroup = s.build(buildCtx);
        if (buildCtx.onUpdate) {
          this.updateCallbacks.push(buildCtx.onUpdate);
        }
        if (landmarkGroup && landmarkGroup.children.length > 0) {
          addSceneGround(landmarkGroup, s);
          applyDitherToObject(landmarkGroup);
          placeOnPlanet(landmarkGroup, vDir, 0, 0);
          this.landmarks.add(landmarkGroup);
          this.landmarkGroups.push(landmarkGroup);
          landmarkGroup.updateWorldMatrix(true, true);
          registerLandmarkColliders(s.id, landmarkGroup);
          const bounds = new THREE.Box3().setFromObject(landmarkGroup);
          this.landmarkFocusPoints.push(bounds.isEmpty() ? null : bounds.getCenter(new THREE.Vector3()));
        } else {
          this.landmarkGroups.push(null);
          this.landmarkFocusPoints.push(null);
        }
      } catch (e) {
        console.warn(`Failed to build landmark for stage ${s.id}:`, e);
        this.landmarkGroups.push(null);
        this.landmarkFocusPoints.push(null);
      }

      const overviewLandmark = createOverviewLandmark(s);
      placeOnPlanet(overviewLandmark, vDir, 0, 0.2);
      this.overviewLandmarks.add(overviewLandmark);
    }
    // Natural road trails on planet surface replace artificial floating line routes
    scene.add(this.landmarks);
    scene.add(this.overviewLandmarks);
    scene.add(this.overviewRoutes);
  }
  
  updateTime(time: number, dt: number = 0.016, playerPos?: THREE.Vector3) {
    for (const h of this.beaconHandles) {
      h.uniforms.uTime.value = time;
    }
    for (const cb of this.updateCallbacks) {
      try {
        cb(dt, playerPos);
      } catch (_) {}
    }
  }

  setCheckedIn(checkedIn: string[]) {
    this.checkedInIds = new Set(checkedIn);
    this.stages.forEach((stage, index) => {
      this.beaconHandles[index]?.setCheckedIn(this.checkedInIds.has(stage.id));
    });
  }

  setActiveStage(poiId: string | null) {
    this.activeStageIndex = poiId === null
      ? null
      : this.stages.findIndex((stage) => stage.id === poiId);
    if (this.activeStageIndex === -1) this.activeStageIndex = null;
  }
  
  update(playerDir: THREE.Vector3, ePressed: boolean) {
    let titleId = null;
    let interactId = null;
    this.nearStageDir = null;
    this.nearStageFocus = null;
    let nearestIndex = -1;
    let nearestDistance = Infinity;

    const presentedIndex = this.activeStageIndex ?? nearestIndex;
    const activeTitleRadius = this.activeStageIndex === null ? POI_TITLE_R : 16;

    for (let i = 0; i < this.stages.length; i++) {
      const distance = playerDir.angleTo(this.stageDirs[i]) * PLANET_R;
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = i;
      }
    }
    
    for (let i = 0; i < this.stages.length; i++) {
      const s = this.stages[i];
      const vDir = this.stageDirs[i];
      const d = playerDir.angleTo(vDir) * PLANET_R;
      const detail = this.landmarkGroups[i];
      // Hanoi's POIs intentionally sit close together on the overview globe.
      // In walk mode, rendering every nearby landmark makes separate places
      // visually overlap and lets one building occlude another. Keep the
      // nearest authored scene only.
      // When a destination is explicitly selected it owns the entire walk
      // scene, even if another compact-Hanoi marker happens to be closer to
      // the spawn point.
      if (detail) detail.visible = i === presentedIndex && (this.activeStageIndex !== null || nearestDistance < 18);
      
      if (i === presentedIndex && d < activeTitleRadius) {
        titleId = s.id;
        this.nearStageDir = vDir;
        this.nearStageFocus = this.landmarkFocusPoints[i] || vDir.clone().multiplyScalar(PLANET_R + Math.max(2.5, heightAt(vDir) + 2.5));
        if (d < POI_NEAR_R) {
          interactId = s.id;
        }
      }
      
      // Dim beacon when player is very close
      const beaconMesh = this.beaconHandles[i].mesh;
      const showBeacon = this.activeStageIndex === null
        ? d >= POI_NEAR_R
        : i === presentedIndex && d >= POI_NEAR_R;
      beaconMesh.visible = showBeacon;
      this.beaconHandles[i].ring.visible = showBeacon;
    }
    
    // Xử lý báo cáo cho UI
    if (this.currentTitleId !== titleId || this.currentInteractId !== interactId) {
      this.currentTitleId = titleId;
      this.currentInteractId = interactId;
      this.onNear(titleId, interactId !== null);
    }
    
    // Xử lý nhấn E
    if (ePressed && interactId && interactId !== this.lastOpenedId) {
      this.lastOpenedId = interactId; // Tránh mở liên tục
      this.onOpen(interactId);
    }
    
    // Reset chống mở liên tục nếu đi ra xa
    if (!interactId) {
      this.lastOpenedId = null;
    }
  }
}
