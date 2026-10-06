import * as THREE from 'three';
import { getPlanetMatrix } from '../place/placeOnPlanet';

const beaconVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const beaconFragmentShader = `
  varying vec2 vUv;
  uniform vec3 uColor;
  uniform float uTime;
  void main() {
    float fade = pow(1.0 - vUv.y, 1.6);
    float edge = smoothstep(0.0, 0.35, 0.5 - abs(vUv.x - 0.5));
    float pulse = 0.85 + 0.15 * sin(uTime * 2.0);
    gl_FragColor = vec4(uColor, fade * edge * 0.55 * pulse);
  }
`;

export interface PoiBeamHandle {
  mesh: THREE.Mesh;
  ring: THREE.Mesh;
  uniforms: { uColor: { value: THREE.Color }; uTime: { value: number } };
  setCheckedIn(checked: boolean): void;
}

const UNCHECKED_COLOR = new THREE.Color(0xfff3c4); // warm yellow-cream
const CHECKED_COLOR = new THREE.Color(0x7bc45a);   // green

export function createPoiBeam(dir: THREE.Vector3, checkedIn = false): PoiBeamHandle {
  const uniforms = {
    uColor: { value: checkedIn ? CHECKED_COLOR.clone() : UNCHECKED_COLOR.clone() },
    uTime: { value: 0 },
  };

  const beaconMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms,
    vertexShader: beaconVertexShader,
    fragmentShader: beaconFragmentShader,
  });

  // Thin, tall, open-ended cylinder
  const g = new THREE.CylinderGeometry(0.22, 0.32, 13, 16, 1, true);
  g.translate(0, 6.5, 0);
  const mesh = new THREE.Mesh(g, beaconMat);
  mesh.matrixAutoUpdate = false;
  mesh.matrix.copy(getPlanetMatrix(dir, 0, 1, 0));

  // Glowing ring at the base
  const ringGeo = new THREE.RingGeometry(0.8, 1.2, 24);
  const ringMat = new THREE.MeshBasicMaterial({
    color: uniforms.uColor.value,
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.matrixAutoUpdate = false;
  ring.matrix.copy(getPlanetMatrix(dir, 0, 1, 0.1));

  return {
    mesh,
    ring,
    uniforms,
    setCheckedIn(checked: boolean) {
      const c = checked ? CHECKED_COLOR : UNCHECKED_COLOR;
      uniforms.uColor.value.copy(c);
      (ringMat as THREE.MeshBasicMaterial).color.copy(c);
      // Reduce opacity for checked-in beacons
      beaconMat.opacity = checked ? 0.3 : 1.0;
      ringMat.opacity = checked ? 0.2 : 0.4;
    },
  };
}
