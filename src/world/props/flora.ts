import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { C } from '../config/palette';
import { computeOutlineNormals } from '../materials/toon';

function applyColor(geo: THREE.BufferGeometry, colorHex: number): THREE.BufferGeometry {
  const g = geo.index ? geo.toNonIndexed() : geo.clone();
  if (g.hasAttribute('uv')) g.deleteAttribute('uv');
  g.computeVertexNormals();
  const count = g.attributes.position.count;
  const colors = new Float32Array(count * 3);
  const c = new THREE.Color(colorHex);
  for (let i = 0; i < count; i++) {
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return g;
}

// ── Broadleaf Trees (3 procedural variants) ──
export function createTreeGeo(variant: number = 0): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const leafPalettes = [
    [0x5aa85a, 0x76c45c, 0x4a944d, 0x86d06d],
    [0x4f9448, 0x68b05f, 0x3f8240, 0x7cb856],
    [0x6cb45e, 0x8ab85c, 0x5a9a52, 0x9ad074],
  ];
  const e = leafPalettes[variant % 3];
  const trunkColor = 0x5a3c28;

  if (variant === 0) {
    // Standard lush broadleaf
    const trunk = applyColor(new THREE.CylinderGeometry(0.12, 0.18, 1.4, 6).translate(0, 0.7, 0), trunkColor);
    parts.push(trunk);

    const b1 = applyColor(new THREE.SphereGeometry(0.75, 8, 6).translate(0.1, 1.9, 0), e[0]);
    const b2 = applyColor(new THREE.SphereGeometry(0.62, 8, 6).translate(-0.55, 1.7, 0.2), e[1]);
    const b3 = applyColor(new THREE.SphereGeometry(0.58, 8, 6).translate(0.5, 1.6, -0.25), e[2]);
    const b4 = applyColor(new THREE.SphereGeometry(0.48, 8, 6).translate(0.2, 2.3, 0.2), e[3]);
    parts.push(b1, b2, b3, b4);
  } else if (variant === 1) {
    // Tall slender tree
    const trunk = applyColor(new THREE.CylinderGeometry(0.1, 0.16, 2.0, 6).translate(0, 1.0, 0), trunkColor);
    parts.push(trunk);

    const b1 = applyColor(new THREE.SphereGeometry(0.8, 8, 6).translate(0, 2.5, 0), e[0]);
    const b2 = applyColor(new THREE.SphereGeometry(0.55, 8, 6).translate(0.4, 2.1, 0.1), e[1]);
    const b3 = applyColor(new THREE.SphereGeometry(0.5, 8, 6).translate(-0.35, 2.2, -0.1), e[2]);
    const b4 = applyColor(new THREE.SphereGeometry(0.42, 8, 6).translate(0.1, 3.0, 0.05), e[3]);
    parts.push(b1, b2, b3, b4);
  } else {
    // Compact rounded orchard tree
    const trunk = applyColor(new THREE.CylinderGeometry(0.14, 0.22, 1.0, 6).translate(0, 0.5, 0), trunkColor);
    parts.push(trunk);

    const b1 = applyColor(new THREE.SphereGeometry(0.68, 8, 6).translate(0, 1.4, 0), e[0]);
    const b2 = applyColor(new THREE.SphereGeometry(0.55, 8, 6).translate(0.4, 1.25, 0.1), e[1]);
    const b3 = applyColor(new THREE.SphereGeometry(0.52, 8, 6).translate(-0.38, 1.2, -0.15), e[3]);
    parts.push(b1, b2, b3);
  }

  const merged = mergeGeometries(parts);
  computeOutlineNormals(merged);
  return merged;
}

// ── Red Flamboyant Tree (Phượng Đỏ Hà Nội) ──
export function createFlamboyantGeo(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const trunkColor = 0x543a28;
  const redPal = [0xee3e2b, 0xf2583e, 0xd82d1c, 0xff6b4a];

  // Wide umbrella trunk
  const t1 = applyColor(new THREE.CylinderGeometry(0.12, 0.22, 1.2, 6).translate(0, 0.6, 0), trunkColor);
  const b1 = applyColor(new THREE.CylinderGeometry(0.08, 0.12, 0.9, 6).rotateZ(0.4).translate(0.25, 1.2, 0), trunkColor);
  const b2 = applyColor(new THREE.CylinderGeometry(0.08, 0.12, 0.9, 6).rotateZ(-0.4).translate(-0.25, 1.2, 0), trunkColor);
  parts.push(t1, b1, b2);

  // Wide umbrella red canopy clusters
  const c1Geo = new THREE.SphereGeometry(0.85, 8, 6);
  c1Geo.scale(1.4, 0.5, 1.2);
  c1Geo.translate(0, 1.8, 0);
  parts.push(applyColor(c1Geo, redPal[0]));

  const c2Geo = new THREE.SphereGeometry(0.7, 8, 6);
  c2Geo.scale(1.3, 0.45, 1.1);
  c2Geo.translate(0.6, 1.65, 0.3);
  parts.push(applyColor(c2Geo, redPal[1]));

  const c3Geo = new THREE.SphereGeometry(0.68, 8, 6);
  c3Geo.scale(1.25, 0.45, 1.1);
  c3Geo.translate(-0.6, 1.6, -0.3);
  parts.push(applyColor(c3Geo, redPal[2]));

  const c4Geo = new THREE.SphereGeometry(0.5, 8, 6);
  c4Geo.scale(1.1, 0.4, 1.0);
  c4Geo.translate(0.1, 2.1, 0);
  parts.push(applyColor(c4Geo, redPal[3]));

  const merged = mergeGeometries(parts);
  computeOutlineNormals(merged);
  return merged;
}

// ── Purple Lagerstroemia Tree (Bằng Lăng Tím Hà Nội) ──
export function createLagerstroemiaGeo(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const trunkColor = 0x4e3828;
  const purpPal = [0x9b51e0, 0xb866e9, 0x833bc4, 0xca82f8];

  const t1 = applyColor(new THREE.CylinderGeometry(0.11, 0.18, 1.3, 6).translate(0, 0.65, 0), trunkColor);
  parts.push(t1);

  const c1Geo = new THREE.SphereGeometry(0.78, 8, 6);
  c1Geo.translate(0, 1.7, 0);
  parts.push(applyColor(c1Geo, purpPal[0]));

  const c2Geo = new THREE.SphereGeometry(0.6, 8, 6);
  c2Geo.translate(0.48, 1.5, 0.2);
  parts.push(applyColor(c2Geo, purpPal[1]));

  const c3Geo = new THREE.SphereGeometry(0.55, 8, 6);
  c3Geo.translate(-0.45, 1.48, -0.2);
  parts.push(applyColor(c3Geo, purpPal[2]));

  const c4Geo = new THREE.SphereGeometry(0.45, 8, 6);
  c4Geo.translate(0.08, 2.05, 0.05);
  parts.push(applyColor(c4Geo, purpPal[3]));

  const merged = mergeGeometries(parts);
  computeOutlineNormals(merged);
  return merged;
}

// ── Bonsai / Japanese Pine (Matsu) with horizontal flattened disks ──
export function createMatsuGeo(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const trunkColor = 0x503522;

  // Crooked trunk
  const t1 = applyColor(new THREE.CylinderGeometry(0.1, 0.15, 1.1, 6).rotateZ(0.2).translate(0.1, 0.55, 0), trunkColor);
  const t2 = applyColor(new THREE.CylinderGeometry(0.07, 0.1, 1.0, 6).rotateZ(-0.25).translate(0.3, 1.4, 0.05), trunkColor);
  parts.push(t1, t2);

  // Horizontal flattened foliage clusters
  const f1Geo = new THREE.SphereGeometry(0.65, 8, 6);
  f1Geo.scale(1.3, 0.45, 1.0);
  f1Geo.translate(0.85, 1.5, 0.1);
  parts.push(applyColor(f1Geo, 0x3f7a35));

  const f2Geo = new THREE.SphereGeometry(0.6, 8, 6);
  f2Geo.scale(1.25, 0.42, 1.0);
  f2Geo.translate(-0.55, 1.7, 0.2);
  parts.push(applyColor(f2Geo, 0x4a8c3e));

  const f3Geo = new THREE.SphereGeometry(0.55, 8, 6);
  f3Geo.scale(1.2, 0.4, 1.0);
  f3Geo.translate(0.2, 2.1, 0);
  parts.push(applyColor(f3Geo, 0x35682c));

  const merged = mergeGeometries(parts);
  computeOutlineNormals(merged);
  return merged;
}

// ── Conifer Pine ──
export function createPineGeo(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const trunk = applyColor(new THREE.CylinderGeometry(0.08, 0.14, 0.8, 6).translate(0, 0.4, 0), 0x5a3c28);
  parts.push(trunk);

  const c1 = applyColor(new THREE.ConeGeometry(0.85, 1.1, 8).translate(0, 1.1, 0), 0x356a34);
  const c2 = applyColor(new THREE.ConeGeometry(0.68, 0.95, 8).translate(0, 1.65, 0), 0x427e40);
  const c3 = applyColor(new THREE.ConeGeometry(0.48, 0.8, 8).translate(0, 2.15, 0), 0x4f944c);
  const c4 = applyColor(new THREE.ConeGeometry(0.28, 0.6, 8).translate(0, 2.6, 0), 0x5ca858);
  parts.push(c1, c2, c3, c4);

  const merged = mergeGeometries(parts);
  computeOutlineNormals(merged);
  return merged;
}

// ── Bush (Low-poly cluster) ──
export function createBushGeo(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const g1 = new THREE.SphereGeometry(0.42, 6, 5);
  g1.scale(1, 0.7, 1);
  g1.translate(0, 0.28, 0);
  parts.push(applyColor(g1, 0x5aa648));

  const g2 = new THREE.SphereGeometry(0.32, 6, 5);
  g2.scale(1, 0.65, 1);
  g2.translate(0.28, 0.22, 0.1);
  parts.push(applyColor(g2, 0x6db856));

  const g3 = new THREE.SphereGeometry(0.28, 6, 5);
  g3.scale(1, 0.6, 1);
  g3.translate(-0.25, 0.2, -0.1);
  parts.push(applyColor(g3, 0x4c8e3c));

  const merged = mergeGeometries(parts);
  computeOutlineNormals(merged);
  return merged;
}

// ── Mossy Boulder / Rock ──
export function createBoulderGeo(variant: number = 0): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(0.65, 8, 6);
  geo.deleteAttribute('uv');
  const pos = geo.attributes.position;
  const count = pos.count;

  // Deform boulder
  for (let i = 0; i < count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const noise = 1.0 + 0.22 * Math.sin(x * 3.1 + variant) * Math.cos(z * 2.7 - variant);
    pos.setXYZ(i, x * noise * 1.2, Math.max(-0.2, y * noise * 0.75), z * noise * 0.95);
  }
  geo.computeVertexNormals();

  // Color top vertices with green moss, rest with stone
  const normal = geo.attributes.normal;
  const colors = new Float32Array(count * 3);
  const rockColor = new THREE.Color(0x9a9488);
  const mossColor = new THREE.Color(0x6a9448);

  for (let i = 0; i < count; i++) {
    const ny = normal.getY(i);
    const isMoss = ny > 0.45;
    const c = isMoss ? mossColor : rockColor;
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  computeOutlineNormals(geo);
  return geo;
}

export function createRockGeo(): THREE.BufferGeometry {
  const geo = new THREE.DodecahedronGeometry(0.45, 0);
  geo.scale(1.0, 0.65, 0.85);
  geo.translate(0, 0.18, 0);
  applyColor(geo, 0x908a80);
  computeOutlineNormals(geo);
  return geo;
}

// ── Grass Clump (3 blades waving in wind) ──
export function createGrassGeo(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const bladeGeo1 = new THREE.ConeGeometry(0.04, 0.38, 3).translate(0, 0.19, 0);
  parts.push(applyColor(bladeGeo1, 0x82c448));

  const bladeGeo2 = new THREE.ConeGeometry(0.035, 0.32, 3);
  bladeGeo2.rotateZ(-0.35);
  bladeGeo2.translate(0.07, 0.15, 0.03);
  parts.push(applyColor(bladeGeo2, 0x94d456));

  const bladeGeo3 = new THREE.ConeGeometry(0.035, 0.3, 3);
  bladeGeo3.rotateZ(0.3);
  bladeGeo3.translate(-0.06, 0.14, -0.02);
  parts.push(applyColor(bladeGeo3, 0x6eab38));

  return mergeGeometries(parts);
}

// ── Flower / Spider Lily (Higanbana & Wildflowers) ──
export function createFlowerGeo(type: 'red' | 'white' | 'yellow' = 'red'): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const stem = applyColor(new THREE.CylinderGeometry(0.008, 0.012, 0.35, 4).translate(0, 0.175, 0), 0x5a9a40);
  parts.push(stem);

  const flowerColor = type === 'red' ? 0xe63b32 : (type === 'yellow' ? 0xf5d042 : 0xf4f0e6);

  if (type === 'red') {
    // 6 curved petals (Higanbana spider lily style)
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const petal = new THREE.ConeGeometry(0.015, 0.14, 3);
      petal.rotateX(0.9);
      petal.rotateY(angle);
      petal.translate(Math.cos(angle) * 0.04, 0.36, Math.sin(angle) * 0.04);
      parts.push(applyColor(petal, flowerColor));
    }
  } else {
    // 4 rounded petals
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const petal = new THREE.SphereGeometry(0.028, 4, 3);
      petal.scale(1.2, 0.5, 1.2);
      petal.translate(Math.cos(angle) * 0.035, 0.35, Math.sin(angle) * 0.035);
      parts.push(applyColor(petal, flowerColor));
    }
  }

  return mergeGeometries(parts);
}

export function createPebbleGeo(): THREE.BufferGeometry {
  const geo = new THREE.DodecahedronGeometry(0.12, 0);
  geo.scale(1.2, 0.5, 0.9);
  geo.translate(0, 0.04, 0);
  applyColor(geo, 0x8a847a);
  return geo;
}
