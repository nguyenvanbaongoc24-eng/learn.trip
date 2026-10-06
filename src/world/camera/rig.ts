import * as THREE from 'three';
import { CAM, PLANET_R, WATER_LEVEL } from '../config/constants';
import { heightAt } from '../planet/terrain';

const tmp = new THREE.Vector3();
const tmp2 = new THREE.Vector3();
const desired = new THREE.Vector3();
const look = new THREE.Vector3();
const overviewPos = new THREE.Vector3();
const headPos = new THREE.Vector3();
const rayDir = new THREE.Vector3();

const DRAG_THRESHOLD = 5;

export class CameraRig {
  camera: THREE.PerspectiveCamera;
  camFwd: THREE.Vector3;
  smoothUp: THREE.Vector3;
  pitch: number;
  dist: number;
  targetDist: number;
  mode: 'walk' | 'overview' = 'walk';
  dragDX: number = 0;
  dragDY: number = 0;
  isDragging: boolean = false;
  lastX: number = 0;
  lastY: number = 0;

  // Click vs Drag detection
  private pointerDownX: number = 0;
  private pointerDownY: number = 0;
  private hasExceededDrag: boolean = false;
  private activePointers = new Map<number, { x: number; y: number }>();
  private pinchDistance: number = 0;

  // Overview orbital state
  private ovTheta: number = 0.3;
  private ovPhi: number = 1.05;
  private ovDist: number = CAM.overview.dist;
  private ovAutoSpeed: number = 0.08;
  private ovDragPause: number = 0;
  private externalOverviewControl = false;

  // Transition blending
  private transitionT: number = 0;
  private prevPos = new THREE.Vector3();
  private prevUp = new THREE.Vector3(0, 1, 0);
  private transitioning: boolean = false;

  private container: HTMLElement;

  // Click on ground callback (for Click-to-Move)
  onGroundClick?: (screenX: number, screenY: number) => void;

  constructor(camera: THREE.PerspectiveCamera, container: HTMLElement) {
    this.camera = camera;
    this.camFwd = new THREE.Vector3(0, 0, -1);
    this.smoothUp = new THREE.Vector3(0, 1, 0);
    this.pitch = CAM.walk.pitch;
    this.dist = CAM.walk.dist;
    this.targetDist = CAM.walk.dist;
    this.container = container;

    container.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointermove', this.onPointerMove);
    container.addEventListener('wheel', this.onWheel, { passive: false });
  }

  onPointerDown = (e: PointerEvent) => {
    this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    this.isDragging = true;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    this.pointerDownX = e.clientX;
    this.pointerDownY = e.clientY;
    this.hasExceededDrag = false;
  };

  onPointerUp = (e: PointerEvent) => {
    this.activePointers.delete(e.pointerId);
    if (this.activePointers.size < 2) {
      this.pinchDistance = 0;
    }

    if (this.isDragging && !this.hasExceededDrag && this.mode === 'walk') {
      // Clean click detected! Trigger click-to-move
      this.onGroundClick?.(e.clientX, e.clientY);
    }

    this.isDragging = false;
    this.hasExceededDrag = false;
  };

  onPointerMove = (e: PointerEvent) => {
    if (!this.activePointers.has(e.pointerId)) return;
    this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // Multi-touch pinch zoom
    const pointers = [...this.activePointers.values()];
    if (pointers.length === 2) {
      const currentDist = Math.hypot(pointers[0].x - pointers[1].x, pointers[0].y - pointers[1].y);
      if (this.pinchDistance > 0) {
        const delta = (this.pinchDistance - currentDist) * 0.02;
        if (this.mode === 'walk') {
          this.targetDist = THREE.MathUtils.clamp(
            this.targetDist + delta,
            CAM.walk.minDist,
            CAM.walk.maxDist
          );
        }
      }
      this.pinchDistance = currentDist;
      return;
    }

    if (this.isDragging) {
      const moveDist = Math.hypot(e.clientX - this.pointerDownX, e.clientY - this.pointerDownY);
      if (moveDist > DRAG_THRESHOLD) {
        this.hasExceededDrag = true;
      }

      this.dragDX += e.clientX - this.lastX;
      this.dragDY += e.clientY - this.lastY;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
    }
  };

  onWheel = (e: WheelEvent) => {
    e.preventDefault();
    if (this.mode === 'overview' && !this.externalOverviewControl) {
      this.ovDist = THREE.MathUtils.clamp(
        this.ovDist + e.deltaY * 0.08,
        PLANET_R + 15,
        PLANET_R + 90
      );
    } else if (this.mode === 'walk') {
      // Smooth zoom damping target
      this.targetDist = THREE.MathUtils.clamp(
        this.targetDist + e.deltaY * 0.006,
        CAM.walk.minDist,
        CAM.walk.maxDist
      );
    }
  };

  setExternalOverviewControl(active: boolean) {
    this.externalOverviewControl = active;
  }

  zoomOverview(delta: number) {
    this.ovDist = THREE.MathUtils.clamp(this.ovDist + delta, PLANET_R + 70, PLANET_R + 130);
    this.setOverviewImmediate();
  }

  dispose() {
    this.container.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointermove', this.onPointerMove);
    this.container.removeEventListener('wheel', this.onWheel);
    this.activePointers.clear();
  }

  startTransition() {
    this.prevPos.copy(this.camera.position);
    this.prevUp.copy(this.camera.up);
    this.transitionT = 1;
    this.transitioning = true;
  }

  setOverviewImmediate() {
    const pos = this.getOverviewPos();
    this.camera.position.copy(pos);
    this.camera.up.set(0, 1, 0);
    this.camera.lookAt(0, 0, 0);
  }

  private getOverviewPos(): THREE.Vector3 {
    const x = this.ovDist * Math.sin(this.ovPhi) * Math.cos(this.ovTheta);
    const y = this.ovDist * Math.cos(this.ovPhi);
    const z = this.ovDist * Math.sin(this.ovPhi) * Math.sin(this.ovTheta);
    return overviewPos.set(x, y, z);
  }

  updateOverview(dt: number) {
    if (this.externalOverviewControl) {
      this.dragDX = 0;
      this.dragDY = 0;
      return;
    }

    if (this.isDragging && (Math.abs(this.dragDX) > 0.5 || Math.abs(this.dragDY) > 0.5)) {
      this.ovTheta -= this.dragDX * 0.005;
      this.ovPhi = THREE.MathUtils.clamp(this.ovPhi - this.dragDY * 0.005, 0.3, 2.6);
      this.ovDragPause = 2.0;
    }
    this.dragDX = 0;
    this.dragDY = 0;

    if (this.ovDragPause > 0) {
      this.ovDragPause -= dt;
    } else {
      this.ovTheta += this.ovAutoSpeed * dt;
    }

    const targetPos = this.getOverviewPos();

    if (this.transitioning && this.transitionT > 0.01) {
      this.transitionT *= Math.exp(-dt * 3.5);
      this.camera.position.lerpVectors(targetPos, this.prevPos, this.transitionT);
      this.camera.up.set(0, 1, 0).lerp(this.prevUp, this.transitionT).normalize();
    } else {
      this.transitioning = false;
      this.transitionT = 0;
      this.camera.position.lerp(targetPos, 1 - Math.exp(-dt * 8));
      this.camera.up.set(0, 1, 0);
    }

    this.camera.lookAt(0, 0, 0);
  }

  updateWalk(dt: number, player: any, nearStageFocus: THREE.Vector3 | null = null) {
    const up = player.dir;

    if (this.transitioning && this.transitionT > 0.01) {
      this.transitionT *= Math.exp(-dt * 7.0);
    } else {
      this.transitioning = false;
      this.transitionT = 0;
    }

    // Keep camera forward in tangent plane
    this.camFwd.sub(tmp.copy(up).multiplyScalar(this.camFwd.dot(up))).normalize();

    // Orbit camera with mouse drag
    this.camFwd.applyAxisAngle(up, -this.dragDX * 0.005);
    this.pitch = Math.max(0.06, Math.min(1.08, this.pitch + this.dragDY * 0.004));
    this.dragDX = 0;
    this.dragDY = 0;

    // Smooth zoom distance damping (Mục 6)
    this.dist += (this.targetDist - this.dist) * (1 - Math.exp(-dt * 12.0));

    // Auto-align camera behind player when moving
    if (player.moving) {
      this.camFwd.lerp(player.heading, 1 - Math.exp(-dt * 1.8)).normalize();
    }

    const back = tmp.copy(this.camFwd).negate();
    // Use interpolated position for jitter-free camera (renderPos falls back to pos)
    const pPos = player.renderPos ?? player.pos;
    headPos.copy(pPos).addScaledVector(up, CAM.walk.lift);

    // Ideal camera position
    desired.copy(pPos)
      .addScaledVector(back, this.dist * Math.cos(this.pitch))
      .addScaledVector(up, this.dist * Math.sin(this.pitch) + CAM.walk.lift);

    // Camera Collision Avoidance (Chống đâm xuyên mặt đất & vách núi — Mục 6)
    rayDir.subVectors(desired, headPos);
    const fullDist = rayDir.length();
    rayDir.normalize();

    let safeDist = fullDist;
    // Probe 5 points along camera ray to ensure line-of-sight is unobstructed
    for (let i = 1; i <= 5; i++) {
      const t = i / 5;
      const probeP = tmp.copy(headPos).addScaledVector(rayDir, fullDist * t);
      const probeDir = tmp2.copy(probeP).normalize();
      const groundR = PLANET_R + Math.max(heightAt(probeDir), WATER_LEVEL) + 0.45;
      if (probeP.length() < groundR) {
        // Obstructed! Pull camera in closer to player head
        safeDist = Math.max(CAM.walk.minDist, fullDist * (t * 0.85));
        break;
      }
    }
    if (safeDist < fullDist) {
      desired.copy(headPos).addScaledVector(rayDir, safeDist);
    }

    // Ensure camera stays above minimum planet elevation
    const cd = tmp2.copy(desired).normalize();
    const minR = PLANET_R + Math.max(heightAt(cd), WATER_LEVEL) + 0.85;
    if (desired.length() < minR) {
      desired.setLength(minR);
    }

    // Frame-rate independent damping without jitter
    if (this.transitioning) {
      this.camera.position.lerpVectors(this.prevPos, desired, 1 - this.transitionT);
      this.smoothUp.lerp(up, 1 - Math.exp(-dt * 5)).normalize();
      this.camera.up.copy(this.smoothUp);
    } else {
      this.camera.position.lerp(desired, 1 - Math.exp(-dt * 10.0));
      this.smoothUp.lerp(up, 1 - Math.exp(-dt * 12.0)).normalize();
      this.camera.up.copy(this.smoothUp);
    }

    // Target look-at
    const defaultLook = look.copy(pPos).addScaledVector(up, 1.25).addScaledVector(this.camFwd, CAM.walk.lookAhead);
    if (nearStageFocus) {
      defaultLook.lerp(nearStageFocus, 1 - Math.exp(-dt * 4));
    }
    this.camera.lookAt(defaultLook);
  }
}
