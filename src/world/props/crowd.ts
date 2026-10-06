import * as THREE from 'three';
import { DestinationDef } from '../config/destinations';
import { dirFromLatLon } from '../interact/poiManager';
import { heightAt } from '../planet/terrain';
import { getToonMaterial, createToonMesh } from '../materials/toon';

interface CrowdWalker {
  group: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  head: THREE.Group;
  pathIndex: number;
  progress: number;
  speed: number;
  direction: 1 | -1;
  phase: number;
  currentPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  isPlazaWalker?: boolean;
  plazaCenter?: THREE.Vector3;
  plazaRadius?: number;
  plazaAngle?: number;
}

const UP = new THREE.Vector3(0, 1, 0);

export function createWalkingCrowd(
  dest: DestinationDef,
  planetRadius: number
): { group: THREE.Group; update: (dt: number, playerPos?: THREE.Vector3) => void } {
  const group = new THREE.Group();
  group.name = 'WalkingCrowd';

  const walkers: CrowdWalker[] = [];

  // Danh sách màu sắc trang phục phong phú của người dân Hà Nội / Việt Nam
  const outfitPalettes = [
    { shirt: 0xf5f5fa, pants: 0x223344, skin: 0xffd8b8, hat: 'nonla', scale: 0.95 }, // Nữ sinh áo dài trắng
    { shirt: 0xd94436, pants: 0x2a3648, skin: 0xf5d4b4, hat: 'cap', scale: 0.98 },   // Áo đỏ sao vàng / thể thao
    { shirt: 0x3678b8, pants: 0x48423a, skin: 0xf5d4b4, hat: 'none', scale: 0.94 },  // Áo sơ mi xanh công sở
    { shirt: 0x5a3e28, pants: 0x2b2b2b, skin: 0xe8bf9b, hat: 'nonla', scale: 0.90 }, // Bà bán hàng áo nâu
    { shirt: 0x3d8c52, pants: 0x334155, skin: 0xf5d4b4, hat: 'none', scale: 0.96 },  // Áo xanh lá thanh niên
    { shirt: 0xdec048, pants: 0x243248, skin: 0xf5d4b4, hat: 'cap', scale: 0.92 },   // Áo vàng hoa cúc
    { shirt: 0x8a3e78, pants: 0x1e293b, skin: 0xf5d4b4, hat: 'none', scale: 0.95 },  // Áo tím huế dịu dàng
    { shirt: 0x489aa8, pants: 0xd4c8b0, skin: 0xf5d4b4, hat: 'nonla', scale: 0.93 }, // Khách du lịch nón lá
  ];

  function buildWalkerMesh(palette: typeof outfitPalettes[0]) {
    const root = new THREE.Group();

    // 1. Chân trái & phải
    const legGeo = new THREE.CylinderGeometry(0.04, 0.045, 0.32, 6);
    legGeo.translate(0, -0.16, 0);
    const legMat = getToonMaterial(palette.pants);

    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.065, 0.36, 0);
    const lLegMesh = createToonMesh(legGeo, legMat, { outline: 0.015 });
    leftLeg.add(lLegMesh);
    root.add(leftLeg);

    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.065, 0.36, 0);
    const rLegMesh = createToonMesh(legGeo.clone(), legMat, { outline: 0.015 });
    rightLeg.add(rLegMesh);
    root.add(rightLeg);

    // 2. Thân người
    const torsoGeo = new THREE.CylinderGeometry(0.11, 0.13, 0.34, 8);
    torsoGeo.translate(0, 0.17, 0);
    const torsoMat = getToonMaterial(palette.shirt);
    const torso = createToonMesh(torsoGeo, torsoMat, { outline: 0.018 });
    torso.position.y = 0.34;
    root.add(torso);

    // 3. Đầu & tóc
    const head = new THREE.Group();
    head.position.y = 0.74;

    const faceGeo = new THREE.SphereGeometry(0.12, 10, 8);
    const faceMat = getToonMaterial(palette.skin);
    const face = createToonMesh(faceGeo, faceMat, { outline: 0.018 });
    head.add(face);

    // Mắt
    const eyeGeo = new THREE.SphereGeometry(0.018, 6, 6);
    const eyeMat = getToonMaterial(0x111111);
    const eyeL = createToonMesh(eyeGeo, eyeMat, { outline: 0 });
    eyeL.position.set(-0.045, 0.01, 0.11);
    head.add(eyeL);

    const eyeR = createToonMesh(eyeGeo.clone(), eyeMat, { outline: 0 });
    eyeR.position.set(0.045, 0.01, 0.11);
    head.add(eyeR);

    // Nón lá hoặc mũ
    if (palette.hat === 'nonla') {
      const hatGeo = new THREE.ConeGeometry(0.24, 0.12, 12);
      const hatMat = getToonMaterial(0xddcc99);
      const hat = createToonMesh(hatGeo, hatMat, { outline: 0.02 });
      hat.position.y = 0.14;
      head.add(hat);
    } else if (palette.hat === 'cap') {
      const capGeo = new THREE.SphereGeometry(0.13, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.45);
      const capMat = getToonMaterial(0xd85238);
      const cap = createToonMesh(capGeo, capMat, { outline: 0.015 });
      cap.position.y = 0.06;
      head.add(cap);
    }

    root.add(head);

    // 4. Tay trái & phải
    const armGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.28, 6);
    armGeo.translate(0, -0.14, 0);
    const armMat = getToonMaterial(palette.shirt);

    const leftArm = new THREE.Group();
    leftArm.position.set(-0.16, 0.62, 0);
    const lArmMesh = createToonMesh(armGeo, armMat, { outline: 0.015 });
    leftArm.add(lArmMesh);
    root.add(leftArm);

    const rightArm = new THREE.Group();
    rightArm.position.set(0.16, 0.62, 0);
    const rArmMesh = createToonMesh(armGeo.clone(), armMat, { outline: 0.015 });
    rightArm.add(rArmMesh);
    root.add(rightArm);

    // 5. Bóng chân
    const shadowGeo = new THREE.CircleGeometry(0.22, 10);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x1d3538,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
    });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.position.y = 0.02;
    root.add(shadow);

    root.scale.setScalar(palette.scale * 1.15);

    return { root, leftLeg, rightLeg, leftArm, rightArm, head };
  }

  // A. Khởi tạo người đi bộ dọc theo các tuyến đường nối (Path Walkers)
  const paths = dest.paths && dest.paths.length ? dest.paths : [];
  paths.forEach((pathSeg, pIdx) => {
    // 2 người đi bộ ngược chiều nhau trên mỗi đoạn đường
    for (let w = 0; w < 2; w++) {
      const palette = outfitPalettes[(pIdx * 2 + w) % outfitPalettes.length];
      const { root, leftLeg, rightLeg, leftArm, rightArm, head } = buildWalkerMesh(palette);

      const walker: CrowdWalker = {
        group: root,
        leftLeg,
        rightLeg,
        leftArm,
        rightArm,
        head,
        pathIndex: pIdx,
        progress: (w * 0.5 + Math.random() * 0.3) % 1.0,
        speed: 0.045 + Math.random() * 0.02,
        direction: w % 2 === 0 ? 1 : -1,
        phase: Math.random() * Math.PI * 2,
        currentPos: new THREE.Vector3(),
        targetPos: new THREE.Vector3(),
        isPlazaWalker: false,
      };

      walkers.push(walker);
      group.add(root);
    }
  });

  // B. Khởi tạo người đi dạo quanh các khu danh thắng (Plaza Strollers)
  // Mỗi stage có 1-2 người tản bộ ngắm cảnh xung quanh
  dest.stages.forEach((stage, sIdx) => {
    const sDir = dirFromLatLon(stage.dir[0], stage.dir[1]);
    const palette = outfitPalettes[(sIdx * 3 + 1) % outfitPalettes.length];
    const { root, leftLeg, rightLeg, leftArm, rightArm, head } = buildWalkerMesh(palette);

    const walker: CrowdWalker = {
      group: root,
      leftLeg,
      rightLeg,
      leftArm,
      rightArm,
      head,
      pathIndex: -1,
      progress: 0,
      speed: 0.25 + Math.random() * 0.15,
      direction: sIdx % 2 === 0 ? 1 : -1,
      phase: Math.random() * Math.PI * 2,
      currentPos: new THREE.Vector3(),
      targetPos: new THREE.Vector3(),
      isPlazaWalker: true,
      plazaCenter: sDir.clone(),
      plazaRadius: Math.max(3.2, stage.flatR * 0.55),
      plazaAngle: (sIdx * 1.5) % (Math.PI * 2),
    };

    walkers.push(walker);
    group.add(root);
  });

  // Reusable vectors for performance
  const _tangent = new THREE.Vector3();
  const _normal = new THREE.Vector3();
  const _axis = new THREE.Vector3();
  const _lookMat = new THREE.Matrix4();
  const _lookZ = new THREE.Vector3();
  const _lookX = new THREE.Vector3();

  function update(dt: number, playerPos?: THREE.Vector3) {
    for (const w of walkers) {
      w.phase += dt * 6.5;

      // 1. Tính toán vị trí trên quả cầu
      if (w.isPlazaWalker && w.plazaCenter && w.plazaRadius !== undefined) {
        // Đi dạo vòng quanh tâm quảng trường
        w.plazaAngle = (w.plazaAngle || 0) + dt * (w.speed / w.plazaRadius) * w.direction;
        const ang = w.plazaAngle;

        // Tạo vector tiếp tuyến với tâm địa danh
        let north = UP;
        if (Math.abs(w.plazaCenter.dot(north)) > 0.95) north = new THREE.Vector3(1, 0, 0);

        _tangent.crossVectors(w.plazaCenter, north).normalize();
        _axis.crossVectors(w.plazaCenter, _tangent).normalize();

        const offsetDir = _tangent.clone().multiplyScalar(Math.cos(ang)).addScaledVector(_axis, Math.sin(ang));
        const finalDir = w.plazaCenter.clone().applyAxisAngle(offsetDir, w.plazaRadius / planetRadius).normalize();

        const h = heightAt(finalDir);
        w.currentPos.copy(finalDir).multiplyScalar(planetRadius + h);
        _normal.copy(finalDir);

        // Hướng nhìn tiếp tuyến đường tròn
        _tangent.crossVectors(_normal, offsetDir).normalize().multiplyScalar(w.direction);
      } else if (paths[w.pathIndex]) {
        // Đi dọc theo đoạn đường nối
        const pSeg = paths[w.pathIndex];
        const p1 = dirFromLatLon(pSeg[0][0], pSeg[0][1]);
        const p2 = dirFromLatLon(pSeg[1][0], pSeg[1][1]);

        w.progress += dt * w.speed * w.direction;
        if (w.progress > 1.0) {
          w.progress = 1.0;
          w.direction = -1;
        } else if (w.progress < 0.0) {
          w.progress = 0.0;
          w.direction = 1;
        }

        // Nội suy slerp giữa p1 và p2
        const curDir = p1.clone().lerp(p2, w.progress).normalize();
        const h = heightAt(curDir);
        w.currentPos.copy(curDir).multiplyScalar(planetRadius + h);
        _normal.copy(curDir);

        // Hướng đi tiếp tuyến
        _tangent.subVectors(p2, p1).normalize().multiplyScalar(w.direction);
        _tangent.sub(curDir.clone().multiplyScalar(_tangent.dot(curDir))).normalize();
      }

      // Kiểm tra khoảng cách với người chơi (Yield / nhường đường nếu người chơi tới gần)
      let walkMult = 1.0;
      if (playerPos && w.currentPos.distanceTo(playerPos) < 2.0) {
        walkMult = 0.2; // Đi chậm lại hoặc né người chơi
      }

      // 2. Cập nhật vị trí & hướng của NPC
      w.group.position.copy(w.currentPos);

      _lookZ.copy(_tangent).negate();
      _lookX.crossVectors(_normal, _lookZ).normalize();
      _lookZ.crossVectors(_lookX, _normal).normalize();

      _lookMat.makeBasis(_lookX, _normal, _lookZ);
      w.group.quaternion.setFromRotationMatrix(_lookMat);

      // 3. Hoạt họa vung tay, vung chân bước đi
      const swing = Math.sin(w.phase) * 0.55 * walkMult;
      w.leftLeg.rotation.x = swing;
      w.rightLeg.rotation.x = -swing;
      w.leftArm.rotation.x = -swing * 0.8;
      w.rightArm.rotation.x = swing * 0.8;

      // Đầu gật nhẹ
      w.head.position.y = 0.74 + Math.abs(Math.sin(w.phase)) * 0.02 * walkMult;
    }
  }

  return { group, update };
}
