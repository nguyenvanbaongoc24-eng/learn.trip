import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { getToonMaterial, createToonMesh } from '../materials/toon';
import { createNPC, createFloatingBoat, createWeepingWillow, createPigeonsFlock } from '../props/life';

// Palette
const PLASTER   = 0xc4bda8; 
const STONE     = 0x8a8580; 
const DARK_STONE= 0x5a5652;
const WOOD      = 0x5a3a28; 
const OCHER     = 0xd9b26a; 
const TILE_GR   = 0x4e6b48; 
const BRIDGE    = 0xc93a28; 
const DARK_RED  = 0x85241a; 
const LEAF_MID  = 0x528842;
const GOLD_LAMP = 0xf2c84b;

function box(w: number, h: number, d: number, color: number, outline = 0.032): THREE.Mesh {
  return createToonMesh(new THREE.BoxGeometry(w, h, d), getToonMaterial(color), { outline });
}

function cyl(rt: number, rb: number, h: number, seg: number, color: number, outline = 0.032): THREE.Mesh {
  return createToonMesh(new THREE.CylinderGeometry(rt, rb, h, seg), getToonMaterial(color), { outline });
}

function slopedRoof(w: number, d: number, h: number, color: number, outline = 0.032): THREE.Mesh {
  const cGeo = new THREE.CylinderGeometry(0.85, 1.0, h, 4);
  cGeo.rotateY(Math.PI / 4);
  cGeo.scale(w / Math.SQRT2, 1, d / Math.SQRT2);
  return createToonMesh(cGeo, getToonMaterial(color), { outline });
}

export function buildHoanKiem(ctx?: any): THREE.Group {
  const group = new THREE.Group();

  // ========= GÒ RÙA (Turtle mound in the middle) =========
  // Chân gò đá ăn sâu xuống lòng đất âm Y để ăn khớp tự nhiên với địa hình cầu
  const island = new THREE.Group();
  const moundBase = createToonMesh(
    new THREE.CylinderGeometry(2.4, 3.2, 1.1, 16),
    getToonMaterial(0x567e42),
    { outline: 0.03 }
  );
  moundBase.position.y = -0.15; // ăn sâu xuống lòng hồ
  moundBase.receiveShadow = true;
  island.add(moundBase);

  // Kè đá cổ rêu phong bao quanh gò
  for (let a = 0; a < 12; a++) {
    const angle = (a / 12) * Math.PI * 2;
    const stoneBlock = box(0.9, 0.45, 0.45, STONE, 0.02);
    stoneBlock.position.set(Math.cos(angle) * 2.3, 0.18, Math.sin(angle) * 2.3);
    stoneBlock.rotation.y = -angle;
    island.add(stoneBlock);
  }

  // ========= THÁP RÙA (TURTLE TOWER) =========
  const tower = new THREE.Group();
  tower.position.y = 0.38;

  // Móng đá chìm
  const mong = box(3.6, 0.6, 2.6, DARK_STONE, 0.03);
  mong.position.y = 0.12;
  tower.add(mong);

  // Tầng 1
  const t1 = box(3.4, 1.4, 2.4, PLASTER, 0.035);
  t1.position.y = 1.05;
  tower.add(t1);

  const doorMat = getToonMaterial(0x222222);
  for (let i = -1; i <= 1; i++) {
    const doorGeo = new THREE.BoxGeometry(0.35, 0.72, 0.12);
    const d1 = createToonMesh(doorGeo, doorMat, { outline: 0.012 });
    d1.position.set(i * 0.85, 0.72, 1.22);
    const d2 = createToonMesh(doorGeo.clone(), doorMat, { outline: 0.012 });
    d2.position.set(i * 0.85, 0.72, -1.22);
    tower.add(d1, d2);
  }

  // Mái tầng 1
  const roof1 = slopedRoof(4.1, 3.1, 0.3, TILE_GR, 0.035);
  roof1.position.y = 1.88;
  tower.add(roof1);

  // Tầng 2
  const t2 = box(2.6, 1.1, 1.9, PLASTER, 0.03);
  t2.position.y = 2.52;
  tower.add(t2);

  // Mái tầng 2
  const roof2 = slopedRoof(3.1, 2.4, 0.26, TILE_GR, 0.03);
  roof2.position.y = 3.18;
  tower.add(roof2);

  // Tầng 3
  const t3 = box(1.7, 0.85, 1.2, PLASTER, 0.025);
  t3.position.y = 3.72;
  tower.add(t3);

  // Mái tầng 3
  const roof3 = slopedRoof(2.1, 1.5, 0.22, TILE_GR, 0.025);
  roof3.position.y = 4.22;
  tower.add(roof3);

  // Vọng lâu đỉnh tháp
  const vl = box(1.0, 0.45, 1.0, PLASTER, 0.02);
  vl.position.y = 4.52;
  tower.add(vl);
  const vlRoof = slopedRoof(1.3, 1.3, 0.2, TILE_GR, 0.02);
  vlRoof.position.y = 4.82;
  tower.add(vlRoof);

  island.add(tower);
  group.add(island);

  // ========= CẦU THÊ HÚC (CONG MÀU ĐỎ SON) =========
  const bridge = new THREE.Group();
  const segs = 14;
  const span = 5.6;
  const rise = 0.58;
  const bw = 1.3;

  const deckGeos: THREE.BufferGeometry[] = [];
  const railGeos: THREE.BufferGeometry[] = [];

  for (let i = 0; i < segs; i++) {
    const t0 = i / segs;
    const t1 = (i + 1) / segs;
    const x0 = -span / 2 + t0 * span;
    const x1 = -span / 2 + t1 * span;
    const y0 = Math.sin(t0 * Math.PI) * rise;
    const y1 = Math.sin(t1 * Math.PI) * rise;
    const yMid = (y0 + y1) / 2;
    const xMid = (x0 + x1) / 2;
    const angle = Math.atan2(y1 - y0, x1 - x0);
    const len = Math.sqrt((x1 - x0) ** 2 + (y1 - y0) ** 2);

    const dGeo = new THREE.BoxGeometry(len * 1.05, 0.12, bw);
    dGeo.rotateZ(angle);
    dGeo.translate(xMid, yMid, 0);
    deckGeos.push(dGeo);

    for (const z of [-bw / 2 - 0.04, bw / 2 + 0.04]) {
      const rGeo = new THREE.BoxGeometry(0.06, 0.48, 0.06);
      rGeo.translate(x0, y0 + 0.24, z);
      railGeos.push(rGeo);

      const rGeo2 = new THREE.BoxGeometry(len * 1.05, 0.07, 0.07);
      rGeo2.rotateZ(angle);
      rGeo2.translate(xMid, yMid + 0.44, z);
      railGeos.push(rGeo2);
    }
  }

  const deckMesh = createToonMesh(mergeGeometries(deckGeos), getToonMaterial(BRIDGE), { outline: 0.025 });
  bridge.add(deckMesh);
  const railMesh = createToonMesh(mergeGeometries(railGeos), getToonMaterial(DARK_RED), { outline: 0.02 });
  bridge.add(railMesh);

  // Mố cầu đá ăn sâu vào bờ
  for (const mx of [-span / 2, span / 2]) {
    const moCau = box(0.9, 0.8, bw + 0.4, STONE, 0.02);
    moCau.position.set(mx, -0.2, 0);
    bridge.add(moCau);
  }

  bridge.position.set(4.2, 0.2, 0.6);
  bridge.rotation.y = Math.PI / 2 + 0.2;
  group.add(bridge);

  // ========= ĐỀN NGỌC SƠN (ĐẢO NGỌC) =========
  const temple = new THREE.Group();
  const templeIsland = createToonMesh(
    new THREE.CylinderGeometry(2.0, 2.5, 0.9, 14),
    getToonMaterial(STONE),
    { outline: 0.03 }
  );
  templeIsland.position.y = -0.12;
  templeIsland.receiveShadow = true;
  temple.add(templeIsland);

  const tWalls = box(2.8, 1.8, 2.2, OCHER, 0.035);
  tWalls.position.y = 1.15;
  temple.add(tWalls);

  const tRoof = slopedRoof(3.5, 2.8, 0.5, 0x4a3c2c, 0.035);
  tRoof.position.y = 2.28;
  temple.add(tRoof);

  temple.position.set(4.4, 0.2, -2.8);
  group.add(temple);

  // ========= BỜ HỒ & LỐI ĐI BỘ (PROMENADE) NƠI PLAYER ĐỨNG =========
  // Dãy đá bước dạo (stepping stones) dẫn từ sau lưng player đến mép bờ ngắm cảnh
  const stoneMat = getToonMaterial(0x9c968c);
  for (let s = 0; s < 7; s++) {
    const pz = 4.2 + s * 0.75;
    const stepStone = createToonMesh(
      new THREE.CylinderGeometry(0.42, 0.48, 0.16, 8),
      stoneMat,
      { outline: 0.02 }
    );
    stepStone.position.set((s % 2 === 0 ? 0.08 : -0.08), 0.04, pz);
    stepStone.rotation.y = s * 0.5;
    stepStone.receiveShadow = true;
    group.add(stepStone);
  }

  // Lan can đá ven hồ (stone balustrade)
  for (let b = -4; b <= 4; b++) {
    const post = box(0.16, 0.7, 0.16, STONE, 0.015);
    post.position.set(b * 1.1, 0.28, 3.8);
    group.add(post);

    const finial = createToonMesh(new THREE.SphereGeometry(0.1, 6, 6), stoneMat, { outline: 0.01 });
    finial.position.set(b * 1.1, 0.68, 3.8);
    group.add(finial);

    if (b < 4) {
      const rail = box(1.05, 0.08, 0.08, STONE, 0.01);
      rail.position.set(b * 1.1 + 0.55, 0.52, 3.8);
      group.add(rail);
    }
  }

  // Đèn lồng đá công viên ven hồ
  for (const lx of [-3.2, 3.2]) {
    const lantern = new THREE.Group();
    const lBase = box(0.4, 0.2, 0.4, STONE, 0.015);
    lBase.position.y = 0.1;
    lantern.add(lBase);

    const lPillar = cyl(0.12, 0.14, 0.9, 6, STONE, 0.015);
    lPillar.position.y = 0.58;
    lantern.add(lPillar);

    const lBox = box(0.38, 0.35, 0.38, GOLD_LAMP, 0.015);
    lBox.position.y = 1.15;
    lantern.add(lBox);

    const lRoof = slopedRoof(0.55, 0.55, 0.18, 0x4a4440, 0.02);
    lRoof.position.y = 1.38;
    lantern.add(lRoof);

    lantern.position.set(lx, 0.05, 4.4);
    group.add(lantern);
  }

  // Ghế đá công viên ven hồ
  const bench = box(1.3, 0.1, 0.45, STONE, 0.02);
  bench.position.set(-2.2, 0.35, 5.0);
  bench.rotation.y = 0.15;
  group.add(bench);

  const benchLeg1 = box(0.12, 0.35, 0.35, DARK_STONE, 0.015);
  benchLeg1.position.set(-2.7, 0.15, 5.0);
  const benchLeg2 = box(0.12, 0.35, 0.35, DARK_STONE, 0.015);
  benchLeg2.position.set(-1.7, 0.15, 5.0);
  group.add(benchLeg1, benchLeg2);

  // ========= CÂY LIỄU RỦ VEN HỒ =========
  const leafMat = getToonMaterial(LEAF_MID);
  const trunkMat = getToonMaterial(WOOD);

  for (let i = 0; i < 7; i++) {
    const angle = 0.4 + (i / 7) * Math.PI * 1.8;
    const r = 4.8 + (i % 2) * 0.7;
    const tree = new THREE.Group();

    const trunk = createToonMesh(new THREE.CylinderGeometry(0.1, 0.18, 1.8, 6), trunkMat, { outline: 0.025 });
    trunk.position.y = 0.8;
    trunk.rotation.z = (Math.random() - 0.5) * 0.18;
    tree.add(trunk);

    const cGeos = [
      new THREE.SphereGeometry(0.85, 8, 6).translate(0, 2.0, 0),
      new THREE.SphereGeometry(0.65, 8, 6).translate(0.45, 1.8, 0.2),
      new THREE.SphereGeometry(0.65, 8, 6).translate(-0.45, 1.7, -0.3),
      new THREE.SphereGeometry(0.45, 8, 6).translate(0.1, 1.35, 0.35),
      new THREE.SphereGeometry(0.45, 8, 6).translate(-0.2, 1.3, -0.35),
    ];
    const canopy = createToonMesh(mergeGeometries(cGeos), leafMat, { outline: 0.03 });
    tree.add(canopy);

    tree.position.set(Math.cos(angle) * r, 0.1, Math.sin(angle) * r);
    tree.rotation.y = i * 1.3;
    tree.scale.setScalar(0.9 + (i % 2) * 0.25);
    group.add(tree);
  }

  // Cây Liễu rủ bóng ven hồ Hoàn Kiếm
  const willow1 = createWeepingWillow();
  willow1.position.set(3.2, 0.06, 3.9);
  willow1.rotation.y = 0.4;
  group.add(willow1);

  const willow2 = createWeepingWillow();
  willow2.position.set(-3.2, 0.06, 3.9);
  willow2.rotation.y = -0.5;
  willow2.scale.setScalar(0.9);
  group.add(willow2);

  // ========= HOA SEN & LÁ SEN TRÊN MẶT NƯỚC =========
  const lilyMat = getToonMaterial(0x356e39);
  const flowerMat = getToonMaterial(0xf4bed0);
  const pads: THREE.Mesh[] = [];

  for (const [x, z, scale] of [
    [-2.8, 1.2, 0.42],
    [-2.2, -1.8, 0.38],
    [2.8, 2.2, 0.36],
    [3.2, -1.2, 0.32],
    [-1.2, 3.2, 0.4],
  ] as const) {
    const pad = new THREE.Mesh(new THREE.CircleGeometry(scale, 10), lilyMat);
    pad.rotation.x = -Math.PI / 2;
    pad.position.set(x, 0.04, z);
    pads.push(pad);
    group.add(pad);

    const flower = createToonMesh(new THREE.SphereGeometry(scale * 0.24, 6, 5), flowerMat, { outline: 0.01 });
    flower.position.set(x + scale * 0.15, 0.1, z);
    group.add(flower);
  }

  // ========= THUYỀN NAN BỒNG BỀNH DẬP DỀNH THEO SÓNG NƯỚC =========
  const boat1 = createFloatingBoat(0x5a3a24);
  boat1.group.position.set(-3.4, 0.04, -1.2);
  boat1.group.rotation.y = 0.5;
  boat1.group.scale.setScalar(0.85);
  group.add(boat1.group);

  const boat2 = createFloatingBoat(0x6a442e);
  boat2.group.position.set(2.6, 0.04, -1.8);
  boat2.group.rotation.y = -1.1;
  boat2.group.scale.setScalar(0.8);
  group.add(boat2.group);

  // ========= DÂN CƯ / KHÁCH THAM QUAN THƯ THÁI =========
  const visitor1 = createNPC({
    outfitColor: 0xffffff, // Áo dài trắng
    skinColor: 0xffd8b8,
    hairColor: 0x111111,
    action: 'idle',
    hasHat: true, // Nón lá
    scale: 0.95,
  });
  visitor1.position.set(1.8, 0.1, 4.4);
  visitor1.rotation.y = -0.4;
  group.add(visitor1);

  const visitor2 = createNPC({
    outfitColor: 0x2e6b52,
    skinColor: 0xffd8b8,
    hairColor: 0x222222,
    action: 'idle',
    hasHat: false,
    scale: 0.9,
  });
  visitor2.position.set(-2.2, 0.45, 5.0);
  visitor2.rotation.y = 0.15;
  group.add(visitor2);

  // ========= ĐÀN CHIM BỒ CÂU SÀ XUỐNG BỜ HỒ HOÀN KIẾM =========
  const pigeons = createPigeonsFlock(8);
  pigeons.group.position.set(-1.4, 0.05, 4.2);
  group.add(pigeons.group);

  // ========= ANIMATION CẬP NHẬT THEO THỜI GIAN =========
  let animTime = 0;
  if (ctx) {
    const prevUpdate = ctx.onUpdate;
    ctx.onUpdate = (dt: number, playerPos?: THREE.Vector3) => {
      prevUpdate?.(dt, playerPos);
      animTime += dt;
      // Thuyền dập dềnh bồng bềnh theo nhịp sóng nước
      boat1.update(animTime);
      boat2.update(animTime);

      // Đàn bồ câu mổ thóc và cất cánh khi người chơi lại gần
      pigeons.update(dt, playerPos);

      // Lá sen dập dềnh nhẹ
      for (let p = 0; p < pads.length; p++) {
        pads[p].position.y = 0.04 + Math.sin(animTime * 2.0 + p) * 0.015;
      }
    };
  }

  return group;
}
