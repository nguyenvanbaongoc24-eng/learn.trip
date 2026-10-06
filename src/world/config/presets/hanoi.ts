import * as THREE from 'three';

export const dirFromLatLon = (latDeg: number, lonDeg: number) =>
  new THREE.Vector3().setFromSphericalCoords(1, Math.PI/2 - THREE.MathUtils.degToRad(latDeg), THREE.MathUtils.degToRad(lonDeg));

export const hanoiPreset = {
  stages: [
    { id: 'hoanKiem', index: 1, dir: dirFromLatLon(0, 0), flatR: 4.0, baseH: 0.1 },
    { id: 'phoCo', index: 2, dir: dirFromLatLon(22, 10), flatR: 4.0, baseH: 0.2 },
    { id: 'vanMieu', index: 3, dir: dirFromLatLon(0, -75), flatR: 4.0, baseH: 0.2 },
    { id: 'amThuc', index: 4, dir: dirFromLatLon(25, 55), flatR: 4.0, baseH: 0.2 },
    { id: 'longBien', index: 5, dir: dirFromLatLon(0, 75), flatR: 4.0, baseH: -0.2 },
    { id: 'motCot', index: 6, dir: dirFromLatLon(-22, -15), flatR: 4.0, baseH: 0.1 }
  ],
  waters: [
    { type: 'lake', dir: dirFromLatLon(0, 0), radius: 5.2, depth: 0.68 },
    { type: 'lake', dir: dirFromLatLon(-20, -35), radius: 5.8, depth: 0.72 },
    { type: 'lake', dir: dirFromLatLon(0, 75), radius: 6.5, depth: 0.75 }
  ],
  paths: [
    [dirFromLatLon(0, 0), dirFromLatLon(22, 10)],
    [dirFromLatLon(22, 10), dirFromLatLon(25, 55)],
    [dirFromLatLon(25, 55), dirFromLatLon(0, 75)],
    [dirFromLatLon(0, 75), dirFromLatLon(-22, -15)],
    [dirFromLatLon(-22, -15), dirFromLatLon(0, -75)],
    [dirFromLatLon(0, -75), dirFromLatLon(0, 0)]
  ]
};
