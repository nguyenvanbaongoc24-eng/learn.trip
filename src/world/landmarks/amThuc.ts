import * as THREE from 'three';
import { getToonMaterial, createToonMesh } from '../materials/toon';
import { createNPC } from '../props/life';

/**
 * Stage 4: Ẩm Thực Hà Nội (Hanoi Street Food Culture)
 * - Quán phở vỉa hè bốc khói nghi ngút
 * - Mái bạt che nắng mưa, dây đèn tròn ấm cúng
 * - Bàn ghế nhựa thấp, gia vị hạt tiêu dấm tỏi ớt chưng
 * - Bát phở nóng hổi, ly cà phê trứng, trà chanh
 * - Đầu bếp thái thịt & thực khách thưởng thức
 */

const TARP_BLUE     = 0x3672a8;
const METAL_STAINLESS= 0xc8d2d8;
const PLASTIC_RED   = 0xcc2d2d;
const PLASTIC_BLUE  = 0x2b6fc2;
const BOWL_WHITE    = 0xf2f4f5;
const BROTH_GOLD    = 0xd4a042;
const WARM_LIGHT    = 0xffd56b;
const DARK_METAL    = 0x3b4247;

function box(w: number, h: number, d: number, color: number, outline = 0.032): THREE.Mesh {
  return createToonMesh(new THREE.BoxGeometry(w, h, d), getToonMaterial(color), { outline });
}

function cyl(rt: number, rb: number, h: number, seg: number, color: number, outline = 0.032): THREE.Mesh {
  return createToonMesh(new THREE.CylinderGeometry(rt, rb, h, seg), getToonMaterial(color), { outline });
}

function sphere(r: number, seg: number, color: number, outline = 0.032): THREE.Mesh {
  return createToonMesh(new THREE.SphereGeometry(r, seg, seg), getToonMaterial(color), { outline });
}

export function buildAmThuc(ctx?: any): THREE.Group {
  const group = new THREE.Group();

  // === LỐI ĐI BỘ ĐÁ DẪN ĐẾN QUÁN PHỞ ===
  const stepMat = getToonMaterial(0x9a948a);
  for (let s = 0; s < 6; s++) {
    const pz = 3.6 + s * 0.7;
    const stepStone = createToonMesh(
      new THREE.CylinderGeometry(0.38, 0.44, 0.12, 8),
      stepMat,
      { outline: 0.015 }
    );
    stepStone.position.set(s % 2 === 0 ? 0.05 : -0.05, 0.04, pz);
    stepStone.rotation.y = s * 0.35;
    group.add(stepStone);
  }

  // === Mái bạt dù che mưa nắng phố hè ===
  const tarpGroup = new THREE.Group();

  // Tấm bạt màu xanh dương
  const tarpMat = getToonMaterial(TARP_BLUE, { side: THREE.DoubleSide });
  const tarpMesh = createToonMesh(new THREE.BoxGeometry(6.4, 0.06, 5.2), tarpMat, { outline: 0.02 });
  tarpMesh.position.set(0, 3.4, 0);
  tarpMesh.rotation.x = 0.08;
  tarpGroup.add(tarpMesh);

  // 4 cột sắt chống đỡ khung bạt, ăn sâu xuống lòng đất âm Y
  for (const [px, pz] of [
    [-3.0, -2.4],
    [3.0, -2.4],
    [-3.0, 2.4],
    [3.0, 2.4],
  ]) {
    const pole = cyl(0.04, 0.04, 3.8, 6, DARK_METAL, 0.015);
    pole.position.set(px, 1.6, pz);
    tarpGroup.add(pole);
  }

  // Dây bóng đèn tròn vàng lung linh giăng dưới mái bạt
  const bulbs: THREE.Mesh[] = [];
  for (let i = 0; i < 7; i++) {
    const bx = (i - 3) * 0.85;
    const bz = Math.sin(i * 1.1) * 0.6 + 1.2;
    const by = 3.2 - Math.sin(i * 0.9) * 0.25;

    const bulb = sphere(0.08, 6, WARM_LIGHT, 0.01);
    bulb.position.set(bx, by, bz);
    tarpGroup.add(bulb);
    bulbs.push(bulb);
  }

  group.add(tarpGroup);

  // === Quầy xe phở inox truyền thống (Phở Cart) ===
  const cart = new THREE.Group();

  // Thân xe đẩy inox sáng bóng
  const cartBase = box(2.4, 1.1, 1.1, METAL_STAINLESS);
  cartBase.position.y = 0.55;
  cart.add(cartBase);

  // Bánh xe đẩy cao su
  for (const [wx, wz] of [
    [-0.9, -0.45],
    [-0.9, 0.45],
    [0.9, -0.45],
    [0.9, 0.45],
  ]) {
    const wheel = cyl(0.12, 0.12, 0.06, 8, DARK_METAL, 0.01);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(wx, 0.12, wz);
    cart.add(wheel);
  }

  // Nồi hầm nước dùng phở cỡ đại
  const brothPot = cyl(0.42, 0.4, 0.65, 14, METAL_STAINLESS);
  brothPot.position.set(-0.6, 1.42, 0);
  cart.add(brothPot);

  // Nước hầm phở sánh vàng bốc khói
  const soupSurface = cyl(0.38, 0.38, 0.04, 12, BROTH_GOLD, 0);
  soupSurface.position.set(-0.6, 1.72, 0);
  cart.add(soupSurface);

  // Khói thơm phở bốc lên (hạt khói animated)
  const steamParticles: THREE.Mesh[] = [];
  const steamMat = getToonMaterial(0xffffff, { transparent: true, opacity: 0.55 });
  for (let s = 0; s < 5; s++) {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.08 + s * 0.03, 6, 5), steamMat);
    puff.position.set(-0.6 + (Math.random() - 0.5) * 0.15, 1.85 + s * 0.22, (Math.random() - 0.5) * 0.15);
    cart.add(puff);
    steamParticles.push(puff);
  }

  // Tủ kính chia ngăn trưng bày thịt bò tái, nạm, gầu và hành hoa
  const cabinetFrame = box(1.1, 0.85, 0.95, METAL_STAINLESS);
  cabinetFrame.position.set(0.55, 1.52, 0);
  cart.add(cabinetFrame);

  // Mảng rau thơm hành hoa xanh mướt trong tủ
  const scallions = box(0.4, 0.15, 0.35, 0x48a846, 0.015);
  scallions.position.set(0.5, 1.25, -0.2);
  cart.add(scallions);

  // Khay thịt bò chín thái lát
  const beefSlices = box(0.4, 0.12, 0.35, 0xa6483b, 0.015);
  beefSlices.position.set(0.5, 1.25, 0.2);
  cart.add(beefSlices);

  // Chồng bát sứ phở trắng muốt
  for (let b = 0; b < 4; b++) {
    const bowl = cyl(0.14, 0.09, 0.07, 10, BOWL_WHITE, 0.01);
    bowl.position.set(0.05, 1.15 + b * 0.065, 0.25);
    cart.add(bowl);
  }

  cart.position.set(-1.8, 0.04, -1.2);
  group.add(cart);

  // === Bàn ghế nhựa thấp (Bàn phở vỉa hè) ===
  for (let t = 0; t < 3; t++) {
    const tableGroup = new THREE.Group();

    // Mặt bàn nhựa chữ nhật màu xanh dương
    const tableTop = box(1.1, 0.05, 0.7, PLASTIC_BLUE, 0.02);
    tableTop.position.y = 0.55;
    tableGroup.add(tableTop);

    // 4 chân bàn kim loại
    for (const [lx, lz] of [
      [-0.45, -0.26],
      [0.45, -0.26],
      [-0.45, 0.26],
      [0.45, 0.26],
    ]) {
      const leg = box(0.04, 0.55, 0.04, METAL_STAINLESS, 0.01);
      leg.position.set(lx, 0.27, lz);
      tableGroup.add(leg);
    }

    // Trên bàn: Bát phở nóng hổi với ớt tươi
    const soupBowl = cyl(0.16, 0.1, 0.11, 10, BOWL_WHITE, 0.015);
    soupBowl.position.set(-0.22, 0.62, 0);
    tableGroup.add(soupBowl);

    const soupFill = cyl(0.14, 0.14, 0.02, 8, BROTH_GOLD, 0);
    soupFill.position.set(-0.22, 0.66, 0);
    tableGroup.add(soupFill);

    // Cốc cà phê trứng béo ngậy
    const eggCoffeeCup = cyl(0.06, 0.05, 0.1, 8, 0xf7e28b, 0.01);
    eggCoffeeCup.position.set(-0.22, 0.62, 0.24);
    tableGroup.add(eggCoffeeCup);

    // Lọ gia vị dấm tỏi & hũ ớt chưng
    const garlicVinegar = cyl(0.04, 0.04, 0.12, 6, 0xf0f0f0, 0.01);
    garlicVinegar.position.set(0.25, 0.63, -0.15);
    tableGroup.add(garlicVinegar);

    const chiliPot = box(0.09, 0.09, 0.09, PLASTIC_RED, 0.01);
    chiliPot.position.set(0.25, 0.62, 0.15);
    tableGroup.add(chiliPot);

    // Hộp đũa tre
    const chopstickBox = box(0.08, 0.18, 0.08, 0x8a5528, 0.01);
    chopstickBox.position.set(0.38, 0.66, 0);
    tableGroup.add(chopstickBox);

    // 2 ghế nhựa đỏ hai bên bàn
    for (const side of [-1, 1]) {
      const stool = box(0.32, 0.28, 0.32, PLASTIC_RED, 0.015);
      stool.position.set(0, 0.14, side * 0.62);
      tableGroup.add(stool);
    }

    const tx = 0.6 + (t % 2) * 1.5;
    const tz = (t - 1) * 1.6 + 0.4;
    tableGroup.position.set(tx, 0.04, tz);
    group.add(tableGroup);
  }

  // === Thùng đá giữ nhiệt đỏ & két bia hơi Hà Nội ===
  const iceBox = box(0.7, 0.55, 0.55, PLASTIC_RED);
  iceBox.position.set(-2.8, 0.32, 1.4);
  group.add(iceBox);

  // Két bia vàng/đỏ xếp chồng
  for (let c = 0; c < 3; c++) {
    const crate = box(0.55, 0.28, 0.42, c % 2 === 0 ? 0xcc3333 : 0xcca025, 0.015);
    crate.position.set(-2.6, 0.2 + c * 0.29, 0.5);
    group.add(crate);
  }

  // === Biển hiệu chữ lớn "PHỞ HÀ NỘI GIA TRUYỀN" ===
  const signPole = cyl(0.04, 0.04, 3.8, 6, DARK_METAL, 0.015);
  signPole.position.set(-3.2, 1.8, -2.6);
  group.add(signPole);

  const signBoard = box(1.8, 0.75, 0.08, 0xb82828, 0.025);
  signBoard.position.set(-2.4, 2.9, -2.6);
  group.add(signBoard);

  const signInner = box(1.65, 0.6, 0.09, 0xf7efe2, 0);
  signInner.position.set(-2.4, 2.9, -2.6);
  group.add(signInner);

  const textStripe = box(1.3, 0.12, 0.1, 0xcc2828, 0);
  textStripe.position.set(-2.4, 2.9, -2.6);
  group.add(textStripe);

  // === NPCs ===
  const chef = createNPC({
    outfitColor: 0xffffff,
    skinColor: 0xffd8b8,
    hairColor: 0x222222,
    action: 'idle',
    hasHat: false,
    scale: 0.95,
  });
  chef.position.set(-1.0, 0.05, -1.2);
  chef.rotation.y = -Math.PI / 2;
  group.add(chef);

  const diner = createNPC({
    outfitColor: 0x3d7054,
    skinColor: 0xffd8b8,
    action: 'sitting',
    hasHat: false,
    scale: 0.88,
  });
  diner.position.set(0.6, 0.06, 0.3);
  diner.rotation.y = 0;
  group.add(diner);

  // Animation khói phở bồng bềnh
  if (ctx) {
    let time = 0;
    ctx.onUpdate = (dt: number) => {
      time += dt;
      steamParticles.forEach((p, idx) => {
        p.position.y += dt * 0.3;
        p.position.x += Math.sin(time * 2 + idx) * dt * 0.05;
        if (p.position.y > 2.8) {
          p.position.y = 1.75;
        }
      });
    };
  }

  return group;
}
