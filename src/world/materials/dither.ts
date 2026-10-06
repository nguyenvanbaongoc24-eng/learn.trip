import * as THREE from 'three';

export interface DitherUniforms {
  uPlayerNDC: { value: THREE.Vector2 };
  uPlayerDepth: { value: number };
  uRadius: { value: number };
  uAspect: { value: number };
  uAmount: { value: number };
  uRes: { value: THREE.Vector2 };
}

export const ditherUniforms: DitherUniforms = {
  uPlayerNDC: { value: new THREE.Vector2(0, 0) },
  uPlayerDepth: { value: 0 },
  uRadius: { value: 0.35 },
  uAspect: { value: 1.0 },
  uAmount: { value: 0.8 },
  uRes: { value: new THREE.Vector2(1920, 1080) }
};

export function applyDither(mat: THREE.Material) {
  if (mat.userData.learnTripDither) return;
  mat.userData.learnTripDither = true;
  const previousCompile = mat.onBeforeCompile;
  mat.onBeforeCompile = (s, renderer) => {
    previousCompile(s, renderer);
    Object.assign(s.uniforms, ditherUniforms);
    s.fragmentShader = s.fragmentShader
      .replace('#include <common>', `#include <common>
        uniform vec2 uPlayerNDC; uniform float uPlayerDepth, uRadius, uAspect, uAmount; uniform vec2 uRes;`)
      .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
        {
          vec2 ndc = gl_FragCoord.xy / uRes * 2.0 - 1.0;
          float d = length((ndc - uPlayerNDC) * vec2(uAspect, 1.0));
          if (-vViewPosition.z < uPlayerDepth - 1.4) {
            float k = (1.0 - smoothstep(uRadius * 0.3, uRadius, d)) * uAmount;
            float n = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
            if (n < k) discard;
          }
        }`);
  };
  mat.needsUpdate = true;
}

/**
 * Apply camera-to-player screen-door fading to authored landmark meshes.
 * Transparent water, particles and shader materials keep their own render
 * path; the fade is for solid walls, trees and props that can hide the player.
 */
export function applyDitherToObject(root: THREE.Object3D) {
  root.traverse((object) => {
    if (!(object as THREE.Mesh).isMesh) return;
    const mesh = object as THREE.Mesh;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    materials.forEach((material) => {
      if (!material || material.transparent || material instanceof THREE.ShaderMaterial) return;
      applyDither(material);
    });
  });
}
