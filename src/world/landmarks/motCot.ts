import * as THREE from 'three';
import { getToonMaterial, createToonMesh } from '../materials/toon';
import { createNPC, createPigeonsFlock } from '../props/life';

/**
 * Stage 6: Chùa Một Cột & Quảng Trường Ba Đình / Lăng Bác
 * - Chùa Một Cột (Liên Hoa Đài) nở như bông sen trên hồ Linh Chiểu
 * - Trụ đá nguyên khối đỡ các xà gỗ uốn cánh sen
 * - Quảng trường Ba Đình thảm cỏ xanh ô bàn cờ
 * - Lăng Bác tôn nghiêm & Cột cờ Tổ quốc phấp phới
 * - Tiêu binh danh dự quân phục trắng
 */

const STONE_GREY    = 0xa8a49c;
const GRANITE_DARK  = 0x5a544e;
const ROOF_TERRA    = 0xa24026;
const WOOD_LACQUER  = 0x942e22; // Sơn son thếp vàng
const GOLD_ACCENT   = 0xd4a838;
const WATER_POND    = 0x3da89c;
const GRASS_LAWN    = 0x48943c;
const FLAG_RED      = 0xd92b2b;

function box(w: number, h: number, d: number, color: number, outline = 0.032): THREE.Mesh {
  return createToonMesh(new THREE.BoxGeometry(w, h, d), getToonMaterial(color), { outline });
}

function cyl(rt: number, rb: number, h: number, seg: number, color: number, outline = 0.032): THREE.Mesh {
  return createToonMesh(new THREE.CylinderGeometry(rt, rb, h, seg), getToonMaterial(color), { outline });
}

function sphere(r: number, seg: number, color: number, outline = 0.032): THREE.Mesh {
  return createToonMesh(new THREE.SphereGeometry(r, seg, seg), getToonMaterial(color), { outline });
}

export function buildMotCot(ctx?: any): THREE.Group {
  const group = new THREE.Group();

  // === LỐI ĐI BỘ ĐÁ DẪN ĐẾN KHUÔN VIÊN ===
  const stepMat = getToonMaterial(0x9a948a);
  for (let s = 0; s < 8; s++) {
    const pz = 4.2 + s * 0.7;
    const stepStone = createToonMesh(
      new THREE.CylinderGeometry(0.4, 0.45, 0.12, 8),
      stepMat,
      { outline: 0.015 }
    );
    stepStone.position.set(s % 2 === 0 ? 0.05 : -0.05, 0.04, pz);
    stepStone.rotation.y = s * 0.35;
    group.add(stepStone);
  }

  // === QUẢNG TRƯỜNG BA ĐÌNH & LĂNG BÁC (Hậu cảnh) ===
  const squareGroup = new THREE.Group();

  // Các ô cỏ xanh vuông vức đặc trưng của Quảng trường Ba Đình gắn sát mặt đất
  for (let row = 0; row < 3; row++) {
    for (let col = -3; col <= 3; col++) {
      const lawn = box(1.7, 0.06, 1.7, GRASS_LAWN, 0.01);
      lawn.position.set(col * 2.1, 0.03, -1.8 - row * 2.1);
      squareGroup.add(lawn);
    }
  }

  // Lăng Chủ Tịch Hồ Chí Minh (Hùng vĩ, tôn nghiêm)
  const mausoleum = new THREE.Group();

  // Khối móng đá chìm sâu vào quả địa cầu âm Y
  const deepFoundation = box(8.8, 0.8, 5.8, GRANITE_DARK);
  deepFoundation.position.y = -0.3;
  mausoleum.add(deepFoundation);

  // Khối bệ đá tam cấp
  const base1 = box(8.2, 0.45, 5.2, GRANITE_DARK);
  base1.position.y = 0.22;
  mausoleum.add(base1);

  const base2 = box(7.4, 0.45, 4.6, GRANITE_DARK);
  base2.position.y = 0.67;
  mausoleum.add(base2);

  // Hàng cột đá hoa cương vuông (colonnade)
  const colCount = 8;
  for (let c = 0; c < colCount; c++) {
    const cx = (c / (colCount - 1) - 0.5) * 5.8;
    const col = box(0.35, 2.2, 0.35, STONE_GREY);
    col.position.set(cx, 2.0, 1.8);
    mausoleum.add(col);
  }

  // Khối thân trung tâm sẫm màu phía sau hàng cột
  const mainBlock = box(6.4, 2.2, 3.6, 0x423c38);
  mainBlock.position.set(0, 2.0, 0);
  mausoleum.add(mainBlock);

  // Mái lăng đá tam cấp vươn cao
  const mRoof1 = box(7.8, 0.45, 4.8, STONE_GREY);
  mRoof1.position.y = 3.32;
  mausoleum.add(mRoof1);

  const mRoof2 = box(6.8, 0.55, 4.0, STONE_GREY);
  mRoof2.position.y = 3.82;
  mausoleum.add(mRoof2);

  // Dòng chữ đỏ "CHỦ TỊCH HỒ CHÍ MINH"
  const inscription = box(2.4, 0.25, 0.08, FLAG_RED, 0.01);
  inscription.position.set(0, 3.85, 2.05);
  mausoleum.add(inscription);

  mausoleum.position.set(0, 0.06, -6.5);
  squareGroup.add(mausoleum);

  // Cột cờ Quảng trường Ba Đình & cờ đỏ sao vàng
  const flagPole = cyl(0.06, 0.08, 6.2, 8, 0xdedede, 0.015);
  flagPole.position.set(0, 3.1, -1.8);
  squareGroup.add(flagPole);

  // Lá cờ đỏ sao vàng tung bay
  const flagGeo = new THREE.PlaneGeometry(1.4, 0.9, 8, 4);
  const flagMat = getToonMaterial(FLAG_RED, { side: THREE.DoubleSide });
  const flagMesh = new THREE.Mesh(flagGeo, flagMat);
  flagMesh.position.set(0.72, 5.6, -1.8);
  squareGroup.add(flagMesh);

  // Ngôi sao vàng trung tâm lá cờ
  const star = sphere(0.16, 5, GOLD_ACCENT, 0);
  star.position.set(0.72, 5.6, -1.78);
  squareGroup.add(star);

  // Tiêu binh danh dự quân phục trắng bồng súng đứng gác trước lăng
  for (const sx of [-1.2, 1.2]) {
    const guard = createNPC({
      outfitColor: 0xffffff,
      skinColor: 0xffd8b8,
      hairColor: 0x111111,
      action: 'idle',
      hasHat: false,
      scale: 0.95,
    });
    guard.position.set(sx, 0.1, -4.5);
    squareGroup.add(guard);
  }

  group.add(squareGroup);

  // === CHÙA MỘT CỘT (LIÊN HOA ĐÀI) NỞ HOA SEN TRÊN HỒ LINH CHIỂU ===
  const pagodaGroup = new THREE.Group();

  // Hồ Linh Chiểu vuông vắn nước trong xanh
  const pondWater = new THREE.Mesh(
    new THREE.BoxGeometry(4.8, 0.1, 4.8),
    getToonMaterial(WATER_POND, { transparent: true, opacity: 0.85 })
  );
  pondWater.position.set(0, 0.08, 2.2);
  pagodaGroup.add(pondWater);

  // Móng thành hồ đá chìm sâu vào đất âm Y
  const pondFound = box(5.4, 0.5, 5.4, GRANITE_DARK);
  pondFound.position.set(0, -0.2, 2.2);
  pagodaGroup.add(pondFound);

  // Thành hồ đá bao quanh có con tiện
  const pSize = 5.0;
  for (const [bx, bz, bw, bd] of [
    [0, 2.2 + pSize / 2, pSize + 0.3, 0.3],
    [0, 2.2 - pSize / 2, pSize + 0.3, 0.3],
    [pSize / 2, 2.2, 0.3, pSize],
    [-pSize / 2, 2.2, 0.3, pSize],
  ]) {
    const wall = box(bw, 0.35, bd, STONE_GREY);
    wall.position.set(bx, 0.18, bz);
    pagodaGroup.add(wall);
  }

  // Cột đá nguyên khối độc nhất dựng giữa hồ, ăn sâu xuống đáy hồ
  const singlePillar = cyl(0.48, 0.54, 2.8, 16, STONE_GREY);
  singlePillar.position.set(0, 1.1, 2.2);
  pagodaGroup.add(singlePillar);

  // Hệ dầm xà gỗ chìa ra như các cánh hoa sen đỡ đài chùa
  for (let petal = 0; petal < 8; petal++) {
    const angle = (petal * Math.PI) / 4;
    const bracket = box(0.18, 0.24, 1.25, WOOD_LACQUER);
    bracket.position.set(Math.sin(angle) * 0.55, 2.1, 2.2 + Math.cos(angle) * 0.55);
    bracket.rotation.y = angle;
    bracket.rotation.x = 0.32;
    pagodaGroup.add(bracket);
  }

  // Sàn đài sen hình vuông
  const lotusBase = box(1.9, 0.2, 1.9, WOOD_LACQUER);
  lotusBase.position.set(0, 2.35, 2.2);
  pagodaGroup.add(lotusBase);

  // Khối chòi chùa sơn son thếp vàng
  const shrine = box(1.4, 1.15, 1.4, WOOD_LACQUER);
  shrine.position.set(0, 3.0, 2.2);
  pagodaGroup.add(shrine);

  // Cửa mở nhìn vào bên trong có tượng Bồ Tát Quan Âm
  const doorHole = box(0.55, 0.75, 0.08, 0x1f1b18, 0);
  doorHole.position.set(0, 2.9, 2.91);
  pagodaGroup.add(doorHole);

  const buddhaStatue = sphere(0.15, 6, GOLD_ACCENT, 0.01);
  buddhaStatue.position.set(0, 2.9, 2.6);
  pagodaGroup.add(buddhaStatue);

  // Mái ngói đao cong 4 góc vút lên trời
  const roof = box(2.2, 0.32, 2.2, ROOF_TERRA);
  roof.position.set(0, 3.72, 2.2);
  pagodaGroup.add(roof);

  const roofPeakGeo = new THREE.ConeGeometry(1.4, 0.75, 4);
  roofPeakGeo.rotateY(Math.PI / 4);
  const roofPeak = createToonMesh(roofPeakGeo, getToonMaterial(ROOF_TERRA), { outline: 0.035 });
  roofPeak.position.set(0, 4.25, 2.2);
  pagodaGroup.add(roofPeak);

  // Đỉnh nóc trang trí ngọc hồ lô
  const topFinial = cyl(0.06, 0.1, 0.35, 6, GOLD_ACCENT, 0.015);
  topFinial.position.set(0, 4.8, 2.2);
  pagodaGroup.add(topFinial);

  // Cầu thang gạch dẫn vào chùa Một Cột
  const stairs = box(0.9, 0.35, 1.1, STONE_GREY);
  stairs.position.set(0, 0.18, 4.4);
  pagodaGroup.add(stairs);

  // Lá sen & bông sen hồng phủ kín mặt hồ Linh Chiểu
  const lilyMat = getToonMaterial(0x387a42);
  for (const [lx, lz] of [
    [-1.2, 1.2],
    [1.4, 1.4],
    [-1.5, 3.0],
    [1.2, 3.2],
    [-0.5, 1.0],
  ]) {
    const pad = new THREE.Mesh(new THREE.CircleGeometry(0.35, 8), lilyMat);
    pad.rotation.x = -Math.PI / 2;
    pad.position.set(lx, 0.12, lz);
    pagodaGroup.add(pad);

    const bloom = sphere(0.1, 5, 0xf4a0b8, 0.01);
    bloom.position.set(lx + 0.06, 0.19, lz + 0.06);
    pagodaGroup.add(bloom);
  }

  // Khách chiêm bái chắp tay cầu nguyện
  const devotee = createNPC({
    outfitColor: 0x8c5b36,
    skinColor: 0xffd8b8,
    action: 'idle',
    hasHat: false,
    scale: 0.88,
  });
  devotee.position.set(0, 0.08, 4.0);
  devotee.rotation.y = Math.PI;
  pagodaGroup.add(devotee);

  // === ĐÀN CHIM BỒ CÂU TRÊN QUẢNG TRƯỜNG BA ĐÌNH ===
  const pigeons = createPigeonsFlock(10);
  pigeons.group.position.set(1.4, 0.04, -0.6);
  squareGroup.add(pigeons.group);

  // Animation phất phơ cờ Tổ quốc & đàn chim bồ câu
  if (ctx) {
    let flagTime = 0;
    const prevUpdate = ctx.onUpdate;
    ctx.onUpdate = (dt: number, playerPos?: THREE.Vector3) => {
      prevUpdate?.(dt, playerPos);
      flagTime += dt * 3.5;
      const pos = flagGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const u = pos.getX(i);
        const wave = Math.sin(flagTime + u * 3.0) * 0.12 * (u / 1.4);
        pos.setZ(i, wave);
      }
      pos.needsUpdate = true;

      pigeons.update(dt, playerPos);
    };
  }

  return group;
}
