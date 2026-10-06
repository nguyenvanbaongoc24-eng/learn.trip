import * as THREE from 'three';
import { getToonMaterial, createToonMesh } from '../materials/toon';
import { createNPC, createHistoricTrain, createFlowerBicycle } from '../props/life';

/**
 * Stage 5: Cầu Long Biên – Chứng nhân lịch sử qua Sông Hồng
 * - Cầu dàn thép Pháp cổ Eiffel với vòm dầm cantilever uốn lượn
 * - Đường ray xe lửa trung tâm & hai làn xe máy/người đi bộ
 * - Đoàn tàu hỏa hối hả qua cầu
 * - Trụ đá vững chãi cắm sâu vào lòng sông
 * - Bãi bồi chuối xanh bạt ngàn
 * - Người đi xe đạp chở hoa trên cầu
 */

const STEEL_RUST    = 0x62564b; // Thép cổ pha màu thời gian
const PIER_STONE    = 0x7a7469; // Trụ đá trầm tích sông Hồng
const DECK_ROAD     = 0x4e5052;
const RAIL_WOOD     = 0x3d3028;
const RAIL_STEEL    = 0x2b3136;
const TRAIN_GREEN   = 0x2b6343; // Đầu tàu hỏa truyền thống xanh lá
const TRAIN_CREAM   = 0xd9cda8;
const LEAF_BANANA   = 0x48963e;

function box(w: number, h: number, d: number, color: number, outline = 0.032): THREE.Mesh {
  return createToonMesh(new THREE.BoxGeometry(w, h, d), getToonMaterial(color), { outline });
}

function cyl(rt: number, rb: number, h: number, seg: number, color: number, outline = 0.032): THREE.Mesh {
  return createToonMesh(new THREE.CylinderGeometry(rt, rb, h, seg), getToonMaterial(color), { outline });
}

function sphere(r: number, seg: number, color: number, outline = 0.032): THREE.Mesh {
  return createToonMesh(new THREE.SphereGeometry(r, seg, seg), getToonMaterial(color), { outline });
}

export function buildLongBien(ctx?: any): THREE.Group {
  const group = new THREE.Group();

  // === Cụm cây chuối xanh bãi bồi ven sông Hồng ===
  for (let c = 0; c < 8; c++) {
    const cx = (c - 3.5) * 2.8 + (Math.random() - 0.5) * 1.0;
    const cz = (c % 2 === 0 ? 3.5 : -3.5) + (Math.random() - 0.5) * 1.0;

    const bananaCluster = new THREE.Group();
    const bTrunk = cyl(0.12, 0.16, 1.4, 6, 0x5a7a3a, 0.02);
    bTrunk.position.y = 0.7;
    bananaCluster.add(bTrunk);

    for (let l = 0; l < 4; l++) {
      const leaf = box(0.35, 0.04, 1.2, LEAF_BANANA, 0.015);
      leaf.rotation.y = (l * Math.PI) / 2;
      leaf.rotation.x = 0.35;
      leaf.position.set(0, 1.35, 0);
      bananaCluster.add(leaf);
    }

    bananaCluster.position.set(cx, 0.05, cz);
    group.add(bananaCluster);
  }

  // === CẦU THÉP LONG BIÊN (Truss Cantilever Bridge) ===
  const bridge = new THREE.Group();

  const totalLength = 24;
  const bridgeWidth = 3.4;

  // Bản mặt cầu (Deck)
  const deck = box(totalLength, 0.35, bridgeWidth, DECK_ROAD);
  deck.position.y = 0.35;
  bridge.add(deck);

  // Đường sắt ở giữa (Railway track)
  const trackBed = box(totalLength, 0.06, 1.2, RAIL_WOOD, 0);
  trackBed.position.set(0, 0.55, 0);
  bridge.add(trackBed);

  // Hai thanh ray thép song song
  for (const rz of [-0.35, 0.35]) {
    const rail = box(totalLength, 0.08, 0.08, RAIL_STEEL, 0.01);
    rail.position.set(0, 0.61, rz);
    bridge.add(rail);
  }

  // Các tà vẹt gỗ vuông góc dọc đường ray
  const sleeperCount = 24;
  for (let s = 0; s < sleeperCount; s++) {
    const sx = (s / (sleeperCount - 1) - 0.5) * (totalLength - 1);
    const sleeper = box(0.18, 0.05, 1.0, RAIL_WOOD, 0);
    sleeper.position.set(sx, 0.56, 0);
    bridge.add(sleeper);
  }

  // Lan can hai bên mép cầu cho người đi bộ
  for (const side of [-1, 1]) {
    const sz = side * (bridgeWidth / 2 - 0.08);

    const handrail = box(totalLength, 0.06, 0.06, STEEL_RUST, 0.01);
    handrail.position.set(0, 0.98, sz);
    bridge.add(handrail);

    for (let p = 0; p < 16; p++) {
      const px = (p / 15 - 0.5) * (totalLength - 0.8);
      const post = box(0.06, 0.55, 0.06, STEEL_RUST, 0.01);
      post.position.set(px, 0.71, sz);
      bridge.add(post);
    }
  }

  // === 4 Nhịp dàn thép Eiffel vươn cao hình dầm uốn cong nhịp nhàng ===
  const spanCount = 4;
  const spanLength = totalLength / spanCount;

  for (let i = 0; i < spanCount; i++) {
    const spanGroup = new THREE.Group();
    const spanCenter = (i - 1.5) * spanLength;

    // Trụ cầu đá ăn sâu xuống lòng sông âm Y
    const pier = box(1.6, 2.4, bridgeWidth + 0.9, PIER_STONE);
    pier.position.set(spanCenter + spanLength / 2, -0.6, 0);
    bridge.add(pier);

    // Hai khung dàn thép hai bên sườn cầu
    for (const side of [-1, 1]) {
      const trussSide = new THREE.Group();
      const tz = side * (bridgeWidth / 2);

      const apexPost = box(0.16, 2.6, 0.16, STEEL_RUST);
      apexPost.position.set(spanCenter, 1.6, tz);
      trussSide.add(apexPost);

      const diagLen = Math.hypot(spanLength / 2, 2.3);
      const angle = Math.atan2(2.3, spanLength / 2);

      const leftDiag = box(diagLen, 0.14, 0.14, STEEL_RUST);
      leftDiag.position.set(spanCenter - spanLength / 4, 1.5, tz);
      leftDiag.rotation.z = angle;
      trussSide.add(leftDiag);

      const rightDiag = box(diagLen, 0.14, 0.14, STEEL_RUST);
      rightDiag.position.set(spanCenter + spanLength / 4, 1.5, tz);
      rightDiag.rotation.z = -angle;
      trussSide.add(rightDiag);

      for (let k = -2; k <= 2; k++) {
        if (k === 0) continue;
        const subPost = box(0.1, 1.4 - Math.abs(k) * 0.25, 0.1, STEEL_RUST);
        subPost.position.set(spanCenter + (k * spanLength) / 6, 1.15, tz);
        trussSide.add(subPost);
      }

      spanGroup.add(trussSide);
    }

    const topCrossBeam = box(0.14, 0.14, bridgeWidth + 0.2, STEEL_RUST);
    topCrossBeam.position.set(spanCenter, 2.9, 0);
    spanGroup.add(topCrossBeam);

    bridge.add(spanGroup);
  }

  // Mố cầu hai đầu ăn sâu vào bờ đất
  for (const endX of [-totalLength / 2, totalLength / 2]) {
    const abutment = box(1.8, 1.8, bridgeWidth + 1.2, PIER_STONE);
    abutment.position.set(endX, -0.4, 0);
    bridge.add(abutment);
  }

  group.add(bridge);

  // === Đoàn tàu hỏa chạy bon bon trên cầu (Train Locomotive & Carriage) ===
  const historicTrain = createHistoricTrain();
  historicTrain.group.position.set(0, 0.45, 0);
  group.add(historicTrain.group);

  // === Xe đạp thồ chở hoa đi trên làn bên sườn cầu ===
  const cyclist = createNPC({
    outfitColor: 0x386588,
    skinColor: 0xffd8b8,
    hairColor: 0x1a1a1a,
    action: 'walk',
    hasHat: true,
    scale: 0.9,
  });
  cyclist.position.set(-3.7, 0.38, 1.35);
  cyclist.rotation.y = Math.PI / 2;
  group.add(cyclist);

  const flowerBike = createFlowerBicycle();
  flowerBike.position.set(-2.8, 0.38, 1.35);
  flowerBike.rotation.y = Math.PI / 2;
  flowerBike.scale.setScalar(0.82);
  group.add(flowerBike);

  // Animation đoàn tàu chạy nhịp nhàng qua sông & nhả khói
  if (ctx) {
    const prevUpdate = ctx.onUpdate;
    ctx.onUpdate = (dt: number) => {
      prevUpdate?.(dt);
      historicTrain.update(dt);
    };
  }

  return group;
}
