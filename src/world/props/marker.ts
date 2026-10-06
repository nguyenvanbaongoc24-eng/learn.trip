import * as THREE from 'three';
import { PLANET_R } from '../config/constants';
import { heightAt } from '../planet/terrain';

const UP = new THREE.Vector3(0, 1, 0);

export class TargetMarker {
  group: THREE.Group;
  private ring: THREE.Mesh;
  private dot: THREE.Mesh;
  private time = 0;
  visible = false;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'TargetMarker';
    this.group.visible = false;

    // Outer pulsing ring
    const ringGeo = new THREE.RingGeometry(0.35, 0.45, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x48b6b0,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    });
    this.ring = new THREE.Mesh(ringGeo, ringMat);
    this.group.add(this.ring);

    // Inner glowing dot
    const dotGeo = new THREE.CircleGeometry(0.12, 16);
    dotGeo.rotateX(-Math.PI / 2);
    const dotMat = new THREE.MeshBasicMaterial({
      color: 0xf5d654,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    });
    this.dot = new THREE.Mesh(dotGeo, dotMat);
    this.group.add(this.dot);
  }

  show(dir: THREE.Vector3) {
    const h = heightAt(dir);
    this.group.position.copy(dir).multiplyScalar(PLANET_R + h + 0.04);
    this.group.quaternion.setFromUnitVectors(UP, dir);
    this.visible = true;
    this.group.visible = true;
    this.time = 0;
  }

  hide() {
    this.visible = false;
    this.group.visible = false;
  }

  update(dt: number) {
    if (!this.visible) return;
    this.time += dt;

    // Pulse ring scale and opacity
    const scale = 1.0 + Math.sin(this.time * 5.0) * 0.15;
    this.ring.scale.set(scale, 1, scale);

    const ringMat = this.ring.material as THREE.MeshBasicMaterial;
    ringMat.opacity = 0.65 + Math.sin(this.time * 5.0) * 0.25;

    // Gentle rotate
    this.ring.rotation.y = this.time * 1.5;
  }
}
