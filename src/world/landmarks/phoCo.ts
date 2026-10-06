import * as THREE from 'three';
import { getToonMaterial, createToonMesh } from '../materials/toon';
import { createNPC, createFlowerBicycle, createCatenaryWire } from '../props/life';

/**
 * Stage 2: 36 Phố Phường (Hanoi Old Quarter)
 * - Nhà ống hẹp sâu, quét vôi vàng hoa cúc, cửa sổ chớp xanh
 * - Biển hiệu phố nghề (Hàng Mã, Hàng Bạc, Cà Phê Trứng...)
 * - Dây đèn lồng đỏ giăng ngang phố đung đưa trong gió
 * - Bàn ghế nhựa trà đá vỉa hè, gánh hoa rong, xe đạp cổ
 * - Dân phố & khách bộ hành
 */

const CURB_COLOR   = 0xb4a896;
const YELLOW_WALL  = 0xe5be48; // Vàng hoa cúc đặc trưng phố cổ
const WARM_WALL    = 0xdb8e68; // Màu cam đất nung
const GREEN_SHUTTER= 0x2e6b52; // Cửa chớp xanh lá cổ điển
const ROOF_TILE    = 0xa64828; // Ngói vảy cá sẫm
const AWNING_STRIPE= 0x36789e;
const DARK_IRON    = 0x2e3538;
const PLASTIC_RED  = 0xd93838;
const PLASTIC_BLUE = 0x3278cc;
const WOOD_BROWN   = 0x633e24;

function box(w: number, h: number, d: number, color: number, outline = 0.032): THREE.Mesh {
  return createToonMesh(new THREE.BoxGeometry(w, h, d), getToonMaterial(color), { outline });
}

function cyl(rt: number, rb: number, h: number, seg: number, color: number, outline = 0.032): THREE.Mesh {
  return createToonMesh(new THREE.CylinderGeometry(rt, rb, h, seg), getToonMaterial(color), { outline });
}

function sphere(r: number, seg: number, color: number, outline = 0.032): THREE.Mesh {
  return createToonMesh(new THREE.SphereGeometry(r, seg, seg), getToonMaterial(color), { outline });
}

export function buildPhoCo(ctx?: any): THREE.Group {
  const group = new THREE.Group();

  // === Lòng đường phố cổ & Vỉa hè đá xanh ===
  const mainRoad = box(2.4, 0.08, 14.5, 0x4e4a46, 0);
  mainRoad.position.set(0, 0.04, 0);
  group.add(mainRoad);

  // Vỉa hè đá xanh hai bên đường
  for (const sx of [-1.35, 1.35]) {
    const curb = box(0.28, 0.14, 14.5, CURB_COLOR, 0.015);
    curb.position.set(sx, 0.07, 0);
    group.add(curb);
  }

  // Dãy đá bước dạo (stepping stones)
  const stepMat = getToonMaterial(0x9c968c);
  for (let s = -6; s <= 6; s += 1.5) {
    const stepStone = createToonMesh(
      new THREE.CylinderGeometry(0.38, 0.44, 0.12, 8),
      stepMat,
      { outline: 0.015 }
    );
    stepStone.position.set(s % 2 === 0 ? 0.35 : -0.35, 0.08, s);
    stepStone.rotation.y = s * 0.4;
    group.add(stepStone);
  }

  // === Dãy nhà ống phố cổ (Tube Houses) hai bên đường ===
  const houseWallPalette = [
    YELLOW_WALL,
    0xdfb44a,
    WARM_WALL,
    0xd4aa58,
    YELLOW_WALL,
    0xcaa250,
  ];

  const streetSigns = [
    { text: 'HÀNG MÃ', color: 0xcc2626 },
    { text: 'HÀNG BẠC', color: 0x2563a6 },
    { text: 'CÀ PHÊ TRỨNG', color: 0x8a4e22 },
    { text: 'PHỞ GIA TRUYỀN', color: 0xba2828 },
    { text: 'HÀNG ĐÀO', color: 0x2e7552 },
    { text: 'TRÀ ĐÁ VỈA HÈ', color: 0xc87018 },
  ];

  // 10 căn nhà ống san sát hai bên
  for (let i = 0; i < 10; i++) {
    const side = i < 5 ? -1 : 1;
    const indexOnSide = i % 5;
    const zPos = (indexOnSide - 2) * 2.5;

    const house = new THREE.Group();
    const floors = (i % 2 === 0) ? 3 : 2;
    const h = floors * 1.5;
    const w = 2.2;
    const d = 1.8;

    // Móng đá chìm sâu vào lòng đất âm Y để ăn khớp tự nhiên với quả địa cầu cong
    const foundation = box(w + 0.15, 0.7, d + 0.15, 0x4a4642, 0.02);
    foundation.position.y = -0.25;
    house.add(foundation);

    // Thân nhà tường vôi vàng
    const wallColor = houseWallPalette[i % houseWallPalette.length];
    const wall = box(w, h, d, wallColor);
    wall.position.y = h / 2;
    house.add(wall);

    // Mái ngói rêu phong dốc nghiêng
    const roof = box(w + 0.2, 0.25, d + 0.3, ROOF_TILE);
    roof.position.y = h + 0.12;
    house.add(roof);

    // Cửa đi tầng 1 (cửa gỗ cuốn hoặc cửa 4 cánh)
    const door = box(0.9, 1.2, 0.06, WOOD_BROWN, 0.02);
    door.position.set(0, 0.6, d / 2 + 0.02);
    house.add(door);

    // Mái hiên vải bạt gập di động (đỏ / xanh)
    const awningColor = (i % 2 === 0) ? AWNING_STRIPE : 0xc24238;
    const awning = box(w * 0.95, 0.08, 0.85, awningColor, 0.02);
    awning.position.set(0, 1.45, d / 2 + 0.42);
    awning.rotation.x = 0.22;
    house.add(awning);

    // Cửa sổ chớp gỗ xanh lá đặc trưng kiến trúc Pháp cổ
    for (let f = 1; f < floors; f++) {
      const fy = f * 1.5 + 0.75;
      for (const wx of [-0.55, 0.55]) {
        // Cửa sổ chớp
        const shutter = box(0.42, 0.68, 0.06, GREEN_SHUTTER, 0.015);
        shutter.position.set(wx, fy, d / 2 + 0.02);
        house.add(shutter);
      }
    }

    // Biển hiệu nghề truyền thống
    const signInfo = streetSigns[i % streetSigns.length];
    const signBoard = box(1.3, 0.38, 0.08, signInfo.color, 0.02);
    signBoard.position.set(0, 1.85, d / 2 + 0.05);
    house.add(signBoard);

    // Đặt vị trí nhà bên mép phố
    const xPos = side * (1.2 + d / 2 + 0.3);
    house.position.set(xPos, 0.08, zPos);
    house.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
    group.add(house);
  }

  // === Dây đèn lồng đỏ Hội An / phố cổ giăng ngang giữa phố ===
  const lanterns: THREE.Group[] = [];
  for (let l = 0; l < 8; l++) {
    const lantern = new THREE.Group();
    const lBody = sphere(0.18, 6, 0xd42828, 0.015);
    lBody.scale.set(1, 1.25, 1);
    lantern.add(lBody);

    const tassel = cyl(0.025, 0.025, 0.16, 6, 0xd4a028, 0.01);
    tassel.position.y = -0.26;
    lantern.add(tassel);

    const lz = (l - 3.5) * 1.6;
    const lx = Math.sin(l * 1.5) * 0.4;
    const ly = 3.6 + Math.sin(l * 1.2) * 0.15;
    lantern.position.set(lx, ly, lz);
    lanterns.push(lantern);
    group.add(lantern);
  }

  // === Cột điện bê tông với bó dây điện võng Catenary chằng chịt đặc trưng Hà Nội phố ===
  const polePositions = [
    new THREE.Vector3(-1.8, 2.3, -4.8),
    new THREE.Vector3(1.8, 2.3, -4.8),
    new THREE.Vector3(-1.8, 2.3, 4.8),
    new THREE.Vector3(1.8, 2.3, 4.8),
  ];

  for (const pos of polePositions) {
    const pole = cyl(0.08, 0.11, 4.6, 6, 0x4a443e, 0.015);
    pole.position.copy(pos);
    group.add(pole);

    // Xà ngang đỡ sứ cách điện
    const arm = box(1.1, 0.07, 0.07, 0x3a3632, 0.01);
    arm.position.set(pos.x, 4.35, pos.z);
    group.add(arm);

    // Chén sứ cách điện màu trắng
    for (const sx of [-0.42, 0, 0.42]) {
      const insulator = cyl(0.035, 0.045, 0.12, 6, 0xe8e8e8, 0.008);
      insulator.position.set(pos.x + sx, 4.45, pos.z);
      group.add(insulator);
    }

    // Hộp công tơ điện / biến áp nhỏ trên thân cột
    const meterBox = box(0.24, 0.36, 0.18, 0x5a5650, 0.01);
    meterBox.position.set(pos.x > 0 ? pos.x - 0.14 : pos.x + 0.14, 2.8, pos.z);
    group.add(meterBox);
  }

  // Dây điện võng Catenary dọc theo 2 bên vỉa hè
  for (const x of [-1.8, 1.8]) {
    for (const offset of [-0.4, 0, 0.4]) {
      const p1 = new THREE.Vector3(x + offset, 4.45, -4.8);
      const p2 = new THREE.Vector3(x + offset, 4.45, 4.8);
      group.add(createCatenaryWire(p1, p2, 0.38 + Math.abs(offset) * 0.1, 16));
    }
  }

  // Dây điện & dây đèn lồng võng ngang đường (Criss-crossing Catenary)
  for (let z = -3.6; z <= 3.6; z += 2.4) {
    const p1 = new THREE.Vector3(-1.8, 4.2, z);
    const p2 = new THREE.Vector3(1.8, 4.2, z + 0.6);
    group.add(createCatenaryWire(p1, p2, 0.32, 14, 0x1f2326));
  }

  // === Góc quán cóc vỉa hè: Trà chanh, hướng dương, bàn ghế nhựa thấp ===
  for (const [bx, bz] of [
    [-1.8, 1.8],
    [1.8, -1.2],
  ]) {
    const cafeCorner = new THREE.Group();

    // Bàn nhựa nhỏ
    const table = box(0.55, 0.42, 0.45, PLASTIC_BLUE, 0.02);
    table.position.y = 0.21;
    cafeCorner.add(table);

    // Cốc trà đá hổ phách
    const cup = cyl(0.04, 0.03, 0.1, 6, 0xd4a838, 0.01);
    cup.position.set(0.08, 0.47, 0);
    cafeCorner.add(cup);

    // Đĩa hướng dương
    const plate = cyl(0.08, 0.08, 0.02, 8, 0xf0f0f0, 0.01);
    plate.position.set(-0.08, 0.43, 0);
    cafeCorner.add(plate);

    // 3 ghế nhựa con màu đỏ
    for (let c = 0; c < 3; c++) {
      const ang = (c * Math.PI * 2) / 3;
      const stool = box(0.24, 0.24, 0.24, PLASTIC_RED, 0.015);
      stool.position.set(Math.cos(ang) * 0.45, 0.12, Math.sin(ang) * 0.45);
      cafeCorner.add(stool);
    }

    cafeCorner.position.set(bx, 0.08, bz);
    group.add(cafeCorner);
  }

  // === Gánh hàng rong chở hoa quả tươi ===
  const streetVendor = new THREE.Group();
  const pole = cyl(0.02, 0.02, 1.6, 6, 0xbca065, 0.01);
  pole.rotation.z = Math.PI / 2;
  pole.position.y = 0.75;
  streetVendor.add(pole);

  for (const sx of [-0.65, 0.65]) {
    const basket = cyl(0.28, 0.22, 0.18, 8, 0x8a633a, 0.02);
    basket.position.set(sx, 0.22, 0);
    streetVendor.add(basket);

    const rope = cyl(0.01, 0.01, 0.45, 4, 0x5a4835, 0);
    rope.position.set(sx, 0.5, 0);
    streetVendor.add(rope);

    const fruitColor = sx < 0 ? 0xde7b28 : 0xd8b528;
    for (let f = 0; f < 4; f++) {
      const fruit = sphere(0.06, 5, fruitColor, 0.01);
      fruit.position.set(sx + (f % 2 - 0.5) * 0.12, 0.28, (Math.floor(f / 2) - 0.5) * 0.12);
      streetVendor.add(fruit);
    }
  }

  streetVendor.position.set(1.9, 0.08, 1.8);
  group.add(streetVendor);

  // === Chiếc xe đạp cổ Phượng Hoàng chở hoa rong đặc trưng Hà Nội ===
  const bicycle = createFlowerBicycle();
  bicycle.position.set(-1.65, 0.08, -1.8);
  bicycle.rotation.y = 0.38;
  bicycle.scale.setScalar(0.95);
  group.add(bicycle);

  // === Cây cổ thụ góc phố Hà Nội (Hoa sữa / Cây bàng) ===
  const streetTree = new THREE.Group();
  const trunk = cyl(0.18, 0.26, 3.2, 7, WOOD_BROWN);
  trunk.position.y = 1.6;
  streetTree.add(trunk);

  const foliage1 = sphere(1.4, 6, 0x3e7342);
  foliage1.position.y = 3.6;
  streetTree.add(foliage1);

  const foliage2 = sphere(1.0, 6, 0x5e934a);
  foliage2.position.set(0.6, 4.0, 0.4);
  streetTree.add(foliage2);

  streetTree.position.set(-2.8, 0.08, 3.8);
  group.add(streetTree);

  // === NPCs ===
  const vendorLady = createNPC({
    outfitColor: 0x854238,
    skinColor: 0xffd8b8,
    hairColor: 0x1a1a1a,
    action: 'walk',
    hasHat: true,
    scale: 0.88,
  });
  vendorLady.position.set(1.9, 0.1, 0.8);
  vendorLady.rotation.y = -Math.PI / 2;
  group.add(vendorLady);

  const walker = createNPC({
    outfitColor: 0x4876a8,
    skinColor: 0xffd8b8,
    hairColor: 0x2d1f14,
    action: 'idle',
    hasHat: false,
    scale: 0.92,
  });
  walker.position.set(-0.6, 0.1, 0.2);
  walker.rotation.y = Math.PI / 4;
  group.add(walker);

  // Animation đung đưa đèn lồng
  if (ctx) {
    let animTime = 0;
    ctx.onUpdate = (dt: number) => {
      animTime += dt;
      for (let l = 0; l < lanterns.length; l++) {
        lanterns[l].rotation.z = Math.sin(animTime * 2.2 + l * 0.7) * 0.12;
        lanterns[l].rotation.x = Math.cos(animTime * 1.8 + l * 0.5) * 0.08;
      }
    };
  }

  return group;
}
