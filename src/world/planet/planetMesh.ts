import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { PLANET_R } from '../config/constants';
import { heightAt, colorAt } from './terrain';
import { getToonRamp } from '../materials/toon';

export const terrainUniforms = {
  uTime: { value: 0 },
};

const terrainNoiseGLSL = `
  uniform float uTime;
  uniform float uR;
  varying vec3 vTP;

  float thash(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.zyx + 31.32);
    return fract((p.x + p.y) * p.z);
  }
  float tnoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(thash(i), thash(i + vec3(1,0,0)), f.x), mix(thash(i + vec3(0,1,0)), thash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(thash(i + vec3(0,0,1)), thash(i + vec3(1,0,1)), f.x), mix(thash(i + vec3(0,1,1)), thash(i + vec3(1,1,1)), f.x), f.y),
      f.z
    );
  }
`;

export function createPlanetMesh(): THREE.Mesh {
  let geo: THREE.BufferGeometry = new THREE.IcosahedronGeometry(PLANET_R, 6);
  geo.deleteAttribute('normal');
  geo.deleteAttribute('uv');
  geo = mergeVertices(geo, 1e-4);

  const pos = geo.attributes.position;
  const dir = new THREE.Vector3();

  // Pass 1: Height displacement
  for (let i = 0; i < pos.count; i++) {
    dir.fromBufferAttribute(pos, i).normalize();
    const h = heightAt(dir);
    pos.setXYZ(i, dir.x * (PLANET_R + h), dir.y * (PLANET_R + h), dir.z * (PLANET_R + h));
  }

  geo.computeVertexNormals();

  // Pass 2: Vertex coloring with slope & cliff rock detection
  const colors = new Float32Array(pos.count * 3);
  const normal = new THREE.Vector3();
  const vPos = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    vPos.fromBufferAttribute(pos, i);
    const r = vPos.length();
    dir.copy(vPos).normalize();
    normal.fromBufferAttribute(geo.attributes.normal, i);

    const h = r - PLANET_R;
    const slope = 1 - Math.max(0, normal.dot(dir));

    const c = colorAt(dir, h, slope);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeBoundingSphere();

  // MeshToonMaterial with custom brush blotches and wave foam
  const mat = new THREE.MeshToonMaterial({
    vertexColors: true,
    gradientMap: getToonRamp(),
  });

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = terrainUniforms.uTime;
    shader.uniforms.uR = { value: PLANET_R };

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>\nvarying vec3 vTP;`
      )
      .replace(
        '#include <project_vertex>',
        `#include <project_vertex>\nvTP = (modelMatrix * vec4(transformed, 1.0)).xyz;`
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>\n${terrainNoiseGLSL}`
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        {
          float h = length(vTP) - uR;
          float n1 = tnoise(vTP * 1.2);
          float n2 = tnoise(vTP * 4.2 + 13.0);
          float nMicro = tnoise(vTP * 22.0);

          float land = step(0.08, h);

          // Painterly anime ground patches (sun-warmed olive vs cool moss)
          vec3 sunGrass = vec3(1.05, 1.04, 0.95);
          vec3 shadeMoss = vec3(0.92, 0.96, 0.92);
          float patchMix = smoothstep(0.40, 0.60, n1 * 0.7 + n2 * 0.3);
          diffuseColor.rgb *= mix(shadeMoss, sunGrass, patchMix);

          // Micro stippling & canvas paper tooth (multiplicative)
          diffuseColor.rgb *= 1.0 + (nMicro - 0.5) * 0.08 * land;

          // Subtle organic blotches & tiny pebble specks
          float blotch = smoothstep(0.56, 0.60, n1 * 0.6 + n2 * 0.4);
          diffuseColor.rgb *= 1.0 - blotch * 0.06 * land;
          float specks = smoothstep(0.84, 0.88, tnoise(vTP * 12.0));
          diffuseColor.rgb += specks * 0.04 * land;
        }`
      );
  };

  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  mesh.name = 'terrain';

  return mesh;
}
