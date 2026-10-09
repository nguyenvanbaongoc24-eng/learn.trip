import * as THREE from 'three';
import { getToonMaterial, createToonMesh } from '../materials/toon';
import { createNPC, createPigeonsFlock, createWeepingWillow } from '../props/life';

/**
 * Stage 6: Chùa Một Cột (Liên Hoa Đài) & Quảng Trường Ba Đình / Lăng Bác
 * - Chùa Một Cột: Tác phẩm kiến trúc độc nhất vô nhị thời Lý (1049)
 *   Trụ đá đơn giữa hồ sen Linh Chiểu, 8 dầm gỗ xòe như đóa sen nở,
 *   mái đao cong vút rêu phong, cầu thang gạch cổ dẫn lên đài.
 * - Hậu cảnh: Quảng trường Ba Đình ô cỏ xanh bàn cờ, Lăng Bác đá granite tôn nghiêm
 *   với hàng cột đá hoa cương trang nhã, mái tam cấp, cờ đỏ sao vàng tung bay.
 */

const STONE_LIGHT   = 0xc4c0b6; // Đá hoa cương sáng màu
const STONE_GREY    = 0x9e9a92; // Đá granite xám chuẩn
const GRANITE_DARK  = 0x6e6a64; // Đá móng sẫm màu
const ROOF_TILE     = 0x7a4e38; // Ngói âm dương nâu rêu cổ kính
const WOOD_LACQUER  = 0x9c3222; // Sơn son thếp vàng
const GOLD_FINIAL   = 0xdfab34; // Vàng kim đỉnh nóc & hồ lô
const WATER_LOTUS   = 0x36968c; // Nước hồ sen trong biếc
const GRASS_LAWN    = 0x488a38; // Thảm cỏ xanh Ba Đình
const FLAG_RED      = 0xd92b2b; // Đỏ cờ Tổ quốc

function box(w: number, h: number, d: number, color: number, outline = 0.03): THREE.Mesh {
  return createToonMesh(new THREE.BoxGeometry(w, h, d), getToonMaterial(color), { outline });
}

function cyl(rt: number, rb: number, h: number, seg: number, color: number, outline = 0.03): THREE.Mesh {
  return createToonMesh(new THREE.CylinderGeometry(rt, rb, h, seg), getToonMaterial(color), { outline });
}

function sphere(r: number, seg: number, color: number, outline = 0.02): THREE.Mesh {
  return createToonMesh(new THREE.SphereGeometry(r, seg, seg), getToonMaterial(color), { outline });
}

export function buildMotCot(ctx?: any): THREE.Group {
  const group = new THREE.Group();

  // =========================================================================
  // 1. CHÙA MỘT CỘT (LIÊN HOA ĐÀI) — TRỌNG TÂM CẢNH QUAN
  // =========================================================================
  const pagoda = new THREE.Group();
  pagoda.position.set(0, 0, 1.2); // Đặt ngay trung tâm góc nhìn của người chơi

  // --- HỒ LINH CHIỂU VUÔNG VẮN (Square Lotus Pond) ---
  const pondSize = 5.6;

  // Lòng hồ & nước xanh ngọc bích
  const pondWater = new THREE.Mesh(
    new THREE.BoxGeometry(pondSize - 0.4, 0.1, pondSize - 0.4),
    getToonMaterial(WATER_LOTUS, { transparent: true, opacity: 0.82 })
  );
  pondWater.position.y = 0.08;
  pagoda.add(pondWater);

  // Móng đá chìm dưới đáy hồ
  const pondBed = box(pondSize + 0.4, 0.6, pondSize + 0.4, GRANITE_DARK);
  pondBed.position.y = -0.22;
  pagoda.add(pondBed);

  // Kè đá bao quanh hồ sen có con tiện & trụ góc
  const wallThick = 0.28;
  const wallH = 0.36;
  const halfS = pondSize / 2;
  for (const [wx, wz, ww, wd] of [
    [0, halfS, pondSize + wallThick, wallThick],
    [0, -halfS, pondSize + wallThick, wallThick],
    [halfS, 0, wallThick, pondSize],
    [-halfS, 0, wallThick, pondSize],
  ]) {
    const wall = box(ww, wallH, wd, STONE_LIGHT, 0.02);
    wall.position.set(wx, wallH / 2, wz);
    pagoda.add(wall);
  }

  // 4 trụ đá góc bờ hồ sen
  for (const cx of [-halfS, halfS]) {
    for (const cz of [-halfS, halfS]) {
      const post = box(0.36, 0.52, 0.36, STONE_GREY, 0.02);
      post.position.set(cx, 0.26, cz);
      const cap = sphere(0.12, 6, STONE_LIGHT, 0.015);
      cap.position.set(cx, 0.56, cz);
      pagoda.add(post, cap);
    }
  }

  // --- CỘT ĐÁ NGUYÊN KHỐI & DẦM SEN ĐỠ ĐÀI (Single Pillar & Lotus Brackets) ---
  // Trụ đá tròn đường kính 1.2m (bán kính 0.36u), cao 2.4u trên mặt nước
  const pillar = cyl(0.36, 0.40, 2.4, 16, STONE_GREY);
  pillar.position.y = 1.2;
  pagoda.add(pillar);

  // Vòng gờ đá thắt giữa hai khúc cột đá
  const pillarRing = cyl(0.42, 0.42, 0.14, 16, STONE_LIGHT);
  pillarRing.position.y = 1.35;
  pagoda.add(pillarRing);

  // 8 thanh xà gỗ cong xòe ra đỡ đài chùa như các cánh hoa sen (Lotus petal brackets)
  for (let b = 0; b < 8; b++) {
    const ang = (b * Math.PI) / 4;
    const bracket = box(0.16, 0.22, 1.15, WOOD_LACQUER);
    bracket.position.set(Math.sin(ang) * 0.48, 2.18, Math.cos(ang) * 0.48);
    bracket.rotation.y = ang;
    bracket.rotation.x = 0.32;
    pagoda.add(bracket);
  }

  // Sàn đài sen gỗ vuông
  const shrineFloor = box(2.0, 0.2, 2.0, WOOD_LACQUER);
  shrineFloor.position.y = 2.42;
  pagoda.add(shrineFloor);

  // Lan can gỗ bao quanh đài sen
  for (const [lx, lz, lw, ld] of [
    [0, 0.95, 1.9, 0.08],
    [0.95, 0, 0.08, 1.9],
    [-0.95, 0, 0.08, 1.9],
  ]) {
    const rail = box(lw, 0.35, ld, WOOD_LACQUER, 0.02);
    rail.position.set(lx, 2.65, lz);
    pagoda.add(rail);
  }

  // --- GIAN CHÙA GỖ SƠN SON THẾP VÀNG (Lotus Pavilion Shrine) ---
  // 4 cột gỗ đỡ mái
  const cDist = 0.72;
  for (const px of [-cDist, cDist]) {
    for (const pz of [-cDist, cDist]) {
      const col = cyl(0.08, 0.09, 1.2, 8, WOOD_LACQUER);
      col.position.set(px, 3.08, pz);
      pagoda.add(col);
    }
  }

  // Thân chòi chùa bằng gỗ
  const shrineBody = box(1.35, 1.15, 1.35, WOOD_LACQUER);
  shrineBody.position.set(0, 3.05, 0);
  pagoda.add(shrineBody);

  // Cửa chùa mở quay về hướng Nam đón người chiêm bái
  const shrineDoor = box(0.55, 0.78, 0.08, 0x221814, 0);
  shrineDoor.position.set(0, 2.95, 0.68);
  pagoda.add(shrineDoor);

  // Tượng Bồ Tát Quan Âm ngự trên tòa sen vàng bên trong
  const statue = sphere(0.14, 8, GOLD_FINIAL, 0.015);
  statue.position.set(0, 2.95, 0.35);
  pagoda.add(statue);

  // --- MÁI ĐAO CONG VÚT 4 GÓC (Traditional Quad-Curved Tile Roof) ---
  // Mái hiên xòe rộng
  const eave = box(2.4, 0.26, 2.4, ROOF_TILE, 0.035);
  eave.position.y = 3.75;
  pagoda.add(eave);

  // Khối chóp mái dốc cong
  const roofConeGeo = new THREE.ConeGeometry(1.55, 0.85, 4);
  roofConeGeo.rotateY(Math.PI / 4);
  const roofCone = createToonMesh(roofConeGeo, getToonMaterial(ROOF_TILE), { outline: 0.035 });
  roofCone.position.y = 4.25;
  pagoda.add(roofCone);

  // 4 đầu đao cong vút vểnh lên trời ở 4 góc mái
  for (let c = 0; c < 4; c++) {
    const ang = (c * Math.PI) / 2 + Math.PI / 4;
    const horn = cyl(0.04, 0.08, 0.55, 6, ROOF_TILE, 0.02);
    horn.rotation.z = 0.55;
    horn.rotation.y = ang;
    horn.position.set(Math.sin(ang) * 1.35, 3.95, Math.cos(ang) * 1.35);
    pagoda.add(horn);
  }

  // Đỉnh nóc hồ lô ngọc thanh tao
  const finial = cyl(0.05, 0.1, 0.42, 8, GOLD_FINIAL, 0.015);
  finial.position.y = 4.85;
  pagoda.add(finial);

  // --- CẦU THANG GẠCH DẪN VÀO CHÙA (Brick Staircase) ---
  const stairSteps = 4;
  for (let st = 0; st < stairSteps; st++) {
    const step = box(0.95, 0.12, 0.35, STONE_LIGHT, 0.02);
    step.position.set(0, 0.08 + st * 0.12, halfS + 0.18 + (stairSteps - 1 - st) * 0.32);
    pagoda.add(step);
  }

  // --- HOA SEN & LÁ SEN NỞ RỘ TRÊN MẶT NƯỚC (Lotus Garden) ---
  const lotusPositions = [
    [-1.5, -1.2], [-1.8, 0.8], [-0.8, -1.6],
    [1.5, -1.1], [1.7, 0.9], [0.9, -1.5],
    [-1.2, 1.4], [1.3, 1.5], [-1.9, -0.2], [1.8, -0.2]
  ];
  const padMat = getToonMaterial(0x387a38);
  for (const [lx, lz] of lotusPositions) {
    const pad = new THREE.Mesh(new THREE.CircleGeometry(0.32 + Math.random() * 0.08, 8), padMat);
    pad.rotation.x = -Math.PI / 2;
    pad.position.set(lx, 0.11, lz);
    pagoda.add(pad);

    // Bông sen hồng rạng rỡ
    if (Math.random() > 0.35) {
      const bloom = sphere(0.12, 6, 0xf698ac, 0.015);
      bloom.position.set(lx + 0.05, 0.22, lz + 0.05);
      pagoda.add(bloom);
    }
  }

  group.add(pagoda);

  // =========================================================================
  // 2. QUẢNG TRƯỜNG BA ĐÌNH & LĂNG CHỦ TỊCH HỒ CHÍ MINH (HẬU CẢNH TÔN NGHIÊM)
  // =========================================================================
  const baDinh = new THREE.Group();
  baDinh.position.set(0, 0, -5.8);

  // --- Ô CỎ XANH BÀN CỜ QUẢNG TRƯỜNG BA ĐÌNH ---
  for (let r = 0; r < 2; r++) {
    for (let c = -3; c <= 3; c++) {
      const lawn = box(1.8, 0.04, 1.4, GRASS_LAWN, 0.01);
      lawn.position.set(c * 2.1, 0.02, 1.8 + r * 1.7);
      baDinh.add(lawn);
    }
  }

  // --- CỘT CỜ TỔ QUỐC QUẢNG TRƯỜNG BA ĐÌNH ---
  const pole = cyl(0.05, 0.08, 6.5, 8, 0xefefef, 0.015);
  pole.position.set(0, 3.25, 0.5);
  baDinh.add(pole);

  // Cờ đỏ sao vàng tung bay
  const flagGeo = new THREE.PlaneGeometry(1.5, 0.95, 8, 4);
  const flagMat = getToonMaterial(FLAG_RED, { side: THREE.DoubleSide });
  const flag = new THREE.Mesh(flagGeo, flagMat);
  flag.position.set(0.78, 6.0, 0.5);
  baDinh.add(flag);

  const star = sphere(0.16, 6, 0xf0c030, 0.01);
  star.position.set(0.78, 6.0, 0.52);
  baDinh.add(star);

  // --- LĂNG BÁC (Mausoleum — kiến trúc granite xám chuẩn, sáng sủa, trang nghiêm) ---
  const mausoleum = new THREE.Group();
  mausoleum.position.set(0, 0, -2.2);

  // Bệ đá móng tam cấp vững chắc
  const tier1 = box(7.6, 0.35, 5.0, STONE_GREY);
  tier1.position.y = 0.18;
  mausoleum.add(tier1);

  const tier2 = box(6.8, 0.35, 4.4, STONE_GREY);
  tier2.position.y = 0.52;
  mausoleum.add(tier2);

  const tier3 = box(6.0, 0.35, 3.8, STONE_GREY);
  tier3.position.y = 0.86;
  mausoleum.add(tier3);

  // Khối phòng trung tâm trang trọng
  const centerChamber = box(4.8, 1.8, 2.8, STONE_GREY);
  centerChamber.position.set(0, 1.9, -0.1);
  mausoleum.add(centerChamber);

  // Cửa tiền sảnh Lăng bằng đồng nâu ấm
  const chamberDoor = box(1.4, 1.2, 0.1, 0x5a3d2e, 0.015);
  chamberDoor.position.set(0, 1.65, 1.32);
  mausoleum.add(chamberDoor);

  // HÀNG CỘT ĐÁ HOA CƯƠNG VUÔNG THANH THOÁT (8 cột mặt tiền)
  const colTotal = 8;
  for (let ci = 0; ci < colTotal; ci++) {
    const colX = (ci / (colTotal - 1) - 0.5) * 4.9;
    const pillarCol = box(0.32, 1.8, 0.32, STONE_LIGHT);
    pillarCol.position.set(colX, 1.9, 1.35);
    mausoleum.add(pillarCol);
  }

  // Cột bên sườn
  for (const sx of [-2.45, 2.45]) {
    for (let si = 1; si <= 3; si++) {
      const sCol = box(0.32, 1.8, 0.32, STONE_LIGHT);
      sCol.position.set(sx, 1.9, 1.35 - si * 0.75);
      mausoleum.add(sCol);
    }
  }

  // Dầm đá trên đầu cột
  const lintel = box(5.8, 0.28, 3.5, STONE_LIGHT);
  lintel.position.y = 2.92;
  mausoleum.add(lintel);

  // Dải chữ mận đỏ "CHỦ TỊCH HỒ CHÍ MINH"
  const textPlate = box(2.6, 0.24, 0.08, 0x7c2632, 0.01);
  textPlate.position.set(0, 3.12, 1.76);
  mausoleum.add(textPlate);

  // MÁI TAM CẤP ĐẶC TRƯNG CỦA LĂNG BÁC
  const mRoof1 = box(5.6, 0.38, 3.6, STONE_GREY);
  mRoof1.position.y = 3.38;
  mausoleum.add(mRoof1);

  const mRoof2 = box(4.8, 0.42, 3.0, STONE_LIGHT);
  mRoof2.position.y = 3.76;
  mausoleum.add(mRoof2);

  const mRoof3 = box(4.0, 0.35, 2.4, STONE_GREY);
  mRoof3.position.y = 4.12;
  mausoleum.add(mRoof3);

  // Tiêu binh danh dự quân phục trắng túc trực 2 bên lễ đài
  for (const gx of [-1.1, 1.1]) {
    const guard = createNPC({
      outfitColor: 0xf8f8f8,
      skinColor: 0xf5d6ba,
      hairColor: 0x111111,
      action: 'idle',
      hasHat: false,
      scale: 0.92,
    });
    guard.position.set(gx, 0.2, 0.9);
    mausoleum.add(guard);
  }

  baDinh.add(mausoleum);
  group.add(baDinh);

  // =========================================================================
  // 3. CÂY XANH, BỒ CÂU & NGƯỜI DÂN CHIÊM BÁI
  // =========================================================================
  // Cây liễu rủ thơ mộng bên bờ hồ sen
  const willowL = createWeepingWillow();
  willowL.position.set(-3.5, 0, 1.4);
  group.add(willowL);

  const willowR = createWeepingWillow();
  willowR.position.set(3.5, 0, 1.4);
  group.add(willowR);

  // Đàn bồ câu dạo bước bên bãi cỏ
  const pigeons = createPigeonsFlock(8);
  pigeons.group.position.set(-1.8, 0.04, 3.8);
  group.add(pigeons.group);

  // Người dân đi lễ chùa đứng bên cạnh mép hồ (không chắn trước camera người chơi)
  const visitor = createNPC({
    outfitColor: 0x3d6e5a,
    skinColor: 0xf5d6ba,
    action: 'idle',
    hasHat: true,
    scale: 0.9,
  });
  visitor.position.set(2.4, 0.06, 3.4);
  visitor.rotation.y = -0.6;
  group.add(visitor);

  // Animation phấp phới cờ Tổ quốc & đàn chim bồ câu
  if (ctx) {
    let flagTimer = 0;
    const prevUpdate = ctx.onUpdate;
    ctx.onUpdate = (dt: number, playerPos?: THREE.Vector3) => {
      prevUpdate?.(dt, playerPos);
      flagTimer += dt * 3.8;
      const pos = flagGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const u = pos.getX(i);
        const wave = Math.sin(flagTimer + u * 3.2) * 0.12 * (u / 1.5);
        pos.setZ(i, wave);
      }
      pos.needsUpdate = true;
      pigeons.update(dt, playerPos);
    };
  }

  return group;
}
