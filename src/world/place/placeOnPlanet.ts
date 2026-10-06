import * as THREE from 'three';
import { heightAt } from '../planet/terrain';
import { PLANET_R } from '../config/constants';

const UP = new THREE.Vector3(0, 1, 0);

export function placeOnPlanet(obj: THREE.Object3D, dir: THREE.Vector3, yaw = 0, lift = 0) {
  obj.position.copy(dir).multiplyScalar(PLANET_R + heightAt(dir) + lift);
  obj.quaternion.setFromUnitVectors(UP, dir)
    .multiply(new THREE.Quaternion().setFromAxisAngle(UP, yaw));
}

export function getPlanetMatrix(dir: THREE.Vector3, yaw = 0, scale = 1, lift = 0): THREE.Matrix4 {
  const pos = dir.clone().multiplyScalar(PLANET_R + heightAt(dir) + lift);
  const quat = new THREE.Quaternion().setFromUnitVectors(UP, dir)
    .multiply(new THREE.Quaternion().setFromAxisAngle(UP, yaw));
  const s = new THREE.Vector3(scale, scale, scale);
  return new THREE.Matrix4().compose(pos, quat, s);
}
