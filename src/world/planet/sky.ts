import * as THREE from 'three';
import { PLANET_R } from '../config/constants';
import { makeOutlineGeometry, outlineMat } from '../materials/outline';
import { getPlanetMatrix } from '../place/placeOnPlanet';

export const skyUniforms = {
  uTime: { value: 0 },
  uUp: { value: new THREE.Vector3(0, 1, 0) },
  uT: { value: new THREE.Vector3(1, 0, 0) },
  uPlanet: { value: 0 }, // 0 = walk sky, 1 = planet overview space
  cZenith: { value: new THREE.Color(0x4fb9ab) },
  cHorizon: { value: new THREE.Color(0xa9e7d9) },
  cWisp: { value: new THREE.Color(0xd4f2ea) },
  cWispDark: { value: new THREE.Color(0x3fa89e) },
  cSpace: { value: new THREE.Color(0x62c2bc) },
};

const skyNoiseGLSL = `
  float shash(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.zyx + 31.32);
    return fract((p.x + p.y) * p.z);
  }
  float snoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(shash(i), shash(i + vec3(1,0,0)), f.x), mix(shash(i + vec3(0,1,0)), shash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(shash(i + vec3(0,0,1)), shash(i + vec3(1,0,1)), f.x), mix(shash(i + vec3(0,1,1)), shash(i + vec3(1,1,1)), f.x), f.y),
      f.z
    );
  }
  float sfbm(vec3 p) {
    float s = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) {
      s += a * snoise(p);
      p *= 2.03;
      a *= 0.5;
    }
    return s;
  }
`;

export function createSkyDome(): THREE.Mesh {
  const geo = new THREE.SphereGeometry(450, 48, 24);
  const mat = new THREE.ShaderMaterial({
    uniforms: skyUniforms,
    vertexShader: `
      varying vec3 vDir;
      void main() {
        vDir = position;
        vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_Position = p.xyww;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uUp;
      uniform vec3 uT;
      uniform float uPlanet;
      uniform vec3 cZenith, cHorizon, cWisp, cWispDark, cSpace;
      varying vec3 vDir;
      ${skyNoiseGLSL}
      void main() {
        vec3 d = normalize(vDir);
        vec3 U = normalize(uUp);
        vec3 T = normalize(uT - U * dot(uT, U));
        vec3 B = cross(U, T);
        vec3 c = vec3(dot(d, T), dot(d, U), dot(d, B));
        float t = c.y;

        // Rich 3-band anime gradient: Warm peach horizon -> soft cream/amber mid -> pure anime blue zenith
        vec3 cMid = mix(cHorizon, cZenith, 0.42) + vec3(0.06, 0.03, -0.04);
        float t1 = smoothstep(-0.06, 0.32, t);
        float t2 = smoothstep(0.28, 0.85, t);
        vec3 sky = mix(mix(cHorizon, cMid, t1), cZenith, t2);

        // Procedural wispy clouds with warm sunlit rim
        vec3 q = vec3(c.x * 1.3 + c.y * 1.8, c.y * 7.0, c.z * 1.3 - c.y * 0.8);
        float n = sfbm(q * 1.4 + vec3(uTime * 0.012, 0.0, uTime * 0.006));
        float band = smoothstep(0.02, 0.3, t) * (1.0 - smoothstep(0.55, 0.9, t));
        float w = smoothstep(0.56, 0.585, n) * band;
        float wd = smoothstep(0.5, 0.52, n) * (1.0 - smoothstep(0.56, 0.585, n)) * band;
        sky = mix(sky, cWispDark, wd * 0.28);
        sky = mix(sky, cWisp, w * 0.8);

        // Overview background: radiant Sado teal gradient from bottom horizon to zenith
        vec3 spaceTop = cSpace;
        vec3 spaceBottom = cHorizon;
        vec3 space = mix(spaceBottom, spaceTop, smoothstep(-0.35, 0.75, d.y));
        float sn = snoise(d * 32.0);
        space += vec3(0.015 * sn);
        gl_FragColor = vec4(mix(sky, space, uPlanet), 1.0);
        #include <colorspace_fragment>
      }
    `,
    side: THREE.BackSide,
    depthWrite: false,
    depthTest: false,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = -1000;
  mesh.frustumCulled = false;
  return mesh;
}

// Floating atmospheric dust / pollen / light specks
export function createAtmosphericDust(radius: number = PLANET_R, count: number = 500): THREE.Points {
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const tempDir = new THREE.Vector3();

  for (let i = 0; i < count; i++) {
    tempDir.randomDirection().multiplyScalar(radius + 2.0 + Math.pow(Math.random(), 1.6) * 45);
    positions.set([tempDir.x, tempDir.y, tempDir.z], i * 3);
    seeds[i] = Math.random();
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('seed', new THREE.BufferAttribute(seeds, 1));

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: skyUniforms.uTime,
      uPixel: { value: 2.0 },
    },
    vertexShader: `
      attribute float seed;
      uniform float uTime;
      uniform float uPixel;
      varying float vA;
      void main() {
        vec3 p = position;
        p += vec3(
          sin(uTime * 0.25 + seed * 30.0),
          cos(uTime * 0.2 + seed * 15.0),
          sin(uTime * 0.22 + seed * 8.0)
        ) * 0.5;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uPixel * (1.2 + seed * 2.8) * (38.0 / max(4.0, -mv.z));
        gl_PointSize = clamp(gl_PointSize, 1.0, 7.0 * uPixel);
        vA = 0.3 + 0.45 * fract(seed * 7.13);
      }
    `,
    fragmentShader: `
      varying float vA;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        if (d > 0.5) discard;
        gl_FragColor = vec4(vec3(0.95, 1.0, 0.98), vA * smoothstep(0.5, 0.2, d));
      }
    `,
    transparent: true,
    depthWrite: false,
  });

  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  return points;
}

import { DestinationDef } from '../config/destinations';

export function createSkyMesh(dest?: DestinationDef): THREE.Group {
  if (dest?.sky) {
    skyUniforms.cZenith.value.set(dest.sky.top);
    skyUniforms.cHorizon.value.set(dest.sky.bottom);
    skyUniforms.cSpace.value.set(dest.sky.top);
  }
  const group = new THREE.Group();

  // 1. Atmosphere sky dome
  const dome = createSkyDome();
  group.add(dome);

  // 2. Floating dust / light particles
  const dust = createAtmosphericDust(PLANET_R, 500);
  group.add(dust);

  // 3. Compact stylized low-poly clouds framing the planet (matching Sado reference)
  // Small ivory puffs positioned around the outer rim and back so they NEVER block front landmarks
  const cloudCount = 10;
  const cloudsGroup = new THREE.Group();
  cloudsGroup.name = 'OrbitClouds';

  const cloudMat = new THREE.MeshToonMaterial({
    color: 0xfcfbf6,
    transparent: true,
    opacity: 0.95,
  });

  for (let i = 0; i < cloudCount; i++) {
    const cloud = new THREE.Group();
    const puffCount = 3 + (i % 2);

    for (let p = 0; p < puffCount; p++) {
      const r = 1.1 + Math.random() * 0.6;
      const puffGeo = new THREE.DodecahedronGeometry(r, 1);
      puffGeo.scale(1.25, 0.72, 1.05);
      const puff = new THREE.Mesh(puffGeo, cloudMat);
      puff.position.set(
        (p - puffCount / 2) * 1.35 + (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.35,
        (Math.random() - 0.5) * 0.6
      );
      puff.add(new THREE.Mesh(makeOutlineGeometry(puffGeo), outlineMat));
      cloud.add(puff);
    }

    // Position around the outer rim/equator and background
    const phi = 0.95 + (i % 4) * 0.28;
    const theta = (i / cloudCount) * Math.PI * 2;
    // High orbital distance so clouds stay in the outer cosmic frame
    const dist = PLANET_R + 18 + (i % 3) * 4;
    const dir = new THREE.Vector3().setFromSphericalCoords(1, phi, theta);

    cloud.position.copy(dir).multiplyScalar(dist);
    cloud.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)
      .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.random() * Math.PI * 2));
    cloudsGroup.add(cloud);
  }

  group.add(cloudsGroup);

  return group;
}

export function updateSky(group: THREE.Group, time: number, mode: 'walk' | 'overview') {
  skyUniforms.uTime.value = time;
  // Blend sky to space
  const targetPlanet = mode === 'overview' ? 1 : 0;
  skyUniforms.uPlanet.value += (targetPlanet - skyUniforms.uPlanet.value) * 0.08;

  // Orbit clouds very slowly around the globe
  const clouds = group.getObjectByName('OrbitClouds');
  if (clouds) {
    clouds.rotation.y = time * 0.008;
  }
}
