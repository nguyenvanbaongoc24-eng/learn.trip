import * as THREE from 'three';
import { createNoise3D } from 'simplex-noise';
import { rng, initRng } from '../core/rng';
import { PLANET_R, WATER_LEVEL } from '../config/constants';
import { C } from '../config/palette';
import { DestinationDef, WaterDef } from '../config/destinations';
import { dirFromLatLon } from '../interact/poiManager';

let noise3D = createNoise3D(rng);
const _v = new THREE.Vector3();
const _p = new THREE.Vector3();

let currentDest: DestinationDef | null = null;

export function initTerrain(dest: DestinationDef) {
  currentDest = dest;
  initRng(dest.seed);
  noise3D = createNoise3D(rng);
}

function fbm(p: THREE.Vector3, oct: number, freq: number) {
  let a = 1, f = freq, s = 0, n = 0;
  for (let i = 0; i < oct; i++) {
    s += noise3D(p.x * f, p.y * f, p.z * f) * a;
    n += a;
    a *= 0.5;
    f *= 2;
  }
  return s / n;
}

const sstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const mix = (c1: number, c2: number, t: number): THREE.Color => {
  return new THREE.Color(c1).lerp(new THREE.Color(c2), Math.min(1, Math.max(0, t)));
};

function waterCarve(w: WaterDef, dir: THREE.Vector3): number {
  if (w.type === 'lake') {
    const wDir = dirFromLatLon(w.dir[0], w.dir[1]);
    const d = dir.angleTo(wDir) * PLANET_R;
    return sstep(w.radius * 1.5, w.radius * 0.8, d) * w.depth;
  }
  return 0;
}

export function pathMask(dir: THREE.Vector3): number {
  if (!currentDest || !currentDest.paths) return 0;
  let minDist = 999;
  for (const path of currentDest.paths) {
    const p1 = dirFromLatLon(path[0][0], path[0][1]);
    const p2 = dirFromLatLon(path[1][0], path[1][1]);
    const totalAng = p1.angleTo(p2);
    const ang1 = dir.angleTo(p1);
    const ang2 = dir.angleTo(p2);
    if (ang1 + ang2 < totalAng + 0.1) {
      const cross = new THREE.Vector3().crossVectors(p1, p2).normalize();
      let d = Math.abs(Math.asin(Math.max(-1, Math.min(1, dir.dot(cross))))) * PLANET_R;
      minDist = Math.min(minDist, d);
    } else {
      minDist = Math.min(minDist, Math.min(ang1, ang2) * PLANET_R);
    }
  }
  const noise = fbm(_v.copy(dir).multiplyScalar(PLANET_R), 2, 0.4) * 0.5;
  return 1 - sstep(0.5, 1.2, minDist + noise);
}

export function heightAt(dir: THREE.Vector3): number {
  if (!currentDest) return 0;
  const p = _v.copy(dir).multiplyScalar(PLANET_R);
  
  const amp = currentDest.terrain.amp;
  const freq = currentDest.terrain.freq;
  
  let h = fbm(p, 4, 0.09 * freq) * 1.8 * amp + fbm(p, 2, 0.35 * freq) * 0.25 * amp;

  if (currentDest.id === 'loc-sapa') {
    const terraceHeight = 0.8;
    const stepped = Math.floor(h / terraceHeight) * terraceHeight;
    const fract = (h % terraceHeight) / terraceHeight;
    h = stepped + sstep(0.6, 1.0, fract) * terraceHeight;
  }
  
  if (currentDest.terrain.type === 'islands') {
    h -= 1.5; // Sink the base terrain to create a sea
  } else {
    // Inland destinations only reveal water where their authored water features carve it.
    h = Math.max(h, WATER_LEVEL + 0.08);
  }

  for (const s of currentDest.stages) {
    const sDir = dirFromLatLon(s.dir[0], s.dir[1]);
    const d = dir.angleTo(sDir) * PLANET_R;
    const baseH = s.ground === 'lawn' ? 0.1 : (s.ground === 'paved' ? 0.2 : (s.ground === 'terrace' ? 0.4 : 0.15));
    // For islands, raise the terrain around stages so they are above water
    const targetH = currentDest.terrain.type === 'islands' ? Math.max(h, baseH) : baseH;
    h = THREE.MathUtils.lerp(h, targetH, 1 - sstep(s.flatR, s.flatR * 1.8, d));
  }
  
  if (currentDest.waters) {
    for (const w of currentDest.waters) {
      h -= waterCarve(w, dir);
    }
  }
  
  return h;
}

export function colorAt(dir: THREE.Vector3, h: number, slope: number): THREE.Color {
  const p = currentDest?.palette || C;
  const p3 = _p.copy(dir).multiplyScalar(PLANET_R);
  
  const nLow = fbm(p3, 2, 0.1);
  const nMid = fbm(p3, 3, 0.9);
  const nHigh = fbm(p3, 2, 3.0);
  
  const baseColor = nLow > 0 ? mix(p.grassMid, p.grassLight, nLow) : mix(p.grassMid, p.grassDark, -nLow);
  let c = mix(baseColor.getHex(), nMid > 0 ? p.grassLight : p.grassDark, Math.abs(nMid) * 0.5);
  c = mix(c.getHex(), p.grassLight, Math.abs(nHigh) * 0.3);

  // Sand only along shoreline near real water (islands or carved water bodies)
  const isIsland = currentDest?.terrain.type === 'islands';
  let nearWater = false;
  if (currentDest?.waters) {
    for (const w of currentDest.waters) {
      if (waterCarve(w, dir) > 0.04) {
        nearWater = true;
        break;
      }
    }
  }

  const dh = h - WATER_LEVEL;
  if (isIsland && dh >= -0.15 && dh < 0.28) {
    const sandAmount = 1 - sstep(-0.08, 0.28, dh);
    c = mix(c.getHex(), p.sand, sandAmount * 0.95);
  } else if (isIsland && dh < -0.15) {
    c = new THREE.Color(p.sand).lerp(new THREE.Color(0x356058), 0.6);
  } else if (!isIsland && nearWater && dh >= -0.04 && dh < 0.06) {
    // Narrow natural pebble edge along lake/river
    const edgeAmount = 1 - sstep(-0.04, 0.06, dh);
    c = mix(c.getHex(), 0x68755c, edgeAmount * 0.45);
  }

  // Dirt paths
  c = mix(c.getHex(), p.dirt, pathMask(dir) * 0.88);

  // Paved courtyards / plazas around paved stages directly on the spherical terrain
  if (currentDest?.stages) {
    for (const s of currentDest.stages) {
      if (s.ground === 'paved' || s.ground === 'terrace') {
        const sDir = dirFromLatLon(s.dir[0], s.dir[1]);
        const d = dir.angleTo(sDir) * PLANET_R;
        if (d < s.flatR * 1.05) {
          const pavedAmount = 1 - sstep(s.flatR * 0.45, s.flatR * 0.95, d);
          // Warm natural granite/terrazzo stone tone with subtle stone grain
          const stonePave = mix(0xbab2a2, 0x948b7d, Math.abs(nHigh) * 0.35);
          c = mix(c.getHex(), stonePave.getHex(), pavedAmount * 0.95);
        }
      }
    }
  }

  // Basalt rock cliff only on genuine steep slopes (preventing white polka-dots on green hills)
  const cliffFactor = sstep(0.48, 0.75, slope);
  c = mix(c.getHex(), p.rock, cliffFactor * 0.85);
  
  return c;
}
