import * as THREE from 'three';
import { rng } from '../core/rng';
import { getPlanetMatrix } from './placeOnPlanet';
import { heightAt, pathMask } from '../planet/terrain';
import { WATER_LEVEL, PLANET_R } from '../config/constants';
import { DestinationDef } from '../config/destinations';
import { dirFromLatLon } from '../interact/poiManager';
import {
  createTreeGeo,
  createPineGeo,
  createMatsuGeo,
  createFlamboyantGeo,
  createLagerstroemiaGeo,
  createBushGeo,
  createRockGeo,
  createBoulderGeo,
  createGrassGeo,
  createFlowerGeo,
  createPebbleGeo,
} from '../props/flora';
import { createWindMaterial, createInstancedToon, getToonMaterial } from '../materials/toon';

let _dest: DestinationDef | null = null;
const windUniforms = { uTime: { value: 0 } };

export function initScatter(dest: DestinationDef) {
  _dest = dest;
}

export function updateWindTime(time: number) {
  windUniforms.uTime.value = time;
}

function randomOnSphere(): THREE.Vector3 {
  const u = rng();
  const v = rng();
  const theta = u * 2.0 * Math.PI;
  const phi = Math.acos(2.0 * v - 1.0);
  return new THREE.Vector3().setFromSphericalCoords(1, phi, theta);
}

function filterPosition(dir: THREE.Vector3, h: number, isPebble = false): boolean {
  if (h < WATER_LEVEL + 0.08) return false;

  const pMask = pathMask(dir);
  if (isPebble) {
    if (pMask < 0.1 || pMask > 0.6) return false;
  } else {
    // Flora avoids walking path
    if (pMask > 0.15) return false;
  }

  if (!_dest) return true;
  for (const s of _dest.stages) {
    const sDir = dirFromLatLon(s.dir[0], s.dir[1]);
    // Clear area around landmark stage
    if (dir.angleTo(sDir) * PLANET_R < s.flatR * 1.35) return false;
  }
  return true;
}

function scatterType(
  geo: THREE.BufferGeometry,
  count: number,
  scaleMin: number,
  scaleMax: number,
  options: {
    useOutline?: boolean;
    outlineThick?: number;
    isPebble?: boolean;
    windStrength?: number;
    leafShader?: boolean;
    color?: number;
  } = {}
): THREE.Group {
  const group = new THREE.Group();
  const validDirs: Array<{ dir: THREE.Vector3; scale: number }> = [];

  let attempts = 0;
  const maxAttempts = count * 6;

  while (validDirs.length < count && attempts < maxAttempts) {
    attempts++;
    const dir = randomOnSphere();
    const h = heightAt(dir);
    if (filterPosition(dir, h, options.isPebble)) {
      const scale = scaleMin + rng() * (scaleMax - scaleMin);
      validDirs.push({ dir, scale });
    }
  }

  if (validDirs.length === 0) return group;

  const actualCount = validDirs.length;
  const mat = options.windStrength
    ? createWindMaterial(options.color ?? 0xffffff, windUniforms.uTime, {
        strength: options.windStrength,
        vertexColors: true,
        leaf: !!options.leafShader,
      })
    : getToonMaterial(options.color ?? 0xffffff, { vertexColors: true });

  const { mesh, outlineMesh } = createInstancedToon(geo, mat, actualCount, {
    outline: options.useOutline ? (options.outlineThick ?? 0.035) : 0,
    cast: true,
    receive: true,
  });

  for (let i = 0; i < actualCount; i++) {
    const item = validDirs[i];
    const rot = rng() * Math.PI * 2;
    const matrix = getPlanetMatrix(item.dir, rot, item.scale, 0);
    mesh.setMatrixAt(i, matrix);
  }

  mesh.instanceMatrix.needsUpdate = true;
  group.add(mesh);
  if (outlineMesh) {
    outlineMesh.instanceMatrix = mesh.instanceMatrix;
    outlineMesh.instanceMatrix.needsUpdate = true;
    group.add(outlineMesh);
  }

  return group;
}

export function populateForest(): THREE.Group {
  const root = new THREE.Group();

  // 1. Broadleaf & Iconic Hanoi Trees (Flamboyant Red, Lagerstroemia Purple, Variants 0, 1, 2)
  root.add(scatterType(createFlamboyantGeo(), 45, 0.8, 1.3, { useOutline: true, outlineThick: 0.018, windStrength: 0.045, leafShader: true }));
  root.add(scatterType(createLagerstroemiaGeo(), 40, 0.75, 1.25, { useOutline: true, outlineThick: 0.018, windStrength: 0.04, leafShader: true }));
  root.add(scatterType(createTreeGeo(0), 100, 0.75, 1.25, { useOutline: true, outlineThick: 0.018, windStrength: 0.04, leafShader: true }));
  root.add(scatterType(createTreeGeo(1), 80, 0.7, 1.2, { useOutline: true, outlineThick: 0.018, windStrength: 0.04, leafShader: true }));
  root.add(scatterType(createTreeGeo(2), 70, 0.65, 1.1, { useOutline: true, outlineThick: 0.018, windStrength: 0.035, leafShader: true }));

  // 2. Japanese Matsu (Bonsai Pine) & Conifer Pine
  root.add(scatterType(createMatsuGeo(), 50, 0.7, 1.15, { useOutline: true, outlineThick: 0.018, windStrength: 0.03, leafShader: true }));
  root.add(scatterType(createPineGeo(), 60, 0.7, 1.25, { useOutline: true, outlineThick: 0.018, windStrength: 0.025 }));

  // 3. Round Bushes (No harsh inverted outline at distance)
  root.add(scatterType(createBushGeo(), 220, 0.6, 1.1, { useOutline: false, windStrength: 0.05 }));

  // 4. Mossy Boulders & Small Rocks (No harsh inverted outline to prevent black dots at distance)
  root.add(scatterType(createBoulderGeo(0), 55, 0.65, 1.2, { useOutline: false }));
  root.add(scatterType(createBoulderGeo(1), 45, 0.6, 1.1, { useOutline: false }));
  root.add(scatterType(createRockGeo(), 90, 0.5, 0.9, { useOutline: false }));

  // 5. Grass Clumps (Instanced waving grass)
  root.add(scatterType(createGrassGeo(), 2800, 0.75, 1.35, { useOutline: false, windStrength: 0.12 }));

  // 6. Flowers (Higanbana Red Spider Lily, White, Yellow)
  root.add(scatterType(createFlowerGeo('red'), 350, 0.8, 1.2, { useOutline: false, windStrength: 0.1 }));
  root.add(scatterType(createFlowerGeo('yellow'), 250, 0.7, 1.1, { useOutline: false, windStrength: 0.08 }));
  root.add(scatterType(createFlowerGeo('white'), 250, 0.7, 1.1, { useOutline: false, windStrength: 0.08 }));

  // 7. Road Pebbles
  root.add(scatterType(createPebbleGeo(), 180, 0.6, 1.2, { useOutline: false, isPebble: true }));

  return root;
}
