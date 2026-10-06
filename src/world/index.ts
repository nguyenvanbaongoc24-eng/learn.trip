import * as THREE from 'three';
import { PLANET_R, CAM } from './config/constants';
import { createPlanetMesh, terrainUniforms } from './planet/planetMesh';
import { createWaterMesh, waterUniforms } from './planet/water';
import { createSkyMesh, skyUniforms, updateSky } from './planet/sky';
import { populateForest, initScatter, updateWindTime } from './place/scatter';
import { Character } from './player/character';
import { Controller } from './player/controller';
import { Keyboard } from './input/keyboard';
import { CameraRig } from './camera/rig';
import { ditherUniforms } from './materials/dither';
import { occUniforms } from './materials/toon';
import { createButterflyGroup, createGullsGroup, createTelephonePolesAlongPath } from './props/life';
import { createWalkingCrowd } from './props/crowd';
import { TargetMarker } from './props/marker';
import { PoiManager } from './interact/poiManager';
import { getDestination } from './config/registry';
import { initTerrain } from './planet/terrain';
import { collisionSystem } from './physics/collision';

export interface WorldPreset {
  // To be defined later for Hanoi
}

export interface WorldOptions {
  container: HTMLElement;
  destinationId: string;
  checkedIn: string[];
  events: {
    onProgress(p: number): void;
    onReady(): void;
    onPoiNear(id: string | null, canInteract: boolean): void;
    onOpenPhoto(id: string): void;
    onModeChange?(mode: 'walk' | 'overview'): void;
    onPerf?(stats: WorldPerf): void;
    onGlobeLabels?(labels: GlobeLabelScreenPosition[]): void;
  };
}

export interface WorldPerf {
  buildMs: number;
  fps: number;
  p95FrameMs: number;
  calls: number;
  triangles: number;
  programs: number;
  dpr: number;
  builds: number;
}

export interface GlobeLabelScreenPosition {
  id: string;
  index: number;
  name: string;
  x: number;
  y: number;
  visible: boolean;
}

export interface World {
  goTo(poiId: string): void;
  setMode(m: 'walk' | 'overview'): void;
  setCheckedIn(ids: string[]): void;
  setPaused(p: boolean): void;
  dispose(): void;
}

let worldBuildCount = 0;

// ── Reusable temp vectors (avoid GC allocations in loop — mục 4.2#7) ──
const _sunDir = new THREE.Vector3();
const _left = new THREE.Vector3();
const _headPos = new THREE.Vector3();
const _ndcPos = new THREE.Vector3();
const _headView = new THREE.Vector3();
const _labelProjection = new THREE.Vector3();
const _spawnNorth = new THREE.Vector3(0, 1, 0);
const _spawnAxis = new THREE.Vector3();
const _stageForward = new THREE.Vector3();
const _stageOrientation = new THREE.Quaternion();
const _labelWorld = new THREE.Vector3();
const _cameraDirection = new THREE.Vector3();
const _globeUp = new THREE.Vector3(0, 1, 0);
const _globeRight = new THREE.Vector3();

export async function createWorld(opts: WorldOptions): Promise<World> {
  const buildStart = performance.now();
  const buildNumber = ++worldBuildCount;
  const dest = getDestination(opts.destinationId);
  initTerrain(dest);

  // ── Step 1: Renderer, Scene, Camera, Lights ──

  const width = opts.container.clientWidth;
  const height = opts.container.clientHeight;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2));
  renderer.setSize(width, height);
  renderer.setClearColor(new THREE.Color(dest.sky.top), 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true; // render shadow lần đầu

  opts.container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(dest.sky.top);
  // ── Fog bất biến: cùng FogExp2, animate density (mục 4.2#3) ──
  const fog = new THREE.FogExp2(dest.sky.fog, 0); // bắt đầu density=0 (overview)
  scene.fog = fog;
  const worldRoot = new THREE.Group();
  scene.add(worldRoot);
  worldRoot.add(collisionSystem.debugGroup);

  const camera = new THREE.PerspectiveCamera(CAM.overview.fov, width / height, 0.1, 300);

  // ── Ánh sáng anime ấm áp & bóng nhuộm xanh ngọc (theo Sado) ──
  const hemi = new THREE.HemisphereLight(0x8cc4d8, 0x62804c, 1.15);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xffeed4, 2.3);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const S = 14;
  Object.assign(sun.shadow.camera, { left: -S, right: S, top: S, bottom: -S, near: 1, far: 90 });
  sun.shadow.bias = -0.0003;
  sun.shadow.normalBias = 0.03;
  sun.shadow.radius = 2.5;
  sun.position.set(15, PLANET_R + 25, 10);
  sun.target.position.set(0, PLANET_R, 0);
  scene.add(sun);
  scene.add(sun.target);

  // Rim light ấm tạo viền sáng ven cho nhân vật & công trình
  const rim = new THREE.DirectionalLight(0xffe2c4, 0.55);
  rim.position.set(-20, -10, -15);
  scene.add(rim);

  // ── Hành tinh & Nước ──
  const planet = createPlanetMesh();
  worldRoot.add(planet);

  const water = createWaterMesh();
  worldRoot.add(water);

  const sky = createSkyMesh(dest);
  scene.add(sky);

  // ── Rừng rậm ──
  initScatter(dest);
  const forest = populateForest();
  worldRoot.add(forest);

  const scatterGroups = forest.children as THREE.Group[];
  const scatterCounts = scatterGroups.map((group) => group.children.flatMap((child) =>
    (child as THREE.InstancedMesh).isInstancedMesh ? [(child as THREE.InstancedMesh).count] : []
  ));

  function setFloraLOD(mode: 'overview' | 'walk') {
    // In walk mode, display the full richness of trees, matsus, pines, bushes, grass and flowers.
    // Scatter already filters flora away from stages, and occlusion dither prevents camera blocking.
    scatterGroups.forEach((group, groupIndex) => {
      let childIndex = 0;
      group.children.forEach((child) => {
        const mesh = child as THREE.InstancedMesh;
        if (!mesh.isInstancedMesh) return;
        const fullCount = scatterCounts[groupIndex][childIndex++] || 0;
        // In overview, reduce dense grass/flowers count slightly for silky 60fps globe rotation
        const mult = mode === 'walk' ? 1.0 : (groupIndex >= 9 ? 0.2 : 0.85);
        mesh.count = Math.round(fullCount * mult);
      });
      group.visible = true;
    });
  }
  setFloraLOD('overview');

  // ── Đời sống sinh động (Life Actors) ──
  const butterflies = createButterflyGroup();
  worldRoot.add(butterflies.group);

  const gulls = createGullsGroup();
  worldRoot.add(gulls.group);

  const poles = (dest.paths && dest.paths.length)
    ? createTelephonePolesAlongPath(dest.paths.flat(), PLANET_R)
    : null;
  if (poles) {
    poles.visible = false;
    worldRoot.add(poles);
  }

  // ── Quần chúng đi bộ & dạo chơi (Walking Crowd) ──
  const crowd = createWalkingCrowd(dest, PLANET_R);
  crowd.group.visible = false;
  worldRoot.add(crowd.group);

  // ── Nhân vật chính & Điều khiển ──
  const character = new Character();
  worldRoot.add(character.mesh);

  const controller = new Controller(dest);
  character.mesh.position.copy(controller.pos);
  character.mesh.quaternion.copy(controller.quat);
  character.mesh.visible = true; // Luôn thấy nhân vật chính trên hành tinh!

  // Visual marker for click-to-move
  const targetMarker = new TargetMarker();
  worldRoot.add(targetMarker.group);

  controller.onTargetChanged = (target) => {
    if (target) {
      targetMarker.show(target);
    } else {
      targetMarker.hide();
    }
  };
  controller.onTargetReached = () => {
    targetMarker.hide();
  };

  const keyboard = new Keyboard();
  keyboard.onMoveKeyPressed(() => {
    controller.cancelTarget();
  });

  const cameraRig = new CameraRig(camera, opts.container);
  cameraRig.mode = 'overview';
  cameraRig.setExternalOverviewControl(true);
  cameraRig.setOverviewImmediate();

  // Raycast click-to-move on planet surface
  const groundRaycaster = new THREE.Raycaster();
  const groundMouseVec = new THREE.Vector2();

  cameraRig.onGroundClick = (screenX: number, screenY: number) => {
    if (currentMode !== 'walk') return;
    const rect = opts.container.getBoundingClientRect();
    groundMouseVec.x = ((screenX - rect.left) / rect.width) * 2 - 1;
    groundMouseVec.y = -((screenY - rect.top) / rect.height) * 2 + 1;
    groundRaycaster.setFromCamera(groundMouseVec, camera);

    const hits = groundRaycaster.intersectObject(planet, false);
    if (hits.length > 0) {
      const hitDir = hits[0].point.clone().normalize();
      controller.setTargetDir(hitDir);
    }
  };

  let isEPressed = false;
  const onKeyDownGlobal = (e: KeyboardEvent) => {
    if (e.code === 'KeyE') isEPressed = true;
    if (e.code === 'KeyM') {
      setWorldMode(currentMode === 'walk' ? 'overview' : 'walk');
    }
    if (e.code === 'F1') {
      e.preventDefault();
      collisionSystem.toggleDebug();
    }
    if (e.code === 'Escape' || e.code === 'KeyX') {
      if (currentMode === 'walk') {
        setWorldMode('overview');
      }
    }
  };
  window.addEventListener('keydown', onKeyDownGlobal);

  const poiManager = new PoiManager(dest, worldRoot, opts.checkedIn, opts.events.onPoiNear, opts.events.onOpenPhoto);

  // Luôn hiển thị các địa danh 3D đầy đủ để tạo cảm giác sa bàn sống động như Đảo Ký Ức
  poiManager.landmarks.visible = true;
  poiManager.overviewLandmarks.visible = false;
  poiManager.overviewRoutes.visible = false;

  // DOM labels need world anchors but never a second canvas label. These empty
  // objects sit just over each overview landmark, then their world positions
  // are projected to CSS pixels in the animation loop below.
  const globeLabelAnchors = dest.stages.map((stage, index) => {
    const anchor = new THREE.Object3D();
    anchor.position.copy(poiManager.stageDirs[index]).multiplyScalar(PLANET_R + 3.65);
    worldRoot.add(anchor);
    return { stage, anchor };
  });

  const destinationCenter = poiManager.stageDirs.reduce((sum, dir) => sum.add(dir), new THREE.Vector3()).normalize();
  const initialGlobeRotation = new THREE.Quaternion().setFromUnitVectors(destinationCenter, camera.position.clone().normalize());
  worldRoot.quaternion.copy(initialGlobeRotation);
  let globeVelocityX = 0;
  let globeVelocityY = 0;
  let lastGlobeInput = 0;
  let pointerId: number | null = null;
  let pointerX = 0;
  let pointerY = 0;
  let pinchDistance = 0;
  const activePointers = new Map<number, { x: number; y: number }>();
  const labelLayout = new Map<string, { x: number; y: number }>();
  let selectedPoi: string | null = null;
  let focusStartedAt = 0;
  let focusCompletionTimer: number | null = null;
  const focusFrom = new THREE.Quaternion();
  const focusTo = new THREE.Quaternion();

  const rotateGlobe = (dx: number, dy: number) => {
    _globeUp.set(0, 1, 0);
    _globeRight.set(1, 0, 0).applyQuaternion(camera.quaternion);
    worldRoot.rotateOnWorldAxis(_globeUp, dx * 0.006);
    worldRoot.rotateOnWorldAxis(_globeRight, dy * 0.005);
    globeVelocityX = dx * 0.006;
    globeVelocityY = dy * 0.005;
    lastGlobeInput = performance.now();
  };
  const onGlobePointerDown = (event: PointerEvent) => {
    if (currentMode !== 'overview') return;
    activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    pointerId = event.pointerId;
    pointerX = event.clientX;
    pointerY = event.clientY;
    renderer.domElement.setPointerCapture(event.pointerId);
  };
  const onGlobePointerMove = (event: PointerEvent) => {
    if (currentMode !== 'overview' || !activePointers.has(event.pointerId)) return;
    activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const pointers = [...activePointers.values()];
    if (pointers.length === 2) {
      const nextDistance = Math.hypot(pointers[0].x - pointers[1].x, pointers[0].y - pointers[1].y);
      if (pinchDistance) cameraRig.zoomOverview((pinchDistance - nextDistance) * 0.16);
      pinchDistance = nextDistance;
      return;
    }
    if (event.pointerId !== pointerId) return;
    rotateGlobe(event.clientX - pointerX, event.clientY - pointerY);
    pointerX = event.clientX;
    pointerY = event.clientY;
  };
  const onGlobePointerUp = (event: PointerEvent) => {
    activePointers.delete(event.pointerId);
    if (activePointers.size < 2) pinchDistance = 0;
    if (event.pointerId === pointerId) pointerId = null;
  };
  const onGlobeWheel = (event: WheelEvent) => {
    if (currentMode !== 'overview') return;
    event.preventDefault();
    cameraRig.zoomOverview(event.deltaY * 0.08);
  };
  renderer.domElement.addEventListener('pointerdown', onGlobePointerDown);
  renderer.domElement.addEventListener('pointermove', onGlobePointerMove);
  renderer.domElement.addEventListener('pointerup', onGlobePointerUp);
  renderer.domElement.addEventListener('pointercancel', onGlobePointerUp);
  renderer.domElement.addEventListener('wheel', onGlobeWheel, { passive: false });

  // ── Shader warm-up (mục 4.2#2): compile + render 2 khung ẩn ──
  renderer.compile(scene, camera);
  renderer.render(scene, camera);
  renderer.shadowMap.needsUpdate = true;
  renderer.render(scene, camera);

  let isDisposed = false;
  let isPaused = false;
  // Manual timing instead of THREE.Clock (deprecated)
  let prevTime = performance.now();
  let elapsedTime = 0;

  // ── Fog animation state ──
  let targetFogDensity = 0; // overview = 0
  let currentMode: 'walk' | 'overview' = 'overview';

  // Shadow texel snapping state (mục 4.2#8)
  // Re-rendering a large shadow map while walking was the primary source of
  // hitching. A 1024 map refreshed after a meaningful move stays crisp enough
  // for this miniature scale while avoiding a shadow pass every few frames.
  const shadowUpdateDistance = 0.35;

  // ── Adaptive DPR (mục 4.4) ──
  // Retina canvas labels remain crisp at 1.25 while this avoids a costly 2x render target on integrated GPUs.
  const maxDPR = 1;
  let currentDPR = maxDPR;
  let frameTimes: number[] = [];
  let perfSamples: number[] = [];
  let lastPerfReport = performance.now();
  let fastFrameCount = 0;
  const DPR_MEASURE_WINDOW = 60;
  const DPR_FAST_THRESHOLD = 120;
  let lastFrameStart = performance.now();

  // Fixed Timestep Accumulator (Mục 7)
  const FIXED_DT = 1 / 60;
  let physicsAccumulator = 0;

  function animate() {
    if (isDisposed) return;
    requestAnimationFrame(animate);

    if (!isPaused) {
      const now = performance.now();
      const rawDt = (now - prevTime) / 1000;
      prevTime = now;
      const dt = Math.min(rawDt, 0.05); // Clamp dt to prevent teleport jumps (Mục 7)
      elapsedTime += dt;
      const time = elapsedTime;

      // Fixed Timestep Accumulator for Physics & Controller (Mục 7)
      // Save state before stepping for interpolation (anti-jitter)
      controller.saveState();
      physicsAccumulator += dt;
      const maxSubSteps = 4;
      let subSteps = 0;
      while (physicsAccumulator >= FIXED_DT && subSteps < maxSubSteps) {
        controller.update(FIXED_DT, keyboard, cameraRig.camFwd);
        physicsAccumulator -= FIXED_DT;
        subSteps++;
      }
      if (subSteps >= maxSubSteps) {
        physicsAccumulator = 0;
      }

      // Interpolate between previous and current physics state for smooth rendering
      const alpha = physicsAccumulator / FIXED_DT;
      controller.interpolate(alpha);

      targetMarker.update(dt);
      character.update(dt, controller.moving);

      character.mesh.position.copy(controller.renderPos);
      character.mesh.quaternion.copy(controller.renderQuat);

      poiManager.update(controller.dir, isEPressed);
      isEPressed = false;

      if (cameraRig.mode === 'walk') {
        cameraRig.updateWalk(dt, controller, poiManager.nearStageFocus);
      } else if (cameraRig.mode === 'overview') {
        cameraRig.updateOverview(dt);
        if (selectedPoi) {
          const focusElapsed = now - focusStartedAt;
          const progress = Math.min(1, focusElapsed / 900);
          const eased = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
          worldRoot.quaternion.slerpQuaternions(focusFrom, focusTo, eased);
          // Use elapsed time rather than a float equality check. In throttled
          // browser tabs the final animation sample can otherwise be skipped,
          // leaving the selected destination spinning forever on the globe.
          if (focusElapsed >= 900) {
            finishPoiFocus();
          }
        } else if (!pointerId && now - lastGlobeInput > 1200) {
          worldRoot.rotateOnWorldAxis(_globeUp, dt * 0.055);
        } else if (!pointerId) {
          worldRoot.rotateOnWorldAxis(_globeUp, globeVelocityX * dt * 5);
          worldRoot.rotateOnWorldAxis(_globeRight, globeVelocityY * dt * 5);
          globeVelocityX *= Math.exp(-dt * 4);
          globeVelocityY *= Math.exp(-dt * 4);
        }
      }

      // ── Update globe labels only while the globe is on screen ──
      if (currentMode === 'overview') {
        const viewportWidth = opts.container.clientWidth;
        const viewportHeight = opts.container.clientHeight;
        worldRoot.updateMatrixWorld();
        _cameraDirection.copy(camera.position).normalize();
        const frameLabels = globeLabelAnchors.map(({ stage, anchor }) => {
        anchor.getWorldPosition(_labelWorld);
        const frontFacing = _labelWorld.normalize().dot(_cameraDirection) > 0.08;
        _labelProjection.copy(anchor.getWorldPosition(_labelWorld)).project(camera);
        return {
          id: stage.id,
          index: stage.index,
          name: stage.name.vi,
          x: (_labelProjection.x + 1) * 0.5 * viewportWidth,
          y: (1 - _labelProjection.y) * 0.5 * viewportHeight - 28,
          visible: currentMode === 'overview' && frontFacing && Math.abs(_labelProjection.x) < 1.12 && Math.abs(_labelProjection.y) < 1.12,
          depth: _labelWorld.dot(_cameraDirection),
        };
        }).sort((a, b) => b.depth - a.depth);
        const placed: Array<{ x: number; y: number }> = [];
        const reportedLabels = frameLabels.map((label, index) => {
        let x = THREE.MathUtils.clamp(label.x, 96, viewportWidth - 96);
        let y = THREE.MathUtils.clamp(label.y, 38, viewportHeight - 60);
        if (label.visible) {
          for (const prior of placed) {
            if (Math.abs(x - prior.x) < 172 && Math.abs(y - prior.y) < 38) {
              y = Math.max(38, prior.y - 42);
              x = THREE.MathUtils.clamp(x + (index % 2 ? 30 : -30), 96, viewportWidth - 96);
            }
          }
          placed.push({ x, y });
        }
        const previous = labelLayout.get(label.id) || { x, y };
        const smooth = { x: THREE.MathUtils.lerp(previous.x, x, 0.2), y: THREE.MathUtils.lerp(previous.y, y, 0.2) };
        labelLayout.set(label.id, smooth);
        return { id: label.id, index: label.index, name: label.name, x: smooth.x, y: smooth.y, visible: label.visible };
        });
        opts.events.onGlobeLabels?.(reportedLabels);
      }

      // ── Animate fog density smoothly (mục 4.2#3) ──
      fog.density += (targetFogDensity - fog.density) * (1 - Math.exp(-dt * 3));

      // ── Update sun with texel snapping (mục 4.2#8) ──
      if (currentMode === 'walk') {
        _left.crossVectors(controller.dir, cameraRig.camFwd);
        _sunDir.copy(controller.dir).multiplyScalar(0.75).addScaledVector(_left, 0.4).addScaledVector(cameraRig.camFwd, -0.3).normalize();
        
        const newSunPos = _headPos.copy(controller.pos).addScaledVector(_sunDir, 45);
        const moveDist = newSunPos.distanceTo(sun.position);
        
        // Snap to texel grid to prevent shadow "swimming" (mục 4.2#8)
        if (moveDist > shadowUpdateDistance) {
          sun.position.copy(newSunPos);
          // Snap target
          sun.target.position.copy(controller.pos);
          sun.target.updateMatrixWorld();
          renderer.shadowMap.needsUpdate = true;
        }
      }

      // ── Update Dither Uniforms (reuse temps — mục 4.2#7) ──
      if (opts.container) {
        const w = opts.container.clientWidth;
        const h = opts.container.clientHeight;
        ditherUniforms.uRes.value.set(w, h);
        ditherUniforms.uAspect.value = w / h;
      }
      _headPos.copy(character.mesh.position).addScaledVector(controller.dir, 0.7);
      _ndcPos.copy(_headPos).project(camera);
      ditherUniforms.uPlayerNDC.value.set(_ndcPos.x, _ndcPos.y);
      _headView.copy(_headPos).applyMatrix4(camera.matrixWorldInverse);
      ditherUniforms.uPlayerDepth.value = -_headView.z;

      // ── Update shader time ──
      waterUniforms.uTime.value = time;
      terrainUniforms.uTime.value = time;
      skyUniforms.uTime.value = time;
      poiManager.updateTime(time, dt, character.mesh.position);
      updateWindTime(time);
      updateSky(sky as THREE.Group, time, currentMode);

      // ── Living Actors ──
      butterflies.update(time);
      gulls.update(time);
      crowd.update(dt, controller.pos);

      // ── Update Occlusion Dither Uniforms ──
      occUniforms.uCamPos.value.copy(camera.position);
      occUniforms.uFocus.value.copy(character.mesh.position).addScaledVector(controller.dir, 0.7);
      occUniforms.uOcclude.value = currentMode === 'walk' ? 1.0 : 0.0;
    }

    renderer.render(scene, camera);

    // ── Adaptive DPR measurement (mục 4.4) ──
    const frameEnd = performance.now();
    const frameMs = frameEnd - lastFrameStart;
    lastFrameStart = frameEnd;
    frameTimes.push(frameMs);
    perfSamples.push(frameMs);
    if (perfSamples.length > 240) perfSamples.shift();
    if (frameTimes.length > DPR_MEASURE_WINDOW) {
      const avg = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
      frameTimes = [];
      if (avg > 20 && currentDPR > 1.0) {
        currentDPR = Math.max(1.0, currentDPR - 0.25);
        renderer.setPixelRatio(currentDPR);
        fastFrameCount = 0;
      } else if (avg < 12) {
        fastFrameCount += DPR_MEASURE_WINDOW;
        if (fastFrameCount >= DPR_FAST_THRESHOLD && currentDPR < maxDPR) {
          currentDPR = Math.min(maxDPR, currentDPR + 0.25);
          renderer.setPixelRatio(currentDPR);
          fastFrameCount = 0;
        }
      } else {
        fastFrameCount = 0;
      }
    }

    if (opts.events.onPerf && frameEnd - lastPerfReport >= 750 && perfSamples.length) {
      const sorted = [...perfSamples].sort((a, b) => a - b);
      const p95 = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))];
      const average = perfSamples.reduce((sum, value) => sum + value, 0) / perfSamples.length;
      opts.events.onPerf({
        buildMs: buildStart ? Math.round(buildReadyAt - buildStart) : 0,
        fps: Math.round(1000 / average),
        p95FrameMs: Math.round(p95 * 10) / 10,
        calls: renderer.info.render.calls,
        triangles: renderer.info.render.triangles,
        programs: renderer.info.programs?.length || 0,
        dpr: Math.round(currentDPR * 100) / 100,
        builds: buildNumber,
      });
      lastPerfReport = frameEnd;
    }
  }

  // Handle Resize
  const handleResize = () => {
    if (!opts.container) return;
    const w = opts.container.clientWidth;
    const h = opts.container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener('resize', handleResize);

  // ── Start loop ──
  const buildReadyAt = performance.now();
  opts.events.onProgress(1.0);
  opts.events.onReady();
  prevTime = performance.now();
  animate();

  function setWorldMode(m: 'walk' | 'overview') {
    cameraRig.startTransition();
    cameraRig.mode = m;
    currentMode = m;

    if (m === 'overview') {
      poiManager.setActiveStage(null);
      opts.events.onGlobeLabels?.([]);
      worldRoot.quaternion.copy(initialGlobeRotation);
      cameraRig.setExternalOverviewControl(true);
      targetFogDensity = 0;
      camera.fov = CAM.overview.fov;
      // Cả nhân vật chính lẫn các danh lam thắng cảnh đều luôn hiển thị!
      character.mesh.visible = true;
      poiManager.landmarks.visible = true;
      poiManager.overviewLandmarks.visible = false;
      poiManager.overviewRoutes.visible = false;
      if (poles) poles.visible = false;
      crowd.group.visible = false;
      setFloraLOD('overview');
    } else {
      // Khi đi dạo: trả góc quay globe về identity để đồng bộ hoàn toàn với Camera và Player
      worldRoot.quaternion.identity();
      cameraRig.setExternalOverviewControl(false);
      targetFogDensity = dest.sky.fogDensity;
      camera.fov = CAM.walk.fov;
      character.mesh.visible = true;
      poiManager.landmarks.visible = true;
      poiManager.overviewLandmarks.visible = false;
      poiManager.overviewRoutes.visible = false;
      if (poles) poles.visible = true;
      crowd.group.visible = true;
      opts.events.onGlobeLabels?.([]);
      setFloraLOD('walk');
      renderer.shadowMap.needsUpdate = true;
    }
    camera.updateProjectionMatrix();
    opts.events.onModeChange?.(m);
  }

  function goToNow(poiId: string) {
    const index = dest.stages.findIndex(stage => stage.id === poiId);
    if (index < 0) return;
    const stage = dest.stages[index];
    poiManager.setActiveStage(poiId);
    const stageDir = poiManager.stageDirs[index];

    // Reset góc quay quả địa cầu về chuẩn trước khi đặt vị trí nhân vật
    worldRoot.quaternion.identity();

    const spawn = stage.spawnOffset || {
      bearing: 0,
      dist: Math.min(6.5, Math.max(3.5, stage.flatR * 0.72)),
    };

    _stageOrientation.setFromUnitVectors(_spawnNorth, stageDir);
    _stageForward.set(0, 0, 1).applyQuaternion(_stageOrientation).applyAxisAngle(stageDir, spawn.bearing).normalize();
    _spawnAxis.crossVectors(stageDir, _stageForward).normalize();
    controller.dir.copy(stageDir).applyAxisAngle(_spawnAxis, -spawn.dist / PLANET_R).normalize();
    controller.heading.copy(stageDir).sub(_headPos.copy(controller.dir).multiplyScalar(stageDir.dot(controller.dir))).normalize();

    cameraRig.camFwd.copy(controller.heading);
    cameraRig.pitch = CAM.walk.pitch;
    controller.h = 0;
    controller.moving = false;
    controller.syncTransform();
    character.mesh.position.copy(controller.pos);
    character.mesh.quaternion.copy(controller.quat);

    setWorldMode('walk');
  }

  // Do not make entering a place depend exclusively on an animation frame.
  function finishPoiFocus() {
    if (!selectedPoi) return;
    const poi = selectedPoi;
    selectedPoi = null;
    if (focusCompletionTimer !== null) {
      window.clearTimeout(focusCompletionTimer);
      focusCompletionTimer = null;
    }
    worldRoot.quaternion.identity();
    goToNow(poi);
  }

  function goTo(poiId: string) {
    if (currentMode !== 'overview') {
      goToNow(poiId);
      return;
    }
    const index = dest.stages.findIndex(stage => stage.id === poiId);
    if (index < 0) return;
    selectedPoi = poiId;
    focusStartedAt = performance.now();
    if (focusCompletionTimer !== null) window.clearTimeout(focusCompletionTimer);
    focusCompletionTimer = window.setTimeout(finishPoiFocus, 940);
    focusFrom.copy(worldRoot.quaternion);
    focusTo.setFromUnitVectors(poiManager.stageDirs[index], camera.position.clone().normalize());
  }

  return {
    goTo(poiId: string) {
      goTo(poiId);
    },
    setMode(m: 'walk' | 'overview') {
      if (m === 'walk' && poiManager.activeStageIndex === null) {
        goToNow(dest.stages[0].id);
      } else {
        setWorldMode(m);
      }
    },
    setPaused(p: boolean) {
      isPaused = p;
      if (!p) prevTime = performance.now(); // reset delta
    },
    setCheckedIn(ids: string[]) {
      poiManager.setCheckedIn(ids);
    },
    dispose() {
      isDisposed = true;
      if (focusCompletionTimer !== null) window.clearTimeout(focusCompletionTimer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', onKeyDownGlobal);
      renderer.domElement.removeEventListener('pointerdown', onGlobePointerDown);
      renderer.domElement.removeEventListener('pointermove', onGlobePointerMove);
      renderer.domElement.removeEventListener('pointerup', onGlobePointerUp);
      renderer.domElement.removeEventListener('pointercancel', onGlobePointerUp);
      renderer.domElement.removeEventListener('wheel', onGlobeWheel);
      keyboard.dispose();
      cameraRig.dispose();
      renderer.dispose();
      opts.container.removeChild(renderer.domElement);
    }
  };
}
