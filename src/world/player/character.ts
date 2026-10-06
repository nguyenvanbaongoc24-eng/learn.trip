import * as THREE from 'three';
import { getToonMaterial, createToonMesh } from '../materials/toon';

const SKIN  = 0xf5d6ba;
const SHIRT = 0xf8f4eb;
const PANTS = 0x2b3d58;
const SHOES = 0x543622;
const HAIR  = 0x241d1a;
const STRAP = 0x7c4e28;
const BAG   = 0xc87032; // Ba lô màu cam du lịch nổi bật
const HAT   = 0xdec688;

function capsule(r: number, h: number, color: number, outline = 0.02): THREE.Mesh {
  const geo = new THREE.CapsuleGeometry(r, Math.max(0.01, h - r * 2), 6, 10);
  return createToonMesh(geo, getToonMaterial(color), { outline });
}

function box(w: number, h: number, d: number, color: number, outline = 0.02): THREE.Mesh {
  const geo = new THREE.BoxGeometry(w, h, d);
  return createToonMesh(geo, getToonMaterial(color), { outline });
}

function sphere(r: number, color: number, outline = 0.02): THREE.Mesh {
  const geo = new THREE.SphereGeometry(r, 12, 10);
  return createToonMesh(geo, getToonMaterial(color), { outline });
}

export class Character {
  mesh: THREE.Group;
  
  // Pivots for animation
  private leftArmPivot: THREE.Group;
  private rightArmPivot: THREE.Group;
  private leftLegPivot: THREE.Group;
  private rightLegPivot: THREE.Group;
  private headGroup: THREE.Group;
  private torsoGroup: THREE.Group;
  private phase = 0;

  constructor() {
    this.mesh = new THREE.Group();
    this.mesh.name = 'PlayerCharacter';

    // === HEAD (y center ~0.9) ===
    this.headGroup = new THREE.Group();
    this.headGroup.position.y = 0.92;

    // Head sphere (chibi cute face)
    const head = sphere(0.18, SKIN, 0.022);
    head.scale.set(1.05, 0.98, 1.0);
    this.headGroup.add(head);

    // Mắt to đen láy kiểu Ghibli
    const eyeGeo = new THREE.SphereGeometry(0.026, 8, 8);
    const eyeMat = getToonMaterial(0x111111);
    const eyeL = createToonMesh(eyeGeo, eyeMat, { outline: 0 });
    eyeL.position.set(-0.065, 0.01, 0.16);
    this.headGroup.add(eyeL);

    const eyeR = createToonMesh(eyeGeo.clone(), eyeMat, { outline: 0 });
    eyeR.position.set(0.065, 0.01, 0.16);
    this.headGroup.add(eyeR);

    // Chấm sáng long lanh trong mắt
    const glintGeo = new THREE.SphereGeometry(0.008, 6, 6);
    const glintMat = getToonMaterial(0xffffff);
    const glintL = new THREE.Mesh(glintGeo, glintMat);
    glintL.position.set(-0.058, 0.02, 0.18);
    this.headGroup.add(glintL);

    const glintR = new THREE.Mesh(glintGeo.clone(), glintMat);
    glintR.position.set(0.072, 0.02, 0.18);
    this.headGroup.add(glintR);

    // Má hồng baby
    const blushGeo = new THREE.CircleGeometry(0.03, 8);
    const blushMat = getToonMaterial(0xf7a8b8);
    const blushL = new THREE.Mesh(blushGeo, blushMat);
    blushL.position.set(-0.09, -0.04, 0.155);
    blushL.rotation.y = -0.3;
    this.headGroup.add(blushL);

    const blushR = new THREE.Mesh(blushGeo.clone(), blushMat);
    blushR.position.set(0.09, -0.04, 0.155);
    blushR.rotation.y = 0.3;
    this.headGroup.add(blushR);

    // Tóc nâu hạt dẻ bồng bềnh
    const hairCluster = [
      [0, 0.14, -0.02, 0.15],
      [0.08, 0.12, 0.02, 0.12],
      [-0.08, 0.12, 0.02, 0.12],
      [0, 0.11, -0.1, 0.13],
      [0.08, 0.07, -0.08, 0.11],
      [-0.08, 0.07, -0.08, 0.11],
      [-0.12, 0.04, 0.02, 0.09],
      [0.12, 0.04, 0.02, 0.09],
      // Tóc mái trước
      [-0.05, 0.13, 0.12, 0.07],
      [0.05, 0.13, 0.12, 0.07],
      [0, 0.14, 0.13, 0.08],
    ];
    for (const [hx, hy, hz, hr] of hairCluster) {
      const hMesh = sphere(hr, HAIR, 0.015);
      hMesh.position.set(hx, hy, hz);
      this.headGroup.add(hMesh);
    }

    // Mũ cói du lịch vành nhỏ
    const hatBrimGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.03, 16);
    const hatBrim = createToonMesh(hatBrimGeo, getToonMaterial(HAT), { outline: 0.02 });
    hatBrim.position.set(0, 0.18, -0.02);
    hatBrim.rotation.x = -0.1;
    this.headGroup.add(hatBrim);

    const hatCrownGeo = new THREE.CylinderGeometry(0.18, 0.2, 0.14, 14);
    const hatCrown = createToonMesh(hatCrownGeo, getToonMaterial(HAT), { outline: 0.02 });
    hatCrown.position.set(0, 0.25, -0.02);
    hatCrown.rotation.x = -0.1;
    this.headGroup.add(hatCrown);

    this.mesh.add(this.headGroup);

    // === TORSO & BODY ===
    this.torsoGroup = new THREE.Group();
    this.torsoGroup.position.y = 0.6;

    // Áo sơ mi du lịch tay cộc
    const body = box(0.32, 0.34, 0.2, SHIRT, 0.022);
    this.torsoGroup.add(body);

    // Ba lô du lịch trên lưng
    const backpack = box(0.24, 0.28, 0.15, BAG, 0.02);
    backpack.position.set(0, 0.02, -0.16);
    this.torsoGroup.add(backpack);

    // Quai đeo chéo & máy ảnh du lịch
    const camStrap = box(0.03, 0.36, 0.02, STRAP, 0.01);
    camStrap.position.set(0.04, 0, 0.11);
    camStrap.rotation.z = -0.65;
    this.torsoGroup.add(camStrap);

    const cameraBody = box(0.09, 0.06, 0.05, 0x222222, 0.015);
    cameraBody.position.set(0.16, -0.12, 0.09);
    this.torsoGroup.add(cameraBody);

    const lensGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.03, 8);
    lensGeo.rotateX(Math.PI / 2);
    const lens = createToonMesh(lensGeo, getToonMaterial(0x5599cc), { outline: 0.01 });
    lens.position.set(0.16, -0.12, 0.13);
    this.torsoGroup.add(lens);

    this.mesh.add(this.torsoGroup);

    // === TAY TRÁI (LEFT ARM) ===
    this.leftArmPivot = new THREE.Group();
    this.leftArmPivot.position.set(-0.21, 0.72, 0);

    const lArm = capsule(0.045, 0.22, SHIRT, 0.018);
    lArm.position.y = -0.1;
    this.leftArmPivot.add(lArm);

    const lHand = sphere(0.04, SKIN, 0.015);
    lHand.position.y = -0.22;
    this.leftArmPivot.add(lHand);

    this.mesh.add(this.leftArmPivot);

    // === TAY PHẢI (RIGHT ARM) ===
    this.rightArmPivot = new THREE.Group();
    this.rightArmPivot.position.set(0.21, 0.72, 0);

    const rArm = capsule(0.045, 0.22, SHIRT, 0.018);
    rArm.position.y = -0.1;
    this.rightArmPivot.add(rArm);

    const rHand = sphere(0.04, SKIN, 0.015);
    rHand.position.y = -0.22;
    this.rightArmPivot.add(rHand);

    this.mesh.add(this.rightArmPivot);

    // === CHÂN TRÁI (LEFT LEG) ===
    this.leftLegPivot = new THREE.Group();
    this.leftLegPivot.position.set(-0.08, 0.35, 0);

    const lLeg = capsule(0.055, 0.32, PANTS, 0.018);
    lLeg.position.y = -0.15;
    this.leftLegPivot.add(lLeg);

    const lShoe = box(0.09, 0.06, 0.15, SHOES, 0.018);
    lShoe.position.set(0, -0.32, 0.03);
    this.leftLegPivot.add(lShoe);

    this.mesh.add(this.leftLegPivot);

    // === CHÂN PHẢI (RIGHT LEG) ===
    this.rightLegPivot = new THREE.Group();
    this.rightLegPivot.position.set(0.08, 0.35, 0);

    const rLeg = capsule(0.055, 0.32, PANTS, 0.018);
    rLeg.position.y = -0.15;
    this.rightLegPivot.add(rLeg);

    const rShoe = box(0.09, 0.06, 0.15, SHOES, 0.018);
    rShoe.position.set(0, -0.32, 0.03);
    this.rightLegPivot.add(rShoe);

    this.mesh.add(this.rightLegPivot);

    // === BÓNG DƯỚI CHÂN (FEATHERED CONTACT BLOB SHADOW - Mục 7) ===
    const shadowGeo = new THREE.PlaneGeometry(0.85, 0.85);
    shadowGeo.rotateX(-Math.PI / 2);
    
    // Tạo texture bóng mờ mịn màng
    const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
    let shadowTex: THREE.CanvasTexture | null = null;
    if (canvas) {
      canvas.width = 64;
      canvas.height = 64;
      const sCtx = canvas.getContext('2d');
      if (sCtx) {
        const grad = sCtx.createRadialGradient(32, 32, 4, 32, 32, 30);
        grad.addColorStop(0, 'rgba(29, 53, 56, 0.75)');
        grad.addColorStop(0.45, 'rgba(29, 53, 56, 0.35)');
        grad.addColorStop(1, 'rgba(29, 53, 56, 0)');
        sCtx.fillStyle = grad;
        sCtx.fillRect(0, 0, 64, 64);
        shadowTex = new THREE.CanvasTexture(canvas);
      }
    }

    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: shadowTex,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
    });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.position.y = 0.008;
    this.mesh.add(shadow);

    // Phóng to nhẹ để tỉ lệ nhân vật nhìn rõ nét trên toàn cảnh hành tinh
    this.mesh.scale.setScalar(1.25);
  }

  update(dt: number, isMoving: boolean) {
    if (isMoving) {
      this.phase += dt * 8.5;

      // Chân vung trước sau nhịp nhàng
      this.leftLegPivot.rotation.x = Math.sin(this.phase) * 0.6;
      this.rightLegPivot.rotation.x = Math.sin(this.phase + Math.PI) * 0.6;

      // Tay vung ngược pha chân
      this.leftArmPivot.rotation.x = Math.sin(this.phase + Math.PI) * 0.5;
      this.rightArmPivot.rotation.x = Math.sin(this.phase) * 0.5;

      // Cơ thể nảy nhẹ theo từng bước chân
      this.torsoGroup.position.y = 0.6 + Math.abs(Math.sin(this.phase)) * 0.035;
      this.torsoGroup.rotation.y = Math.sin(this.phase) * 0.08;

      // Đầu nhấp nhô vui tươi
      this.headGroup.position.y = 0.92 + Math.abs(Math.sin(this.phase)) * 0.025;
      this.headGroup.rotation.z = Math.sin(this.phase * 0.5) * 0.04;

      // Người hơi nghiêng về phía trước khi chạy/đi
      this.mesh.rotation.x = 0.08;
    } else {
      // Hơi thở nhẹ nhàng khi đứng yên (Idle breathing)
      const t = performance.now() * 0.0025;
      this.torsoGroup.scale.y = 1 + Math.sin(t) * 0.015;
      this.headGroup.position.y = 0.92 + Math.sin(t) * 0.01;
      this.headGroup.rotation.z = Math.sin(t * 0.6) * 0.02;

      // Trả các chi về vị trí thẳng đứng
      this.leftLegPivot.rotation.x *= 0.88;
      this.rightLegPivot.rotation.x *= 0.88;
      this.leftArmPivot.rotation.x *= 0.88;
      this.rightArmPivot.rotation.x *= 0.88;
      this.torsoGroup.rotation.y *= 0.88;
      this.mesh.rotation.x *= 0.88;
    }
  }
}
