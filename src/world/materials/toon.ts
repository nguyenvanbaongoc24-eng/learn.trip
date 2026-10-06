import * as THREE from 'three';
import { C } from '../config/palette';

// ── 1. Toon Gradient Ramps ──
let _threeStepRamp: THREE.DataTexture | null = null;
let _twoStepRamp: THREE.DataTexture | null = null;

export function getToonRamp(): THREE.DataTexture {
  if (_threeStepRamp) return _threeStepRamp;
  const data = new Uint8Array([110, 190, 255]);
  _threeStepRamp = new THREE.DataTexture(data, data.length, 1, THREE.RedFormat);
  _threeStepRamp.minFilter = THREE.NearestFilter;
  _threeStepRamp.magFilter = THREE.NearestFilter;
  _threeStepRamp.generateMipmaps = false;
  _threeStepRamp.needsUpdate = true;
  return _threeStepRamp;
}

export function getTwoStepRamp(): THREE.DataTexture {
  if (_twoStepRamp) return _twoStepRamp;
  const data = new Uint8Array([150, 255]);
  _twoStepRamp = new THREE.DataTexture(data, data.length, 1, THREE.RedFormat);
  _twoStepRamp.minFilter = THREE.NearestFilter;
  _twoStepRamp.magFilter = THREE.NearestFilter;
  _twoStepRamp.generateMipmaps = false;
  _twoStepRamp.needsUpdate = true;
  return _twoStepRamp;
}

// ── 2. Occlusion Dither Uniforms (Global Camera Tracking) ──
export const occUniforms = {
  uCamPos: { value: new THREE.Vector3() },
  uFocus: { value: new THREE.Vector3() },
  uOcclude: { value: 1.0 },
};

const occShaderChunk = `
  varying vec3 vOccWorld;
  float occBayer(vec2 p) {
    ivec2 i = ivec2(mod(p, 4.0));
    int k = i.x + i.y * 4;
    float m[16] = float[16](0., 8., 2., 10., 12., 4., 14., 6., 3., 11., 1., 9., 15., 7., 13., 5.);
    return (m[k] + 0.5) / 16.0;
  }
  void occDiscard() {
    if (uOcclude < 0.01) return;
    vec3 ab = uFocus - uCamPos;
    float L = length(ab);
    vec3 dir = ab / max(L, 1e-4);
    vec3 ap = vOccWorld - uCamPos;
    float t = dot(ap, dir);
    float dperp = length(ap - dir * t);
    float inside = step(0.0, t) * (1.0 - smoothstep(L - 1.6, L - 0.9, t)) * (1.0 - smoothstep(0.9, 2.0, dperp));
    float nearCam = 1.0 - smoothstep(1.4, 3.2, length(ap));
    float fade = max(inside * 0.85, nearCam) * uOcclude;
    if (fade > occBayer(gl_FragCoord.xy)) discard;
  }
`;

export function applyOccDither<T extends THREE.Material>(mat: T): T {
  const origCompile = mat.onBeforeCompile;
  mat.onBeforeCompile = (shader, renderer) => {
    if (origCompile) origCompile.call(mat, shader, renderer);
    Object.assign(shader.uniforms, occUniforms);

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>\nvarying vec3 vOccWorld;`
      )
      .replace(
        '#include <project_vertex>',
        `#include <project_vertex>
        {
          vec4 ow = vec4(transformed, 1.0);
          #ifdef USE_INSTANCING
            ow = instanceMatrix * ow;
          #endif
          vOccWorld = (modelMatrix * ow).xyz;
        }`
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>\nuniform vec3 uCamPos; uniform vec3 uFocus; uniform float uOcclude;\n${occShaderChunk}`
      )
      .replace(
        '#include <clipping_planes_fragment>',
        `#include <clipping_planes_fragment>\noccDiscard();`
      );
  };
  return mat;
}

// ── 3. Outline Normal Calculation (Spatial Hash Normals Averaging) ──
export function computeOutlineNormals(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
  if (geometry.attributes.outlineNormal) return geometry;

  if (!geometry.attributes.normal) {
    geometry.computeVertexNormals();
  }
  const pos = geometry.attributes.position;
  const normal = geometry.attributes.normal;
  const count = pos.count;

  const map = new Map<number, number>();
  const vertexToGroup = new Int32Array(count);
  const groupNormals: number[] = [];
  const HASH_SCALE = 262144;

  for (let i = 0; i < count; i++) {
    const key =
      Math.round(pos.getX(i) * 500) + 131072 +
      HASH_SCALE * (Math.round(pos.getY(i) * 500) + 131072 +
      HASH_SCALE * (Math.round(pos.getZ(i) * 500) + 131072));

    let gIdx = map.get(key);
    if (gIdx === undefined) {
      gIdx = groupNormals.length;
      groupNormals.push(0, 0, 0);
      map.set(key, gIdx);
    }
    vertexToGroup[i] = gIdx;
    groupNormals[gIdx] += normal.getX(i);
    groupNormals[gIdx + 1] += normal.getY(i);
    groupNormals[gIdx + 2] += normal.getZ(i);
  }

  const outlineNormals = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const gIdx = vertexToGroup[i];
    const len = Math.hypot(groupNormals[gIdx], groupNormals[gIdx + 1], groupNormals[gIdx + 2]) || 1;
    outlineNormals[i * 3] = groupNormals[gIdx] / len;
    outlineNormals[i * 3 + 1] = groupNormals[gIdx + 1] / len;
    outlineNormals[i * 3 + 2] = groupNormals[gIdx + 2] / len;
  }

  geometry.setAttribute('outlineNormal', new THREE.BufferAttribute(outlineNormals, 3));
  return geometry;
}

// ── 4. Outline Material Cache ──
const _outlineMatCache = new Map<string, THREE.ShaderMaterial>();

export function getOutlineMaterial(
  thickness = 0.035,
  color: number | string = C.ink,
  { occlude = true } = {}
): THREE.ShaderMaterial {
  const key = `${thickness}|${color}|${occlude}`;
  if (_outlineMatCache.has(key)) return _outlineMatCache.get(key)!;

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uThickness: { value: thickness },
      uColor: { value: new THREE.Color(color) },
      ...occUniforms,
      ...(occlude ? {} : { uOcclude: { value: 0 } }),
    },
    vertexShader: `
      attribute vec3 outlineNormal;
      uniform float uThickness;
      varying vec3 vOccWorld;
      void main() {
        vec4 p = vec4(position + outlineNormal * uThickness, 1.0);
        #ifdef USE_INSTANCING
          p = instanceMatrix * p;
        #endif
        vOccWorld = (modelMatrix * p).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * p;
      }`,
    fragmentShader: `
      uniform vec3 uColor;
      uniform vec3 uCamPos; uniform vec3 uFocus; uniform float uOcclude;
      ${occShaderChunk}
      void main() {
        occDiscard();
        gl_FragColor = vec4(uColor, 1.0);
        #include <colorspace_fragment>
      }`,
    side: THREE.BackSide,
  });

  _outlineMatCache.set(key, mat);
  return mat;
}

// ── 5. Standard Toon Material Helpers ──
const _toonMatCache = new Map<string, THREE.MeshToonMaterial>();

export function getToonMaterial(color: number = 0xffffff, options: THREE.MeshToonMaterialParameters = {}): THREE.MeshToonMaterial {
  const key = `${color}|${JSON.stringify(options)}`;
  if (!_toonMatCache.has(key)) {
    const mat = applyOccDither(new THREE.MeshToonMaterial({
      color,
      gradientMap: getToonRamp(),
      ...options,
    }));
    _toonMatCache.set(key, mat);
  }
  return _toonMatCache.get(key)!;
}

export function createToonMesh(
  geo: THREE.BufferGeometry,
  mat: THREE.Material,
  { outline = 0.035, cast = true, receive = true, outlineColor = C.ink } = {}
): THREE.Mesh {
  if (outline > 0) computeOutlineNormals(geo);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = cast;
  mesh.receiveShadow = receive;

  if (outline > 0) {
    const outMesh = new THREE.Mesh(geo, getOutlineMaterial(outline, outlineColor));
    outMesh.castShadow = false;
    outMesh.receiveShadow = false;
    mesh.add(outMesh);
  }
  return mesh;
}

export function createInstancedToon(
  geo: THREE.BufferGeometry,
  mat: THREE.Material,
  count: number,
  { outline = 0.035, cast = true, receive = true, outlineColor = C.ink } = {}
): { mesh: THREE.InstancedMesh; outlineMesh: THREE.InstancedMesh | null } {
  if (outline > 0) computeOutlineNormals(geo);
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  mesh.castShadow = cast;
  mesh.receiveShadow = receive;
  mesh.frustumCulled = false;

  let outlineMesh: THREE.InstancedMesh | null = null;
  if (outline > 0) {
    outlineMesh = new THREE.InstancedMesh(geo, getOutlineMaterial(outline, outlineColor), count);
    outlineMesh.instanceMatrix = mesh.instanceMatrix;
    outlineMesh.frustumCulled = false;
    outlineMesh.castShadow = false;
    outlineMesh.receiveShadow = false;
  }

  return { mesh, outlineMesh };
}

// ── 6. Wind & Foliage Shader ──
const leafNoiseGLSL = `
  varying vec3 vLeafP;
  float lhash(vec3 p) { p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
  float lnoise(vec3 p) {
    vec3 i = floor(p); vec3 f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(lhash(i), lhash(i + vec3(1,0,0)), f.x), mix(lhash(i + vec3(0,1,0)), lhash(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(lhash(i + vec3(0,0,1)), lhash(i + vec3(1,0,1)), f.x), mix(lhash(i + vec3(0,1,1)), lhash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
`;

export function createWindMaterial(
  color: number,
  timeUniform: { value: number },
  { strength = 0.12, vertexColors = false, leaf = false }: { strength?: number; vertexColors?: boolean; leaf?: boolean } = {}
): THREE.MeshToonMaterial {
  const mat = new THREE.MeshToonMaterial({ color, gradientMap: getToonRamp(), vertexColors });
  applyOccDither(mat);
  const origCompile = mat.onBeforeCompile;

  mat.onBeforeCompile = (shader, renderer) => {
    origCompile(shader, renderer);
    shader.uniforms.uTime = timeUniform;

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>\nuniform float uTime;${leaf ? '\nvarying vec3 vLeafP;' : ''}`
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        #ifdef USE_INSTANCING
          vec3 ip = instanceMatrix[3].xyz;
        #else
          vec3 ip = vec3(0.0);
        #endif
        // Multi-layered organic wind sway (like daokyuc Sado reference)
        // Per-instance phase from spatial hash — nearby plants sway together
        float ipHash = fract(sin(dot(ip.xz, vec2(12.9898, 78.233))) * 43758.5453);
        float ipHash2 = fract(sin(dot(ip.xz, vec2(63.7264, 10.873))) * 43758.5453);

        // Height-based weight: roots fixed, tips sway most (quadratic falloff)
        float heightWeight = max(position.y, 0.0);
        heightWeight *= heightWeight; // quadratic for organic feel

        // Global gust waves — two frequencies create gusts-and-lulls rhythm
        float gustPhase = uTime * 0.8 + ipHash * 6.283;
        float gust = sin(gustPhase) * 0.55 + sin(gustPhase * 0.37 + 2.1) * 0.35 + sin(gustPhase * 1.73 + 0.8) * 0.15;
        gust = gust * 0.5 + 0.5; // normalize to 0..1 range for gentle pulsing

        // Primary sway — directional wind
        float primaryPhase = uTime * 1.4 + ipHash * 4.0 + ip.x * 0.18 + ip.z * 0.22;
        float swayX = sin(primaryPhase) * 0.65 + sin(primaryPhase * 2.1 + 1.7) * 0.25 + sin(primaryPhase * 3.7 + 4.2) * 0.1;
        float swayZ = sin(primaryPhase * 0.83 + 2.4) * 0.6 + sin(primaryPhase * 1.9 + 0.5) * 0.3 + sin(primaryPhase * 3.3 + 1.1) * 0.1;

        // Secondary micro-flutter (leaf/tip trembling)
        float flutter = sin(uTime * 8.5 + ipHash2 * 20.0 + position.x * 12.0) * 0.15;

        // Combine with strength, gust modulation, and height weight
        float windStr = ${strength.toFixed(4)};
        transformed.x += (swayX + flutter) * windStr * heightWeight * (0.5 + gust * 1.2);
        transformed.z += swayZ * windStr * heightWeight * 0.7 * (0.5 + gust * 1.2);
        ${leaf ? 'vLeafP = position;' : ''}`
      );

    if (leaf) {
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', `#include <common>\n${leafNoiseGLSL}`)
        .replace(
          '#include <color_fragment>',
          `#include <color_fragment>
          {
            float foliage = step(diffuseColor.r * 1.12, diffuseColor.g) * step(0.25, diffuseColor.g);
            vec3 q = vLeafP * 5.5;
            float n1 = lnoise(q);
            float n2 = lnoise(q * 2.4 + 17.0);
            float clump = smoothstep(0.6, 0.63, n1 * 0.7 + n2 * 0.4);
            float fleck = smoothstep(0.78, 0.8, n2);
            diffuseColor.rgb *= 1.0 - clump * 0.2 * foliage;
            diffuseColor.rgb += fleck * 0.08 * foliage;
          }`
        );
    }
  };

  return mat;
}
