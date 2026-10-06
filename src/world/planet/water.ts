import * as THREE from 'three';
import { PLANET_R, WATER_LEVEL } from '../config/constants';
import { getToonRamp } from '../materials/toon';

export const waterUniforms = {
  uTime: { value: 0 },
};

const waterNoiseGLSL = `
  float whash(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.zyx + 31.32);
    return fract((p.x + p.y) * p.z);
  }
  float wnoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(whash(i), whash(i + vec3(1,0,0)), f.x), mix(whash(i + vec3(0,1,0)), whash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(whash(i + vec3(0,0,1)), whash(i + vec3(1,0,1)), f.x), mix(whash(i + vec3(0,1,1)), whash(i + vec3(1,1,1)), f.x), f.y),
      f.z
    );
  }
`;

export function createWaterMesh(): THREE.Mesh {
  const geo = new THREE.SphereGeometry(PLANET_R + WATER_LEVEL, 64, 48);

  const mat = new THREE.MeshToonMaterial({
    color: 0x48b6b0,
    gradientMap: getToonRamp(),
    transparent: true,
    opacity: 0.65,
    depthWrite: false,
  });

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = waterUniforms.uTime;

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>\nuniform float uTime;\nvarying vec3 vWPos;`
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        {
          vec3 wDir = normalize(position);
          float wPhase = wDir.x * 14.0 + wDir.z * 12.0 + uTime * 1.8;
          float waveDisp = sin(wPhase) * cos(wDir.y * 16.0 + uTime * 1.3) * 0.022;
          transformed += normal * waveDisp;
        }`
      )
      .replace(
        '#include <project_vertex>',
        `#include <project_vertex>\nvWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;`
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>\nuniform float uTime;\nvarying vec3 vWPos;\n${waterNoiseGLSL}`
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        {
          vec3 wp = vWPos * 0.65;
          float n1 = wnoise(wp + vec3(uTime * 0.2, uTime * 0.04, uTime * 0.16));
          float n2 = wnoise(wp * 2.2 - vec3(uTime * 0.28, 0.0, uTime * 0.2));
          float glint = smoothstep(0.72, 0.76, n1 * 0.6 + n2 * 0.5);
          float streak = smoothstep(0.63, 0.66, n2) * (1.0 - smoothstep(0.7, 0.73, n2));

          // Shoreline foam wave ripple pulse
          float shoreWave = sin(wp.x * 9.0 + wp.z * 8.0 - uTime * 2.2);
          float ripple = smoothstep(0.8, 0.95, shoreWave * 0.5 + 0.5);
          float foamNoise = wnoise(wp * 4.5 - vec3(uTime * 0.15, 0.0, uTime * 0.12));
          float foam = smoothstep(0.66, 0.82, foamNoise) * ripple;

          vec3 deepColor = vec3(0.12, 0.44, 0.56);
          vec3 shallowColor = vec3(0.30, 0.78, 0.74);
          vec3 foamColor = vec3(0.96, 1.0, 0.98);

          float depthFactor = smoothstep(0.35, 0.75, n1);
          vec3 baseWater = mix(deepColor, shallowColor, depthFactor);

          diffuseColor.rgb = mix(baseWater, foamColor, clamp(glint * 0.85 + foam * 0.75 + streak * 0.35, 0.0, 1.0));
          diffuseColor.a = clamp(0.70 + glint * 0.25 + foam * 0.28, 0.0, 0.95);
        }`
      );
  };

  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  mesh.renderOrder = 2;
  mesh.name = 'water';

  return mesh;
}
