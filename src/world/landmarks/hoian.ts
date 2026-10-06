import * as THREE from 'three';
import { getToonMaterial, createToonMesh } from '../materials/toon';
import { createWoodenBoat, createNPC } from '../props/life';

/**
 * Hội An Ancient Town Destination Stages:
 * - 1. buildChuaCau (Chùa Cầu Nhật Bản - Lai Viễn Kiều qua dòng nước với tượng Thần Khuyển & Thần Hầu)
 * - 2. buildPhoTuongVang (Dãy phố cổ tường vàng rủ giàn hoa giấy hồng, bàn ghế cóc và lối đá)
 * - 3. buildPhoDenLong (Phố lồng đèn lụa ngũ sắc lung linh, cột điện và xe đạp cổ)
 * - 4. buildPhucKien (Hội quán Phúc Kiến - Tam quan ngói men ngọc, bậc tam cấp đá)
 * - 5. buildTanKy (Nhà cổ Tấn Ký - Kiến trúc gỗ lim trăm tuổi, hoa giấy, lồng đèn, lối đi lát đá tự nhiên)
 * - 6. buildSongHoai (Bến sông Hoài - Thuyền nan mộc mạc và hàng chục đóa hoa đăng trôi lập lờ)
 */

const HOIAN_YELLOW   = 0xe8bc40; // Vàng nghệ / hoa cúc Hội An
const HOIAN_AGED     = 0xd6a832;
const TILE_ANCIENT   = 0x9c482c; // Ngói âm dương rêu phong
const WOOD_DARK      = 0x482e1c; // Gỗ lim sẫm
const WOOD_BEAM      = 0x5e3a24;
const STONE_PAVER    = 0xa69d92; // Đá xanh lát đường
const STONE_DARK     = 0x726c64;
const WATER_HOAI     = 0x3aa89e;
const FLOWER_PINK    = 0xf05282; // Hoa giấy hồng rực rỡ
const GREEN_VINE     = 0x3a7834;
const GREEN_GLAZE    = 0x2e8555; // Ngói tráng men xanh ngọc
const RED_LACQUER    = 0xba2e24;
const GOLD_LEAF      = 0xd8a432;
const RED_LILY       = 0xd93838;

function box(w: number, h: number, d: number, color: number, outline = 0.032): THREE.Mesh {
  return createToonMesh(new THREE.BoxGeometry(w, h, d), getToonMaterial(color), { outline });
}

function cyl(rt: number, rb: number, h: number, seg: number, color: number, outline = 0.032): THREE.Mesh {
  return createToonMesh(new THREE.CylinderGeometry(rt, rb, h, seg), getToonMaterial(color), { outline });
}

function sphere(r: number, seg: number, color: number, outline = 0.032): THREE.Mesh {
  return createToonMesh(new THREE.SphereGeometry(r, seg, seg), getToonMaterial(color), { outline });
}

/** Đèn đá sân vườn / đèn lồng đá phong cách Á Đông (Tōrō) */
function createStoneLantern(): THREE.Group {
  const g = new THREE.Group();
  // Bệ đá
  const base = box(0.32, 0.12, 0.32, STONE_PAVER, 0.015);
  base.position.y = 0.06;
  g.add(base);

  // Cột đèn
  const post = cyl(0.08, 0.09, 0.45, 6, STONE_DARK, 0.015);
  post.position.y = 0.32;
  g.add(post);

  // Bệ đỡ lồng đèn
  const mid = box(0.3, 0.08, 0.3, STONE_PAVER, 0.015);
  mid.position.y = 0.58;
  g.add(mid);

  // Lồng đèn có ô cửa sổ hắt sáng
  const chamber = box(0.24, 0.22, 0.24, 0xfff0c0, 0.015);
  chamber.position.y = 0.72;
  g.add(chamber);

  // Mái đèn đá dốc
  const roofGeo = new THREE.ConeGeometry(0.32, 0.16, 4);
  roofGeo.rotateY(Math.PI / 4);
  const roof = createToonMesh(roofGeo, getToonMaterial(STONE_DARK), { outline: 0.02 });
  roof.position.y = 0.88;
  g.add(roof);

  return g;
}

/** Cột điện gỗ / bê tông làng quê với dây điện võng */
function createRusticPole(h = 4.2): THREE.Group {
  const g = new THREE.Group();
  const pole = cyl(0.09, 0.12, h, 7, 0x6e685f, 0.02);
  pole.position.y = h / 2;
  g.add(pole);

  // Xà ngang sắt
  const cross = box(1.1, 0.08, 0.08, 0x444444, 0.015);
  cross.position.set(0, h - 0.4, 0);
  g.add(cross);

  // 3 sứ cách điện
  for (const sx of [-0.45, 0, 0.45]) {
    const ins = cyl(0.03, 0.03, 0.14, 5, 0xf0efe8, 0.01);
    ins.position.set(sx, h - 0.28, 0);
    g.add(ins);
  }

  // Máy biến áp nhỏ
  const trans = box(0.35, 0.5, 0.3, 0x555e62, 0.02);
  trans.position.set(0.18, h - 1.2, 0);
  g.add(trans);

  return g;
}

/** Lối đi lát đá tự nhiên (Stepping stones) */
function createSteppingStones(startZ: number, endZ: number, count = 7): THREE.Group {
  const g = new THREE.Group();
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const z = THREE.MathUtils.lerp(startZ, endZ, t);
    const x = (Math.sin(i * 1.8) - 0.5) * 0.25;

    const w = 0.65 + (i % 2) * 0.15;
    const d = 0.45 + ((i + 1) % 2) * 0.1;
    const stone = box(w, 0.08, d, (i % 2 === 0 ? STONE_PAVER : STONE_DARK), 0.015);
    stone.position.set(x, 0.04, z);
    stone.rotation.y = (i * 0.2);
    g.add(stone);
  }
  return g;
}

/** Cụm hoa bỉ ngạn & hoa dại mọc ven đường */
function createWildflowerPatch(): THREE.Group {
  const g = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const ang = (i * Math.PI * 2) / 6;
    const dist = 0.3 + (i % 2) * 0.2;
    const flower = sphere(0.06, 5, i % 2 === 0 ? RED_LILY : 0xf8f8ea, 0.01);
    flower.position.set(Math.cos(ang) * dist, 0.18, Math.sin(ang) * dist);
    g.add(flower);

    const stem = cyl(0.01, 0.01, 0.2, 4, 0x488a38, 0);
    stem.position.set(Math.cos(ang) * dist, 0.09, Math.sin(ang) * dist);
    g.add(stem);
  }
  return g;
}

// ════════════════════════════════════════════════════════════════
// 1. Chùa Cầu (Japanese Covered Bridge - Lai Viễn Kiều)
// ════════════════════════════════════════════════════════════════
export function buildChuaCau(_ctx: any): THREE.Group {
  const group = new THREE.Group();

  // Kênh nước dưới gầm cầu
  const canal = box(5.5, 0.14, 11, WATER_HOAI, 0);
  canal.position.set(0, 0.06, 0);
  group.add(canal);

  // Mố cầu đá hai đầu bờ
  for (const sz of [-4.2, 4.2]) {
    const bank = box(7.2, 0.5, 3.2, STONE_PAVER);
    bank.position.set(0, 0.25, sz);
    group.add(bank);
  }

  // Trụ đá vòm đỡ cầu cắm dưới nước
  for (const [px, pz] of [
    [-1.4, -1.5],
    [1.4, -1.5],
    [-1.4, 1.5],
    [1.4, 1.5],
  ]) {
    const pier = cyl(0.35, 0.42, 1.6, 8, STONE_DARK);
    pier.position.set(px, 0.75, pz);
    group.add(pier);
  }

  // Thân cầu gỗ uốn cong nhịp nhàng
  const bridgeDeck = box(3.2, 0.35, 7.4, WOOD_DARK);
  bridgeDeck.position.y = 1.35;
  group.add(bridgeDeck);

  // Mái ngói lợp cong che trọn thân cầu
  const bridgeRoofGeo = new THREE.ConeGeometry(2.8, 1.6, 4);
  bridgeRoofGeo.rotateY(Math.PI / 4);
  bridgeRoofGeo.scale(1.3, 1, 2.4);
  const bridgeRoof = createToonMesh(bridgeRoofGeo, getToonMaterial(TILE_ANCIENT), { outline: 0.035 });
  bridgeRoof.position.set(0, 3.2, 0);
  group.add(bridgeRoof);

  // Ngôi miếu nhỏ thờ Bắc Đế Trấn Vũ ở sườn giữa cầu
  const shrine = box(2.2, 1.6, 1.8, RED_LACQUER);
  shrine.position.set(1.6, 1.9, 0);
  group.add(shrine);

  // Tượng Thần Khuyển (chó đá) & Thần Hầu (khỉ đá) hai đầu cầu
  const dogStatue = box(0.35, 0.45, 0.35, STONE_DARK);
  dogStatue.position.set(-1.1, 1.7, -3.2);
  group.add(dogStatue);

  const monkeyStatue = box(0.35, 0.45, 0.35, STONE_DARK);
  monkeyStatue.position.set(-1.1, 1.7, 3.2);
  group.add(monkeyStatue);

  // Đèn đá sân vườn hai đầu cầu
  const lanternL = createStoneLantern();
  lanternL.position.set(-2.2, 0.5, -3.8);
  group.add(lanternL);

  const lanternR = createStoneLantern();
  lanternR.position.set(2.2, 0.5, 3.8);
  group.add(lanternR);

  // Cột điện cổ ven bờ
  const pole = createRusticPole(4.5);
  pole.position.set(-3.2, 0.5, -4.2);
  group.add(pole);

  return group;
}

// ════════════════════════════════════════════════════════════════
// 2. Phố Cổ Tường Vàng & Giàn Hoa Giấy (Golden Walls)
// ════════════════════════════════════════════════════════════════
export function buildPhoTuongVang(_ctx: any): THREE.Group {
  const group = new THREE.Group();

  // Dãy 3 nhà ống cổ tường vàng nghệ rực rỡ
  for (let i = 0; i < 3; i++) {
    const house = new THREE.Group();
    const w = 2.8;
    const h = 3.6;
    const d = 2.6;

    // Tường vàng hoa cúc
    const wall = box(w, h, d, (i === 1 ? HOIAN_YELLOW : HOIAN_AGED));
    wall.position.y = h / 2;
    house.add(wall);

    // Mái ngói âm dương rêu phong dốc nghiêng
    const roofGeo = new THREE.ConeGeometry(2.5, 1.4, 4);
    roofGeo.rotateY(Math.PI / 4);
    roofGeo.scale(1, 1, 0.85);
    const roof = createToonMesh(roofGeo, getToonMaterial(TILE_ANCIENT), { outline: 0.035 });
    roof.position.y = h + 0.7;
    house.add(roof);

    // Cửa chính gỗ sẫm
    const door = box(1.0, 1.6, 0.1, WOOD_DARK, 0.02);
    door.position.set(0, 0.8, d / 2 + 0.02);
    house.add(door);

    // Cửa sổ tầng trên
    for (const wx of [-0.7, 0.7]) {
      const win = box(0.52, 0.75, 0.08, 0x2e624c, 0.015);
      win.position.set(wx, 2.5, d / 2 + 0.02);
      house.add(win);
    }

    // Giàn hoa giấy rủ bóng hoa hồng thắm trên ban công
    const vine = box(2.0, 0.4, 0.5, GREEN_VINE, 0.015);
    vine.position.set(0, 3.0, d / 2 + 0.28);
    house.add(vine);

    for (let f = 0; f < 8; f++) {
      const flower = sphere(0.12, 5, FLOWER_PINK, 0.01);
      flower.position.set((f - 3.5) * 0.26, 2.9 - (f % 2) * 0.16, d / 2 + 0.42);
      house.add(flower);
    }

    // Lồng đèn treo hiên nhà
    for (const lx of [-0.9, 0.9]) {
      const lantern = sphere(0.16, 6, i % 2 === 0 ? 0xd42828 : 0xd8a028, 0.012);
      lantern.scale.set(1, 1.3, 1);
      lantern.position.set(lx, 1.8, d / 2 + 0.35);
      house.add(lantern);
    }

    house.position.set((i - 1) * 3.1, 0, -1.4);
    group.add(house);
  }

  // Lối đi lát đá tự nhiên dẫn vào các nhà
  const stones = createSteppingStones(3.5, 0.5, 8);
  group.add(stones);

  // Hoa bỉ ngạn & hoa dại mọc hai bên lối đi
  const flowers1 = createWildflowerPatch();
  flowers1.position.set(-1.6, 0, 1.8);
  group.add(flowers1);

  const flowers2 = createWildflowerPatch();
  flowers2.position.set(1.6, 0, 1.5);
  group.add(flowers2);

  // Đèn đá sân vườn
  const lantern = createStoneLantern();
  lantern.position.set(-1.2, 0, 2.5);
  group.add(lantern);

  return group;
}

// ════════════════════════════════════════════════════════════════
// 3. Phố Đèn Lồng (Lantern Street)
// ════════════════════════════════════════════════════════════════
export function buildPhoDenLong(ctx: any): THREE.Group {
  const group = buildPhoTuongVang(ctx);

  // Đèn lồng lụa Hội An ngũ sắc lung linh treo khắp phố
  const lanternColors = [0xd92626, 0xd49a26, 0x269ad4, 0x9a26d4, 0x26d46a];
  const lanterns: THREE.Mesh[] = [];

  for (let i = 0; i < 12; i++) {
    const lGeo = new THREE.DodecahedronGeometry(0.24, 0);
    lGeo.scale(1, 1.45, 1);
    const lMat = getToonMaterial(lanternColors[i % lanternColors.length]);
    const lantern = createToonMesh(lGeo, lMat, { outline: 0.02 });

    const lx = (i % 6 - 2.5) * 1.25;
    const lz = (Math.floor(i / 6) - 0.5) * 2.4 + 0.8;
    const ly = 3.2 + Math.sin(i * 1.2) * 0.25;
    lantern.position.set(lx, ly, lz);
    group.add(lantern);
    lanterns.push(lantern);
  }

  // Cột điện gỗ mộc treo đèn lồng
  const pole = createRusticPole(4.6);
  pole.position.set(-3.2, 0, 2.2);
  group.add(pole);

  // Animation đung đưa lồng đèn trong gió
  let lTime = 0;
  ctx.onUpdate = (dt: number) => {
    lTime += dt * 2.0;
    lanterns.forEach((l, idx) => {
      l.rotation.z = Math.sin(lTime + idx * 0.8) * 0.08;
      l.rotation.x = Math.cos(lTime + idx * 0.8) * 0.05;
    });
  };

  return group;
}

// ════════════════════════════════════════════════════════════════
// 4. Hội quán Phúc Kiến (Fujian Assembly Hall)
// ════════════════════════════════════════════════════════════════
export function buildPhucKien(_ctx: any): THREE.Group {
  const group = new THREE.Group();

  // Bậc tam cấp đá xanh dẫn lên cổng Tam Quan
  for (let s = 0; s < 4; s++) {
    const step = box(5.8 - s * 0.3, 0.16, 0.6, STONE_PAVER, 0.015);
    step.position.set(0, s * 0.16 + 0.08, 1.8 - s * 0.5);
    group.add(step);
  }

  // Cổng Tam Quan nguy nga (Triple Entrance Gate)
  const gate = new THREE.Group();

  // Thân cổng xây gạch sơn đỏ son
  const wallLeft = box(1.3, 3.4, 1.0, RED_LACQUER);
  wallLeft.position.set(-2.2, 1.7, 0);
  gate.add(wallLeft);

  const wallRight = box(1.3, 3.4, 1.0, RED_LACQUER);
  wallRight.position.set(2.2, 1.7, 0);
  gate.add(wallRight);

  const centerPillars = box(2.0, 4.6, 1.2, RED_LACQUER);
  centerPillars.position.set(0, 2.3, 0);
  gate.add(centerPillars);

  // Mái ngói men xanh ngọc bích 2 tầng
  const mainRoof = box(2.8, 0.45, 1.8, GREEN_GLAZE);
  mainRoof.position.set(0, 4.8, 0);
  gate.add(mainRoof);

  const ridge = box(2.2, 0.28, 0.38, GOLD_LEAF, 0.02);
  ridge.position.set(0, 5.2, 0);
  gate.add(ridge);

  // Mái hai bên tả hữu
  for (const sx of [-2.2, 2.2]) {
    const sideRoof = box(1.8, 0.38, 1.4, GREEN_GLAZE);
    sideRoof.position.set(sx, 3.6, 0);
    gate.add(sideRoof);
  }

  // Vòm cửa chính
  const portal = box(1.0, 1.8, 1.3, 0x1a2428, 0);
  portal.position.set(0, 0.9, 0);
  gate.add(portal);

  group.add(gate);

  // Đèn đá sân vườn hai bên bậc tam cấp
  const lanternL = createStoneLantern();
  lanternL.position.set(-2.8, 0.1, 2.4);
  group.add(lanternL);

  const lanternR = createStoneLantern();
  lanternR.position.set(2.8, 0.1, 2.4);
  group.add(lanternR);

  // Lối đi lát đá
  const stones = createSteppingStones(4.5, 2.2, 6);
  group.add(stones);

  return group;
}

// ════════════════════════════════════════════════════════════════
// 5. Nhà Cổ Tấn Ký (Tan Ky Ancient House)
// ════════════════════════════════════════════════════════════════
export function buildTanKy(_ctx: any): THREE.Group {
  const group = new THREE.Group();

  // Ngôi nhà cổ 2 tầng gỗ lim & tường vàng hoa cúc trăm tuổi
  const house = new THREE.Group();

  // 1. Tầng 1: Khung gỗ lim trầm mặc & tường vàng ấm áp
  const groundFloor = box(4.4, 2.4, 4.8, HOIAN_YELLOW);
  groundFloor.position.y = 1.2;
  house.add(groundFloor);

  // Chân tảng đá kê cột chống ẩm lũ lụt ven sông Hoài
  const stonePlinth = box(4.6, 0.28, 5.0, STONE_DARK);
  stonePlinth.position.y = 0.14;
  house.add(stonePlinth);

  // Cửa bức bàn gỗ 4 cánh mở rộng đón khách
  const door = box(2.2, 1.7, 0.12, WOOD_DARK, 0.02);
  door.position.set(0, 1.0, 2.42);
  house.add(door);

  // Cột gỗ hiên nhà
  for (const cx of [-1.8, 1.8]) {
    const col = cyl(0.12, 0.14, 2.2, 8, WOOD_DARK);
    col.position.set(cx, 1.25, 2.6);
    house.add(col);
  }

  // 2. Tầng 2 (Gác lửng tránh lũ lịch sử Hội An)
  const upperFloor = box(4.2, 1.8, 4.4, HOIAN_YELLOW);
  upperFloor.position.y = 3.3;
  house.add(upperFloor);

  // Ban công gỗ chạm trổ hoa văn & ròng rọc kéo đồ khi nước lũ dâng
  const balcony = box(4.4, 0.7, 0.6, WOOD_BEAM, 0.02);
  balcony.position.set(0, 2.8, 2.4);
  house.add(balcony);

  // Cửa sổ gỗ chớp tầng 2
  for (const wx of [-1.1, 1.1]) {
    const win = box(0.65, 0.9, 0.08, WOOD_DARK, 0.015);
    win.position.set(wx, 3.4, 2.22);
    house.add(win);
  }

  // Hoành phi câu đối chữ Hán sơn son thếp vàng
  const plaque = box(1.8, 0.45, 0.1, RED_LACQUER, 0.02);
  plaque.position.set(0, 2.2, 2.46);
  house.add(plaque);

  const goldText = box(1.5, 0.18, 0.11, GOLD_LEAF, 0);
  goldText.position.set(0, 2.2, 2.47);
  house.add(goldText);

  // Giàn hoa giấy rủ hoa hồng thắm ngập tràn từ ban công
  const vine = box(3.2, 0.4, 0.6, GREEN_VINE, 0.015);
  vine.position.set(0, 3.8, 2.45);
  house.add(vine);

  for (let f = 0; f < 10; f++) {
    const flower = sphere(0.14, 5, FLOWER_PINK, 0.01);
    flower.position.set((f - 4.5) * 0.32, 3.65 - (f % 2) * 0.22, 2.62);
    house.add(flower);
  }

  // Đèn lồng đỏ & vàng treo trước hiên nhà
  for (const [lx, col] of [
    [-1.2, 0xd42828],
    [1.2, 0xd8a028],
  ]) {
    const lantern = sphere(0.2, 6, col, 0.015);
    lantern.scale.set(1, 1.35, 1);
    lantern.position.set(lx, 2.0, 2.7);
    house.add(lantern);
  }

  // 3. Mái ngói âm dương rêu phong cổ kính
  const roofGeo = new THREE.ConeGeometry(3.6, 1.8, 4);
  roofGeo.rotateY(Math.PI / 4);
  roofGeo.scale(1.15, 1, 1.35);
  const roof = createToonMesh(roofGeo, getToonMaterial(TILE_ANCIENT), { outline: 0.035 });
  roof.position.set(0, 4.8, 0);
  house.add(roof);

  // Đỉnh bờ nóc chạm rồng chầu nguyệt
  const crest = box(2.4, 0.24, 0.3, STONE_DARK, 0.02);
  crest.position.set(0, 5.6, 0);
  house.add(crest);

  house.position.set(0, 0, -1.2);
  group.add(house);

  // ══════════ KHÔNG GIAN SÂN VƯỜN & MÔI TRƯỜNG TỰ NHIÊN XUNG QUANH ══════════
  // Lối đi lát đá tự nhiên dẫn từ camera vào trước cửa nhà (Stepping stones)
  const stones = createSteppingStones(5.2, 1.4, 9);
  group.add(stones);

  // Hai bên lối đi: Đèn đá sân vườn
  const lanternL = createStoneLantern();
  lanternL.position.set(-1.4, 0, 3.2);
  group.add(lanternL);

  const lanternR = createStoneLantern();
  lanternR.position.set(1.4, 0, 3.2);
  group.add(lanternR);

  // Cột điện cổ Hội An ở góc đường với sứ cách điện
  const pole = createRusticPole(4.5);
  pole.position.set(-2.8, 0, 3.8);
  group.add(pole);

  // Cụm hoa bỉ ngạn đỏ rực rỡ và cỏ xanh hai bên lối đi
  const flowersLeft = createWildflowerPatch();
  flowersLeft.position.set(-1.8, 0, 2.2);
  group.add(flowersLeft);

  const flowersRight = createWildflowerPatch();
  flowersRight.position.set(1.8, 0, 2.2);
  group.add(flowersRight);

  // Bàn trà đá và chậu cây bonsai bên hiên
  const teaTable = cyl(0.35, 0.35, 0.42, 8, STONE_PAVER, 0.015);
  teaTable.position.set(1.8, 0.21, 0.6);
  group.add(teaTable);

  const teapot = sphere(0.08, 5, 0x3d6e5a, 0.01);
  teapot.position.set(1.8, 0.47, 0.6);
  group.add(teapot);

  const pot = cyl(0.22, 0.28, 0.35, 8, 0x8a5234, 0.015);
  pot.position.set(-1.8, 0.18, 0.6);
  group.add(pot);

  const bonsaiFoliage = sphere(0.32, 6, 0x3a7834, 0.02);
  bonsaiFoliage.position.set(-1.8, 0.58, 0.6);
  group.add(bonsaiFoliage);

  return group;
}

// ════════════════════════════════════════════════════════════════
// 6. Sông Hoài & Thả Hoa Đăng (Hoai River & Floating Lanterns)
// ════════════════════════════════════════════════════════════════
export function buildSongHoai(ctx: any): THREE.Group {
  const group = new THREE.Group();

  // Dòng sông Hoài êm đềm nước ngọc lam
  const river = new THREE.Mesh(
    new THREE.CircleGeometry(12, 36),
    getToonMaterial(WATER_HOAI, { transparent: true, opacity: 0.82 })
  );
  river.rotation.x = -Math.PI / 2;
  river.position.y = 0.08;
  group.add(river);

  // Bến đò đá xanh ven sông
  const pier = box(4.5, 0.4, 2.5, STONE_PAVER, 0.02);
  pier.position.set(0, 0.2, 3.2);
  group.add(pier);

  // Cọc gỗ neo thuyền
  for (const px of [-1.5, 1.5]) {
    const post = cyl(0.08, 0.09, 0.7, 6, WOOD_DARK, 0.015);
    post.position.set(px, 0.45, 2.1);
    group.add(post);
  }

  // Con thuyền nan mộc mạc trôi trên sông
  const boat = createWoodenBoat();
  boat.position.set(-1.2, 0.12, 0.2);
  boat.rotation.y = 0.4;
  group.add(boat);

  // Thiếu nữ Hội An ngồi trên thuyền thả hoa đăng
  const girl = createNPC({
    outfitColor: 0xe8bc40, // Áo dài vàng hoa cúc
    skinColor: 0xffd8b8,
    action: 'sitting',
    hasHat: true,
    scale: 0.88,
  });
  girl.position.set(-1.2, 0.22, 0.2);
  group.add(girl);

  // Các đóa hoa đăng giấy rực rỡ trôi lập lờ trên mặt nước sông Hoài
  const lanterns: THREE.Mesh[] = [];
  const flowerColors = [0xf04848, 0xf0b838, 0x48a8f0, 0xd848f0, 0x48f088];

  for (let i = 0; i < 14; i++) {
    const lanternGroup = new THREE.Group();

    // Cánh hoa sen giấy gấp
    const petalGeo = new THREE.ConeGeometry(0.24, 0.14, 5);
    const petalMat = getToonMaterial(flowerColors[i % flowerColors.length]);
    const petals = createToonMesh(petalGeo, petalMat, { outline: 0.015 });
    petals.rotation.x = Math.PI;
    lanternGroup.add(petals);

    // Ngọn nến lung linh ở giữa
    const candle = cyl(0.025, 0.025, 0.12, 6, 0xfff0aa, 0);
    candle.position.y = 0.08;
    lanternGroup.add(candle);

    const lx = (Math.random() - 0.5) * 9.5;
    const lz = (Math.random() - 0.5) * 9.5;
    lanternGroup.position.set(lx, 0.15, lz);
    group.add(lanternGroup);
    lanterns.push(lanternGroup as any);
  }

  // Đèn đá sân vườn trên bờ bến sông
  const lanternL = createStoneLantern();
  lanternL.position.set(-2.0, 0.4, 3.8);
  group.add(lanternL);

  const lanternR = createStoneLantern();
  lanternR.position.set(2.0, 0.4, 3.8);
  group.add(lanternR);

  // Animation hoa đăng và thuyền bập bềnh
  let riverTime = 0;
  ctx.onUpdate = (dt: number) => {
    riverTime += dt;
    boat.position.y = 0.12 + Math.sin(riverTime * 1.5) * 0.04;
    boat.rotation.z = Math.sin(riverTime * 1.2) * 0.02;

    lanterns.forEach((l, idx) => {
      l.position.x += dt * 0.15;
      l.position.y = 0.15 + Math.sin(riverTime * 2.0 + idx) * 0.03;
      if (l.position.x > 6.0) {
        l.position.x = -6.0;
      }
    });
  };

  return group;
}
