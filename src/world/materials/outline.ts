import * as THREE from 'three';
import { C } from '../config/palette';
import { OUTLINE_THICK } from '../config/constants';
import { computeOutlineNormals, getOutlineMaterial } from './toon';

export function makeOutlineGeometry(src: THREE.BufferGeometry): THREE.BufferGeometry {
  return computeOutlineNormals(src);
}

export const outlineMat = getOutlineMaterial(OUTLINE_THICK, C.ink);

export { computeOutlineNormals, getOutlineMaterial };
