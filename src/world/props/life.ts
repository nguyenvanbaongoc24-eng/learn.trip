import * as THREE from 'three';
import { getToonMaterial, createToonMesh } from '../materials/toon';
import { C } from '../config/palette';

// ── 1. Chibi Stylized NPC ──
export function createNPC(options: {
  shirtColor?: number;
  pantsColor?: number;
  outfitColor?: number;
  skinColor?: number;
  hairColor?: number;
  scale?: number;
  hat?: 'nonla' | 'cap' | 'bucket' | 'none';
  hasHat?: boolean;
  pose?: 'stand' | 'sit' | 'photo' | 'bend' | 'walk' | 'idle' | 'sitting';
  action?: 'stand' | 'sit' | 'photo' | 'bend' | 'walk' | 'idle' | 'sitting';
} = {}): THREE.Group {
  const shirtColor = options.shirtColor ?? options.outfitColor ?? 0xe8d8c0;
  const pantsColor = options.pantsColor ?? (options.outfitColor !== undefined ? options.outfitColor : 0x384858);
  const skinColor = options.skinColor ?? 0xf5d8c2;
  const hairColor = options.hairColor ?? 0x2a1a0e;
  const scale = options.scale ?? 1;
  const hat = options.hat ?? (options.hasHat === false ? 'none' : options.hasHat === true ? 'nonla' : 'nonla');
  const rawPose = options.pose ?? options.action ?? 'stand';
  const pose = rawPose === 'sitting' ? 'sit' : rawPose;

  const g = new THREE.Group();
  const skinMat = getToonMaterial(skinColor);
  const shirtMat = getToonMaterial(shirtColor);
  const pantsMat = getToonMaterial(pantsColor);
  const hatMat = getToonMaterial(0xd8c282);
  const hairMat = getToonMaterial(hairColor);
  const shoeMat = getToonMaterial(0x2c2420);
  const eyeMat = getToonMaterial(0x1a1a1a);

  // Shoes
  const shoeGeo = new THREE.BoxGeometry(0.055, 0.035, 0.08);
  const leftShoe = createToonMesh(shoeGeo, shoeMat, { outline: 0.01 });
  leftShoe.position.set(-0.06, 0.016, 0.015);
  const rightShoe = createToonMesh(shoeGeo.clone(), shoeMat, { outline: 0.01 });
  rightShoe.position.set(0.06, 0.016, 0.015);
  g.add(leftShoe, rightShoe);

  // Legs
  const legGeo = new THREE.CylinderGeometry(0.038, 0.042, 0.34, 6);
  legGeo.translate(0, 0.17, 0);
  const leftLeg = createToonMesh(legGeo, pantsMat, { outline: 0.015 });
  leftLeg.position.set(-0.06, 0.03, 0);
  const rightLeg = createToonMesh(legGeo.clone(), pantsMat, { outline: 0.015 });
  rightLeg.position.set(0.06, 0.03, 0);
  g.add(leftLeg, rightLeg);

  // Torso
  const torsoGeo = new THREE.CylinderGeometry(0.11, 0.13, 0.36, 8);
  torsoGeo.translate(0, 0.18, 0);
  const torso = createToonMesh(torsoGeo, shirtMat, { outline: 0.018 });
  torso.position.y = 0.37;
  g.add(torso);

  // Arms (upper = shirt, forearm = skin)
  const upperArmGeo = new THREE.CylinderGeometry(0.032, 0.035, 0.2, 6);
  upperArmGeo.translate(0, -0.1, 0);
  const forearmGeo = new THREE.CylinderGeometry(0.028, 0.032, 0.16, 6);
  forearmGeo.translate(0, -0.08, 0);

  const leftUpperArm = createToonMesh(upperArmGeo, shirtMat, { outline: 0.012 });
  leftUpperArm.position.set(-0.15, 0.7, 0);
  leftUpperArm.rotation.z = 0.12;
  const leftForearm = createToonMesh(forearmGeo, skinMat, { outline: 0.01 });
  leftForearm.position.set(-0.155, 0.5, 0);

  const rightUpperArm = createToonMesh(upperArmGeo.clone(), shirtMat, { outline: 0.012 });
  rightUpperArm.position.set(0.15, 0.7, 0);
  rightUpperArm.rotation.z = -0.12;
  const rightForearm = createToonMesh(forearmGeo.clone(), skinMat, { outline: 0.01 });
  rightForearm.position.set(0.155, 0.5, 0);
  g.add(leftUpperArm, leftForearm, rightUpperArm, rightForearm);

  // Hands
  const handGeo = new THREE.SphereGeometry(0.025, 5, 4);
  const leftHand = createToonMesh(handGeo, skinMat, { outline: 0.008 });
  leftHand.position.set(-0.16, 0.42, 0);
  const rightHand = createToonMesh(handGeo.clone(), skinMat, { outline: 0.008 });
  rightHand.position.set(0.16, 0.42, 0);
  g.add(leftHand, rightHand);

  // Neck
  const neckGeo = new THREE.CylinderGeometry(0.04, 0.055, 0.06, 6);
  const neck = createToonMesh(neckGeo, skinMat, { outline: 0.01 });
  neck.position.y = 0.76;
  g.add(neck);

  // Head
  const headGeo = new THREE.SphereGeometry(0.12, 10, 8);
  headGeo.scale(1, 1.08, 0.95);
  const head = createToonMesh(headGeo, skinMat, { outline: 0.018 });
  head.position.y = 0.88;
  g.add(head);

  // Hair (back hemisphere)
  const hairGeo = new THREE.SphereGeometry(0.125, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.65);
  hairGeo.scale(1.02, 1.06, 1.0);
  const hair = createToonMesh(hairGeo, hairMat, { outline: 0.015 });
  hair.position.y = 0.88;
  hair.rotation.x = -0.15;
  g.add(hair);

  // Eyes
  const eyeGeo = new THREE.SphereGeometry(0.018, 5, 4);
  const leftEye = createToonMesh(eyeGeo, eyeMat, { outline: 0 });
  leftEye.position.set(-0.04, 0.9, 0.1);
  const rightEye = createToonMesh(eyeGeo.clone(), eyeMat, { outline: 0 });
  rightEye.position.set(0.04, 0.9, 0.1);
  g.add(leftEye, rightEye);

  // Eyebrows
  const browGeo = new THREE.CylinderGeometry(0.002, 0.002, 0.035, 4);
  browGeo.rotateZ(Math.PI / 2);
  const leftBrow = createToonMesh(browGeo, hairMat, { outline: 0 });
  leftBrow.position.set(-0.04, 0.925, 0.105);
  const rightBrow = createToonMesh(browGeo.clone(), hairMat, { outline: 0 });
  rightBrow.position.set(0.04, 0.925, 0.105);
  g.add(leftBrow, rightBrow);

  // Mouth
  const mouthGeo = new THREE.CylinderGeometry(0.002, 0.002, 0.025, 4);
  mouthGeo.rotateZ(Math.PI / 2);
  const mouthMat = getToonMaterial(0xc4827a);
  const mouth = createToonMesh(mouthGeo, mouthMat, { outline: 0 });
  mouth.position.set(0, 0.865, 0.108);
  g.add(mouth);

  // Hat
  if (hat === 'nonla') {
    const nonLaGeo = new THREE.ConeGeometry(0.24, 0.12, 12);
    const nonLa = createToonMesh(nonLaGeo, hatMat, { outline: 0.02 });
    nonLa.position.y = 1.0;
    g.add(nonLa);
  } else if (hat === 'cap') {
    const capGeo = new THREE.SphereGeometry(0.13, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.45);
    const cap = createToonMesh(capGeo, hatMat, { outline: 0.015 });
    cap.position.y = 0.91;
    g.add(cap);
  }

  // Poses
  if (pose === 'sit') {
    leftLeg.rotation.x = -Math.PI / 2;
    rightLeg.rotation.x = -Math.PI / 2;
    leftShoe.position.set(-0.06, 0.2, 0.2);
    rightShoe.position.set(0.06, 0.2, 0.2);
    torso.position.y = 0.24;
    neck.position.y = 0.63;
    head.position.y = 0.72;
    hair.position.y = 0.72;
    leftEye.position.set(-0.04, 0.74, 0.1);
    rightEye.position.set(0.04, 0.74, 0.1);
    mouth.position.set(0, 0.71, 0.108);
    leftUpperArm.position.y = 0.56;
    rightUpperArm.position.y = 0.56;
    leftForearm.position.y = 0.4;
    rightForearm.position.y = 0.4;
    leftHand.position.y = 0.33;
    rightHand.position.y = 0.33;
  } else if (pose === 'photo') {
    leftUpperArm.rotation.x = -0.8;
    rightUpperArm.rotation.x = -0.8;
    leftUpperArm.rotation.z = 0.3;
    rightUpperArm.rotation.z = -0.3;
    leftForearm.position.set(-0.08, 0.62, 0.12);
    rightForearm.position.set(0.08, 0.62, 0.12);
    leftHand.position.set(-0.06, 0.56, 0.15);
    rightHand.position.set(0.06, 0.56, 0.15);
    const camGeo = new THREE.BoxGeometry(0.08, 0.05, 0.04);
    const camMat2 = getToonMaterial(0x222222);
    const cam = createToonMesh(camGeo, camMat2, { outline: 0.01 });
    cam.position.set(0, 0.57, 0.15);
    g.add(cam);
  } else if (pose === 'bend') {
    torso.rotation.x = 0.65;
    torso.position.y = 0.28;
    neck.position.set(0, 0.58, 0.16);
    head.position.set(0, 0.64, 0.22);
    hair.position.set(0, 0.64, 0.22);
    leftEye.position.set(-0.04, 0.66, 0.32);
    rightEye.position.set(0.04, 0.66, 0.32);
    mouth.position.set(0, 0.63, 0.33);
  } else if (pose === 'walk') {
    leftLeg.rotation.x = -0.35;
    rightLeg.rotation.x = 0.35;
    leftUpperArm.rotation.x = 0.3;
    rightUpperArm.rotation.x = -0.3;
  }

  g.scale.setScalar(scale);
  return g;
}

// ── 2. Fluttering Butterflies ──
export function createButterflyGroup(): { group: THREE.Group; update: (time: number) => void } {
  const group = new THREE.Group();
  const colors = [0xf7f5ec, 0xf6d65a, 0x9ecfe8, 0xf09a4a];
  const butterflies: Array<{
    mesh: THREE.Group;
    leftWing: THREE.Mesh;
    rightWing: THREE.Mesh;
    speed: number;
    phase: number;
    radius: number;
    center: THREE.Vector3;
  }> = [];

  const wingGeo = new THREE.PlaneGeometry(0.12, 0.12);
  wingGeo.translate(0.06, 0, 0);

  for (let i = 0; i < 8; i++) {
    const bGroup = new THREE.Group();
    const col = colors[i % colors.length];
    const wingMat = new THREE.MeshBasicMaterial({
      color: col,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });

    const leftWing = new THREE.Mesh(wingGeo, wingMat);
    const rightWing = new THREE.Mesh(wingGeo.clone(), wingMat);
    rightWing.scale.x = -1;

    bGroup.add(leftWing, rightWing);
    group.add(bGroup);

    butterflies.push({
      mesh: bGroup,
      leftWing,
      rightWing,
      speed: 0.4 + Math.random() * 0.4,
      phase: Math.random() * 50,
      radius: 3 + Math.random() * 4,
      center: new THREE.Vector3(
        (Math.random() - 0.5) * 12,
        28.5 + Math.random() * 0.8,
        (Math.random() - 0.5) * 12
      ),
    });
  }

  return {
    group,
    update: (time: number) => {
      for (const b of butterflies) {
        const t = time * b.speed + b.phase;
        b.mesh.position.set(
          b.center.x + Math.sin(t) * b.radius + Math.sin(t * 2.3) * 0.6,
          b.center.y + Math.sin(t * 1.5) * 0.4,
          b.center.z + Math.cos(t * 0.8) * b.radius
        );
        b.mesh.rotation.y = t + Math.PI / 2;

        const flap = Math.sin(time * 24 + b.phase) * 0.9 + 0.3;
        b.leftWing.rotation.z = flap;
        b.rightWing.rotation.z = -flap;
      }
    },
  };
}

// ── 3. Seagulls in Flight ──
export function createGullsGroup(): { group: THREE.Group; update: (time: number) => void } {
  const group = new THREE.Group();
  const gulls: Array<{
    mesh: THREE.Group;
    leftWing: THREE.Mesh;
    rightWing: THREE.Mesh;
    phase: number;
    orbitR: number;
    orbitSpeed: number;
    height: number;
  }> = [];

  const bodyGeo = new THREE.BoxGeometry(0.12, 0.07, 0.32);
  const gullMat = getToonMaterial(0xfcfcfc);
  const wingMat = getToonMaterial(0xdedede);

  const wingGeo = new THREE.BoxGeometry(0.48, 0.015, 0.12);
  wingGeo.translate(0.24, 0, 0);

  for (let i = 0; i < 6; i++) {
    const gMesh = new THREE.Group();
    const body = createToonMesh(bodyGeo, gullMat, { outline: 0.012 });
    gMesh.add(body);

    const leftWing = createToonMesh(wingGeo, wingMat, { outline: 0.01 });
    leftWing.position.set(0.06, 0.02, 0);
    const rightWing = createToonMesh(wingGeo.clone(), wingMat, { outline: 0.01 });
    rightWing.position.set(-0.06, 0.02, 0);
    rightWing.scale.x = -1;

    gMesh.add(leftWing, rightWing);
    group.add(gMesh);

    gulls.push({
      mesh: gMesh,
      leftWing,
      rightWing,
      phase: i * (Math.PI / 3),
      orbitR: 12 + Math.random() * 8,
      orbitSpeed: 0.25 + Math.random() * 0.15,
      height: 33 + Math.random() * 4,
    });
  }

  return {
    group,
    update: (time: number) => {
      for (const g of gulls) {
        const t = time * g.orbitSpeed + g.phase;
        g.mesh.position.set(
          Math.cos(t) * g.orbitR,
          g.height + Math.sin(t * 1.5) * 0.8,
          Math.sin(t) * g.orbitR
        );
        g.mesh.rotation.y = -t;
        g.mesh.rotation.z = -0.2;

        const flap = Math.sin(time * 7 + g.phase) * 0.45;
        g.leftWing.rotation.z = flap;
        g.rightWing.rotation.z = -flap;
      }
    },
  };
}

// ── 4. Wooden Boat (Sampan) on Water ──
export function createWoodenBoat(color = 0x5a3a24): THREE.Group {
  const g = new THREE.Group();
  const boatMat = getToonMaterial(color);

  // Hull
  const hullGeo = new THREE.BoxGeometry(0.7, 0.28, 1.8);
  const hull = createToonMesh(hullGeo, boatMat, { outline: 0.02 });
  hull.position.y = 0.1;
  g.add(hull);

  // Bow wedge
  const bowGeo = new THREE.ConeGeometry(0.35, 0.5, 4);
  bowGeo.rotateX(Math.PI / 2);
  bowGeo.rotateZ(Math.PI / 4);
  const bow = createToonMesh(bowGeo, boatMat, { outline: 0.02 });
  bow.position.set(0, 0.12, 1.1);
  g.add(bow);

  // Bench
  const benchGeo = new THREE.BoxGeometry(0.65, 0.05, 0.25);
  const bench = createToonMesh(benchGeo, getToonMaterial(0x8a5a3a), { outline: 0.015 });
  bench.position.set(0, 0.22, 0);
  g.add(bench);

  return g;
}

// ── 5. Wooden Telephone Poles with Sagging Wires ──
export function createTelephonePolesAlongPath(pathCoords: number[][], R: number = 28): THREE.Group {
  const group = new THREE.Group();
  const poleMat = getToonMaterial(0x6a5442);
  const poleGeo = new THREE.CylinderGeometry(0.06, 0.08, 3.2, 6);
  poleGeo.translate(0, 1.6, 0);

  const crossbarGeo = new THREE.BoxGeometry(0.9, 0.06, 0.06);
  crossbarGeo.translate(0, 2.9, 0);

  const poleTops: THREE.Vector3[] = [];

  for (let i = 0; i < pathCoords.length; i += 2) {
    const coord = pathCoords[i];
    const pole = new THREE.Group();
    const pMesh = createToonMesh(poleGeo, poleMat, { outline: 0.018 });
    const cMesh = createToonMesh(crossbarGeo, poleMat, { outline: 0.015 });
    pole.add(pMesh, cMesh);

    // Position around path
    const lat = (coord[0] * Math.PI) / 180;
    const lon = (coord[1] * Math.PI) / 180;
    const dir = new THREE.Vector3(
      Math.cos(lat) * Math.sin(lon),
      Math.sin(lat),
      Math.cos(lat) * Math.cos(lon)
    );

    pole.position.copy(dir).multiplyScalar(R);
    pole.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    group.add(pole);

    const topPos = pole.position.clone().addScaledVector(dir, 2.9);
    poleTops.push(topPos);
  }

  // Sagging wires between consecutive poles
  const lineMat = new THREE.LineBasicMaterial({ color: 0x333333, transparent: true, opacity: 0.75 });
  for (let i = 0; i < poleTops.length - 1; i++) {
    const p1 = poleTops[i];
    const p2 = poleTops[i + 1];
    if (p1.distanceTo(p2) > 12) continue;

    const points: THREE.Vector3[] = [];
    const segments = 8;
    for (let s = 0; s <= segments; s++) {
      const alpha = s / segments;
      const pt = new THREE.Vector3().lerpVectors(p1, p2, alpha);
      // Sagging gravity curve
      const sag = Math.sin(alpha * Math.PI) * 0.28;
      pt.normalize().multiplyScalar(pt.length() - sag);
      points.push(pt);
    }
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    group.add(new THREE.Line(lineGeo, lineMat));
  }

  return group;
}

// ── 6. Catenary Wire Curve ──
export function createCatenaryWire(p1: THREE.Vector3, p2: THREE.Vector3, sag = 0.32, segments = 14, color = 0x24282a): THREE.Line {
  const points: THREE.Vector3[] = [];
  for (let s = 0; s <= segments; s++) {
    const t = s / segments;
    const pt = new THREE.Vector3().lerpVectors(p1, p2, t);
    pt.y -= 4 * sag * t * (1 - t);
    points.push(pt);
  }
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.85 });
  return new THREE.Line(geo, mat);
}

// ── 7. Iconic Hanoi Flower Vendor Bicycle (Xe đạp chở hoa rong) ──
export function createFlowerBicycle(): THREE.Group {
  const bike = new THREE.Group();
  const ironMat = getToonMaterial(0x282c30);
  const spokeMat = getToonMaterial(0x9ca3af);
  const leatherMat = getToonMaterial(0x5c3822);
  const basketMat = getToonMaterial(0xc29b62); // Woven bamboo

  // Wheels (Front & Rear)
  const wheelGeo = new THREE.TorusGeometry(0.32, 0.022, 6, 16);
  const frontWheel = createToonMesh(wheelGeo, ironMat, { outline: 0.01 });
  frontWheel.position.set(0, 0.32, 0.62);
  const rearWheel = createToonMesh(wheelGeo.clone(), ironMat, { outline: 0.01 });
  rearWheel.position.set(0, 0.32, -0.62);
  bike.add(frontWheel, rearWheel);

  // Bicycle Diamond Frame Tubes
  const frameGroup = new THREE.Group();
  const makeTube = (p1: THREE.Vector3, p2: THREE.Vector3, r = 0.02) => {
    const len = p1.distanceTo(p2);
    const geo = new THREE.CylinderGeometry(r, r, len, 6);
    const m = createToonMesh(geo, ironMat, { outline: 0.008 });
    m.position.copy(p1).lerp(p2, 0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p2.clone().sub(p1).normalize());
    return m;
  };

  const bb = new THREE.Vector3(0, 0.28, -0.15); // Bottom bracket
  const st = new THREE.Vector3(0, 0.68, -0.22); // Seat post
  const ht = new THREE.Vector3(0, 0.72, 0.48);  // Head tube
  const rw = new THREE.Vector3(0, 0.32, -0.62); // Rear hub
  const fw = new THREE.Vector3(0, 0.32, 0.62);  // Front hub

  frameGroup.add(makeTube(bb, st));
  frameGroup.add(makeTube(bb, ht));
  frameGroup.add(makeTube(st, ht));
  frameGroup.add(makeTube(st, rw));
  frameGroup.add(makeTube(bb, rw));
  frameGroup.add(makeTube(ht, fw));

  // Handlebars
  const handleBar = makeTube(new THREE.Vector3(-0.24, 0.82, 0.44), new THREE.Vector3(0.24, 0.82, 0.44), 0.018);
  frameGroup.add(handleBar);

  // Saddle
  const saddle = createToonMesh(new THREE.BoxGeometry(0.12, 0.04, 0.22), leatherMat, { outline: 0.01 });
  saddle.position.copy(st).add(new THREE.Vector3(0, 0.03, -0.02));
  frameGroup.add(saddle);

  // Kickstand leaning the bike slightly
  const kick = makeTube(bb, bb.clone().add(new THREE.Vector3(-0.25, -0.26, 0.05)), 0.015);
  frameGroup.add(kick);

  bike.add(frameGroup);

  // Rear Luggage Carrier (Baga) with Bamboo Flower Baskets
  const carrier = createToonMesh(new THREE.BoxGeometry(0.22, 0.03, 0.55), ironMat, { outline: 0.01 });
  carrier.position.set(0, 0.62, -0.52);
  bike.add(carrier);

  // 2 Large Woven Bamboo Baskets flanking the rear wheel
  for (const bx of [-0.22, 0.22]) {
    const basket = new THREE.Group();
    const bMesh = createToonMesh(new THREE.CylinderGeometry(0.24, 0.16, 0.42, 10), basketMat, { outline: 0.015 });
    bMesh.position.y = 0.21;
    basket.add(bMesh);

    // Floral Bouquets overflowing: Daisies, sunflowers, pink lotuses, and eucalyptus greens
    const flowerPalette = [0xffffff, 0xffffff, 0xfcd34d, 0xfb923c, 0xf472b6, 0x4ade80, 0x15803d];
    for (let f = 0; f < 32; f++) {
      const col = flowerPalette[f % flowerPalette.length];
      const flowerMat = getToonMaterial(col);
      const fGeo = new THREE.SphereGeometry(0.045 + (f % 4) * 0.012, 5, 4);
      const fMesh = createToonMesh(fGeo, flowerMat, { outline: 0.008 });
      const angle = (f / 32) * Math.PI * 2;
      const rad = 0.05 + Math.random() * 0.18;
      fMesh.position.set(
        Math.cos(angle) * rad,
        0.42 + Math.random() * 0.18,
        Math.sin(angle) * rad
      );
      basket.add(fMesh);
    }

    basket.position.set(bx, 0.45, -0.52);
    basket.rotation.z = bx > 0 ? 0.08 : -0.08;
    bike.add(basket);
  }

  // Vietnamese Conical Leaf Hat (Nón lá) hanging on the handlebar
  const hatMat = getToonMaterial(0xd8c282);
  const nonLa = createToonMesh(new THREE.ConeGeometry(0.22, 0.11, 12), hatMat, { outline: 0.015 });
  nonLa.position.set(0.18, 0.72, 0.46);
  nonLa.rotation.z = 0.45;
  nonLa.rotation.x = -0.3;
  bike.add(nonLa);

  bike.rotation.z = -0.06; // Realistic kickstand lean
  return bike;
}

// ── 8. Weeping Willow Tree (Cây Liễu rủ ven hồ Hoàn Kiếm) ──
export function createWeepingWillow(): THREE.Group {
  const tree = new THREE.Group();
  const trunkMat = getToonMaterial(0x524032);
  const foliageMat = getToonMaterial(0x568a48);

  // Gnarled leaning trunk
  const trunkGeo = new THREE.CylinderGeometry(0.28, 0.42, 3.2, 8);
  const trunk = createToonMesh(trunkGeo, trunkMat, { outline: 0.025 });
  trunk.position.set(0, 1.5, 0);
  trunk.rotation.z = 0.18;
  tree.add(trunk);

  // Main arching branches
  for (let b = 0; b < 6; b++) {
    const bAngle = (b / 6) * Math.PI * 2;
    const branch = new THREE.Group();

    const bTrunk = createToonMesh(new THREE.CylinderGeometry(0.12, 0.22, 2.2, 6), trunkMat, { outline: 0.02 });
    bTrunk.position.y = 1.0;
    bTrunk.rotation.z = 0.65;
    branch.add(bTrunk);

    // Drooping foliage clusters
    for (let c = 0; c < 4; c++) {
      const dropGeo = new THREE.ConeGeometry(0.45 - c * 0.08, 1.8 + c * 0.3, 7);
      dropGeo.rotateX(Math.PI); // Point downwards
      const drop = createToonMesh(dropGeo, foliageMat, { outline: 0.015 });
      drop.position.set(1.4 + c * 0.35, 1.2 - c * 0.25, (Math.random() - 0.5) * 0.4);
      branch.add(drop);
    }

    branch.position.set(0, 2.8, 0);
    branch.rotation.y = bAngle;
    tree.add(branch);
  }

  return tree;
}

// ── 9. Floating Rocking Sampan Boat with Rope Tether ──
export function createFloatingBoat(color = 0x633e24): {
  group: THREE.Group;
  update: (time: number) => void;
} {
  const root = new THREE.Group();
  const boat = createWoodenBoat(color);
  root.add(boat);

  // Oars resting across gunwale
  const oarMat = getToonMaterial(0x8a6242);
  const oarGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.6, 6);
  const oar1 = createToonMesh(oarGeo, oarMat, { outline: 0.01 });
  oar1.position.set(-0.35, 0.28, 0.2);
  oar1.rotation.z = 0.5;
  oar1.rotation.y = 0.2;
  boat.add(oar1);

  // Mooring Wooden Stake
  const stakeMat = getToonMaterial(0x4a3220);
  const stake = createToonMesh(new THREE.CylinderGeometry(0.06, 0.08, 0.7, 6), stakeMat, { outline: 0.015 });
  stake.position.set(1.5, 0.35, 0);
  root.add(stake);

  // Mooring Rope (catenary curve from boat to stake)
  const rope = createCatenaryWire(new THREE.Vector3(0, 0.22, 1.1), new THREE.Vector3(1.5, 0.35, 0), 0.15, 10, 0x8a7050);
  root.add(rope);

  const phase = Math.random() * Math.PI * 2;
  const baseY = boat.position.y;

  return {
    group: root,
    update: (time: number) => {
      // Gentle harmonic water rocking
      boat.position.y = baseY + Math.sin(time * 2.2 + phase) * 0.032;
      boat.rotation.z = Math.sin(time * 1.6 + phase) * 0.045;
      boat.rotation.x = Math.cos(time * 1.2 + phase) * 0.028;
    },
  };
}

// ── 10. Historic Train Crossing Long Bien Bridge ──
export function createHistoricTrain(): {
  group: THREE.Group;
  update: (dt: number) => void;
} {
  const train = new THREE.Group();
  const TRAIN_GREEN = 0x245436;
  const TRAIN_CREAM = 0xdfd4b2;
  const ROOF_GREY   = 0x45484c;
  const METAL_DARK  = 0x1f2326;
  const RED_ACCENT  = 0xb82626;

  // 1. Locomotive (Đầu máy hơi nước / Diesel cổ điển)
  const loco = new THREE.Group();

  // Boiler & Engine Body
  const boilerGeo = new THREE.CylinderGeometry(0.55, 0.55, 2.8, 12);
  boilerGeo.rotateZ(Math.PI / 2);
  const boiler = createToonMesh(boilerGeo, getToonMaterial(TRAIN_GREEN), { outline: 0.025 });
  boiler.position.set(-0.3, 0.9, 0);
  loco.add(boiler);

  // Driver Cab
  const cabGeo = new THREE.BoxGeometry(1.6, 1.5, 1.25);
  const cab = createToonMesh(cabGeo, getToonMaterial(TRAIN_CREAM), { outline: 0.025 });
  cab.position.set(1.3, 1.15, 0);
  loco.add(cab);

  const cabRoofGeo = new THREE.BoxGeometry(1.7, 0.12, 1.35);
  const cabRoof = createToonMesh(cabRoofGeo, getToonMaterial(ROOF_GREY), { outline: 0.02 });
  cabRoof.position.set(1.3, 1.95, 0);
  loco.add(cabRoof);

  // Smokestack & Golden Headlight
  const stack = createToonMesh(new THREE.CylinderGeometry(0.12, 0.16, 0.65, 8), getToonMaterial(METAL_DARK), { outline: 0.015 });
  stack.position.set(-1.2, 1.6, 0);
  loco.add(stack);

  const headlight = createToonMesh(new THREE.CylinderGeometry(0.14, 0.14, 0.2, 8), getToonMaterial(0xfde047), { outline: 0.015 });
  headlight.rotation.z = Math.PI / 2;
  headlight.position.set(-1.75, 1.05, 0);
  loco.add(headlight);

  // Red Cowcatcher (Plow)
  const cowcatcher = createToonMesh(new THREE.ConeGeometry(0.5, 0.65, 4), getToonMaterial(RED_ACCENT), { outline: 0.02 });
  cowcatcher.rotation.z = -Math.PI / 2;
  cowcatcher.position.set(-1.8, 0.35, 0);
  loco.add(cowcatcher);

  // Steel Wheels
  for (let w = -1.2; w <= 1.8; w += 0.75) {
    for (const z of [-0.55, 0.55]) {
      const wheel = createToonMesh(new THREE.CylinderGeometry(0.24, 0.24, 0.08, 10), getToonMaterial(METAL_DARK), { outline: 0.012 });
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(w, 0.28, z);
      loco.add(wheel);
    }
  }

  train.add(loco);

  // 2. Passenger Wagons (2 Toa xe khách cổ điển)
  for (let c = 0; c < 2; c++) {
    const coach = new THREE.Group();
    const cx = 3.6 + c * 3.5;

    const coachBody = createToonMesh(new THREE.BoxGeometry(3.1, 1.35, 1.2), getToonMaterial(TRAIN_CREAM), { outline: 0.025 });
    coachBody.position.y = 1.05;
    coach.add(coachBody);

    const greenStripe = createToonMesh(new THREE.BoxGeometry(3.12, 0.35, 1.22), getToonMaterial(TRAIN_GREEN), { outline: 0.015 });
    greenStripe.position.y = 0.75;
    coach.add(greenStripe);

    const coachRoof = createToonMesh(new THREE.BoxGeometry(3.2, 0.15, 1.3), getToonMaterial(ROOF_GREY), { outline: 0.02 });
    coachRoof.position.y = 1.78;
    coach.add(coachRoof);

    // Coach Wheels
    for (const wx of [-1.0, 1.0]) {
      for (const z of [-0.55, 0.55]) {
        const cWheel = createToonMesh(new THREE.CylinderGeometry(0.22, 0.22, 0.07, 8), getToonMaterial(METAL_DARK), { outline: 0.01 });
        cWheel.rotation.x = Math.PI / 2;
        cWheel.position.set(wx, 0.26, z);
        coach.add(cWheel);
      }
    }

    coach.position.x = cx;
    train.add(coach);
  }

  // Steam particle puffs
  const steamPuffs: THREE.Mesh[] = [];
  const steamMat = getToonMaterial(0xffffff, { transparent: true, opacity: 0.6 });
  for (let p = 0; p < 4; p++) {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.12 + p * 0.05, 6, 5), steamMat);
    puff.position.set(-1.2 - p * 0.4, 2.0 + p * 0.25, 0);
    train.add(puff);
    steamPuffs.push(puff);
  }

  let trainX = -12;
  const speed = 2.4;

  return {
    group: train,
    update: (dt: number) => {
      trainX += dt * speed;
      if (trainX > 16) {
        trainX = -16;
      }
      train.position.x = trainX;

      // Animate steam puffs
      for (let p = 0; p < steamPuffs.length; p++) {
        const puff = steamPuffs[p];
        puff.position.y = 1.9 + p * 0.22 + Math.sin(trainX * 3.0 + p) * 0.06;
        puff.scale.setScalar(1.0 + Math.sin(trainX * 2.0 + p) * 0.2);
      }
    },
  };
}

// ── 11. Fluttering Pigeons Flock with Proximity Startle Reaction ──
export function createPigeonsFlock(count = 8): {
  group: THREE.Group;
  update: (dt: number, playerWorldPos?: THREE.Vector3) => void;
} {
  const group = new THREE.Group();
  const PIGEON_GREY = 0x767d87;
  const PIGEON_BREAST = 0x5a8882;
  const BEAK_ORANGE = 0xdf8432;
  const WING_DARK = 0x484e56;

  const bodyMat = getToonMaterial(PIGEON_GREY);
  const breastMat = getToonMaterial(PIGEON_BREAST);
  const beakMat = getToonMaterial(BEAK_ORANGE);
  const wingMat = getToonMaterial(WING_DARK);

  const pigeons: Array<{
    mesh: THREE.Group;
    head: THREE.Group;
    leftWing: THREE.Mesh;
    rightWing: THREE.Mesh;
    homePos: THREE.Vector3;
    currentPos: THREE.Vector3;
    flightVel: THREE.Vector3;
    state: 'peck' | 'scared' | 'return';
    phase: number;
    timer: number;
  }> = [];

  for (let i = 0; i < count; i++) {
    const pMesh = new THREE.Group();

    // Body
    const bodyGeo = new THREE.SphereGeometry(0.12, 7, 6);
    bodyGeo.scale(0.85, 0.9, 1.25);
    const body = createToonMesh(bodyGeo, bodyMat, { outline: 0.01 });
    body.position.y = 0.12;
    pMesh.add(body);

    const breastGeo = new THREE.SphereGeometry(0.08, 6, 5);
    const breast = createToonMesh(breastGeo, breastMat, { outline: 0.008 });
    breast.position.set(0, 0.14, 0.08);
    pMesh.add(breast);

    // Head with beak
    const head = new THREE.Group();
    head.position.set(0, 0.22, 0.12);
    const headGeo = new THREE.SphereGeometry(0.055, 6, 6);
    const headMesh = createToonMesh(headGeo, bodyMat, { outline: 0.008 });
    head.add(headMesh);

    const beakGeo = new THREE.ConeGeometry(0.02, 0.05, 4);
    beakGeo.rotateX(Math.PI / 2);
    const beak = createToonMesh(beakGeo, beakMat, { outline: 0 });
    beak.position.set(0, 0, 0.055);
    head.add(beak);
    pMesh.add(head);

    // Wings
    const wingGeo = new THREE.BoxGeometry(0.16, 0.015, 0.18);
    wingGeo.translate(0.08, 0, 0);

    const leftWing = createToonMesh(wingGeo, wingMat, { outline: 0.008 });
    leftWing.position.set(0.07, 0.14, -0.02);
    pMesh.add(leftWing);

    const rightWing = createToonMesh(wingGeo.clone(), wingMat, { outline: 0.008 });
    rightWing.position.set(-0.07, 0.14, -0.02);
    rightWing.scale.x = -1;
    pMesh.add(rightWing);

    const ang = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const rad = 0.4 + Math.random() * 0.9;
    const homePos = new THREE.Vector3(Math.cos(ang) * rad, 0.02, Math.sin(ang) * rad);
    pMesh.position.copy(homePos);
    pMesh.rotation.y = Math.random() * Math.PI * 2;
    group.add(pMesh);

    pigeons.push({
      mesh: pMesh,
      head,
      leftWing,
      rightWing,
      homePos: homePos.clone(),
      currentPos: homePos.clone(),
      flightVel: new THREE.Vector3(),
      state: 'peck',
      phase: i * 0.7,
      timer: 0,
    });
  }

  const _flockCenter = new THREE.Vector3();

  return {
    group,
    update: (dt: number, playerWorldPos?: THREE.Vector3) => {
      group.getWorldPosition(_flockCenter);
      const isPlayerNear = playerWorldPos ? playerWorldPos.distanceTo(_flockCenter) < 2.5 : false;

      for (let i = 0; i < pigeons.length; i++) {
        const p = pigeons[i];
        p.phase += dt * 5.0;

        if (p.state === 'peck') {
          // Bobbing head pecking grain
          p.head.rotation.x = Math.sin(p.phase * 2.2) * 0.45;
          p.leftWing.rotation.z = 0;
          p.rightWing.rotation.z = 0;

          if (isPlayerNear) {
            // Startle and take off!
            p.state = 'scared';
            p.timer = 0;
            const burstAngle = Math.random() * Math.PI * 2;
            p.flightVel.set(
              Math.cos(burstAngle) * (1.2 + Math.random() * 1.0),
              2.4 + Math.random() * 0.8,
              Math.sin(burstAngle) * (1.2 + Math.random() * 1.0)
            );
          }
        } else if (p.state === 'scared') {
          p.timer += dt;
          // Rapid wing flap
          const flap = Math.sin(p.phase * 7.0) * 0.85;
          p.leftWing.rotation.z = flap;
          p.rightWing.rotation.z = -flap;

          p.currentPos.addScaledVector(p.flightVel, dt);
          p.flightVel.y -= dt * 1.4; // gravity decelerating ascent
          p.mesh.position.copy(p.currentPos);
          p.mesh.rotation.y = Math.atan2(p.flightVel.x, p.flightVel.z);

          if (p.timer > 2.5 && !isPlayerNear) {
            p.state = 'return';
          }
        } else if (p.state === 'return') {
          // Glide smoothly back to home position
          const flap = Math.sin(p.phase * 3.5) * 0.35;
          p.leftWing.rotation.z = flap;
          p.rightWing.rotation.z = -flap;

          p.currentPos.lerp(p.homePos, dt * 1.8);
          p.mesh.position.copy(p.currentPos);

          if (p.currentPos.distanceTo(p.homePos) < 0.15) {
            p.currentPos.copy(p.homePos);
            p.mesh.position.copy(p.homePos);
            p.state = 'peck';
          }
        }
      }
    },
  };
}


