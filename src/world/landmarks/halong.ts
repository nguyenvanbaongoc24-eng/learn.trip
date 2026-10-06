import * as THREE from 'three';
import { getToonMaterial, createToonMesh } from '../materials/toon';
import { createWoodenBoat, createNPC } from '../props/life';

/**
 * Hạ Long Bay Destination Stages:
 * 1. buildTrongMai (Hòn Trống Mái - Hai khối đá nghiêng đối mặt trên làn nước ngọc bích)
 * 2. buildSungSot (Hang Sửng Sốt - Thạch nhũ kỳ vĩ & lối thang đá)
 * 3. buildTiTop (Đảo Ti Tốp - Bãi cát trắng trăng khuyết & Đỉnh vọng cảnh)
 * 4. buildCuaVan (Làng chài Cửa Vạn - Nhà bè gỗ nổi rực rỡ & Thuyền nan)
 * 5. buildDauGo (Hang Đầu Gỗ - Cọc gỗ lim lịch sử cắm bờ nước)
 * 6. buildThienCung (Động Thiên Cung - Cung điện nhũ đá lung linh sắc màu)
 */

const WATER_EMERALD = 0x36a89e;
const KARST_STONE   = 0x7a7d76;
const KARST_MOSS    = 0x486b3e;
const SAND_BEACH    = 0xded2b0;
const SAIL_TERRA    = 0xba5338; // Buồm nâu đỏ cánh dơi Hạ Long
const WOOD_BOAT     = 0x5a3c26;

function box(w: number, h: number, d: number, color: number, outline = 0.032): THREE.Mesh {
  return createToonMesh(new THREE.BoxGeometry(w, h, d), getToonMaterial(color), { outline });
}

function cyl(rt: number, rb: number, h: number, seg: number, color: number, outline = 0.032): THREE.Mesh {
  return createToonMesh(new THREE.CylinderGeometry(rt, rb, h, seg), getToonMaterial(color), { outline });
}

function sphere(r: number, seg: number, color: number, outline = 0.032): THREE.Mesh {
  return createToonMesh(new THREE.SphereGeometry(r, seg, seg), getToonMaterial(color), { outline });
}

// Thuyền buồm gỗ Đông Dương (Indochina Junk Boat with fan sails)
function createJunkBoat(): THREE.Group {
  const boat = new THREE.Group();

  // Thân thuyền gỗ
  const hullGeo = new THREE.BoxGeometry(3.6, 0.9, 1.4);
  const hull = createToonMesh(hullGeo, getToonMaterial(WOOD_BOAT), { outline: 0.03 });
  hull.position.y = 0.45;
  boat.add(hull);

  // Cabin trên boong
  const cabin = box(1.8, 0.75, 1.1, 0xd4c2a0, 0.02);
  cabin.position.set(-0.2, 1.2, 0);
  boat.add(cabin);

  // Cột buồm
  const mast = cyl(0.04, 0.05, 3.2, 6, 0x3d281a, 0.015);
  mast.position.set(0.6, 2.0, 0);
  boat.add(mast);

  // Cánh buồm nâu đỏ xếp nan quạt (cánh dơi)
  const sailGeo = new THREE.PlaneGeometry(1.8, 2.2, 4, 4);
  const sailMat = getToonMaterial(SAIL_TERRA, { side: THREE.DoubleSide });
  const sail = new THREE.Mesh(sailGeo, sailMat);
  sail.position.set(0.6, 2.2, 0.05);
  sail.rotation.y = 0.2;
  boat.add(sail);

  return boat;
}

// 1. Hòn Trống Mái (Fighting Cocks Rocks)
export function buildTrongMai(ctx: any): THREE.Group {
  const group = new THREE.Group();

  // Mặt nước biển ngọc bích phẳng lặng
  const sea = new THREE.Mesh(
    new THREE.CircleGeometry(12, 32),
    getToonMaterial(WATER_EMERALD, { transparent: true, opacity: 0.82 })
  );
  sea.rotation.x = -Math.PI / 2;
  sea.position.y = 0.08;
  group.add(sea);

  // Hòn Trống (đá lớn nghiêng sang phải)
  const trongGroup = new THREE.Group();
  const trongBase = cyl(0.7, 1.2, 1.5, 7, KARST_STONE);
  trongBase.position.y = 0.75;
  trongGroup.add(trongBase);

  const trongHead = sphere(1.6, 7, KARST_STONE);
  trongHead.scale.set(1.1, 1.6, 0.9);
  trongHead.position.set(0.2, 2.6, 0);
  trongGroup.add(trongHead);

  // Thảm rêu cây bụi trên đỉnh đá
  const trongCap = sphere(1.2, 6, KARST_MOSS, 0);
  trongCap.position.set(0.2, 3.6, 0);
  trongGroup.add(trongCap);

  trongGroup.position.set(-1.8, 0, 0);
  trongGroup.rotation.z = -0.15;
  group.add(trongGroup);

  // Hòn Mái (đá nhỏ nghiêng sang trái, như đôi chim chụm mỏ)
  const maiGroup = new THREE.Group();
  const maiBase = cyl(0.6, 1.0, 1.4, 7, KARST_STONE);
  maiBase.position.y = 0.7;
  maiGroup.add(maiBase);

  const maiHead = sphere(1.4, 7, KARST_STONE);
  maiHead.scale.set(0.9, 1.4, 0.85);
  maiHead.position.set(-0.15, 2.2, 0);
  maiGroup.add(maiHead);

  const maiCap = sphere(1.0, 6, KARST_MOSS, 0);
  maiCap.position.set(-0.15, 3.1, 0);
  maiGroup.add(maiCap);

  maiGroup.position.set(1.8, 0, 0);
  maiGroup.rotation.z = 0.16;
  group.add(maiGroup);

  // Thuyền buồm Đông Dương lướt nhẹ phía xa
  const junk = createJunkBoat();
  junk.position.set(-4.5, 0.08, 3.2);
  junk.rotation.y = Math.PI / 3;
  junk.scale.set(0.85, 0.85, 0.85);
  group.add(junk);

  // Animation bập bềnh thuyền
  let time = 0;
  ctx.onUpdate = (dt: number) => {
    time += dt;
    junk.position.y = 0.08 + Math.sin(time * 1.5) * 0.06;
    junk.rotation.z = Math.sin(time * 1.2) * 0.03;
  };

  return group;
}

// 2. Hang Sửng Sốt (Surprise Cave)
export function buildSungSot(_ctx: any): THREE.Group {
  const group = new THREE.Group();

  // Khối vòm hang đá vôi kỳ vĩ
  const caveDome = sphere(5.2, 8, KARST_STONE);
  caveDome.scale.set(1.4, 0.8, 1.2);
  caveDome.position.set(0, 3.2, -1.0);
  group.add(caveDome);

  // Cửa hang hắt ánh sáng ra bên ngoài
  const entrance = box(3.4, 2.6, 1.5, 0x1a2428, 0);
  entrance.position.set(0, 1.3, 3.2);
  group.add(entrance);

  // Các dải thạch nhũ rủ từ trần hang xuống (Stalactites)
  for (let s = 0; s < 6; s++) {
    const stalac = cyl(0.04, 0.28, 1.8, 6, 0xb8b2a4, 0.02);
    stalac.position.set((s - 2.5) * 1.1, 3.8, (s % 2 - 0.5) * 1.2);
    group.add(stalac);
  }

  // Măng đá mọc từ dưới sàn lên (Stalagmites)
  for (let m = 0; m < 5; m++) {
    const stalag = cyl(0.25, 0.03, 1.4, 6, 0xa49e92, 0.02);
    stalag.position.set((m - 2) * 1.4, 0.7, (Math.random() - 0.5) * 2.0);
    group.add(stalag);
  }

  // Bậc thang đá có tay vịn dẫn du khách vào trong
  for (let st = 0; st < 6; st++) {
    const step = box(2.4, 0.16, 0.45, 0x6e6862, 0.015);
    step.position.set(0, st * 0.16 + 0.08, 3.0 - st * 0.45);
    group.add(step);
  }

  // Khách du lịch trầm trồ trước vẻ đẹp hang
  const visitor = createNPC({
    outfitColor: 0x3d78a8,
    skinColor: 0xffd8b8,
    action: 'idle',
    hasHat: false,
    scale: 0.9,
  });
  visitor.position.set(0.6, 0.8, 1.8);
  visitor.rotation.y = Math.PI;
  group.add(visitor);

  return group;
}

// 3. Đảo Ti Tốp (Ti Top Island)
export function buildTiTop(_ctx: any): THREE.Group {
  const group = new THREE.Group();

  // Mặt nước biển
  const sea = new THREE.Mesh(
    new THREE.CircleGeometry(11, 28),
    getToonMaterial(WATER_EMERALD, { transparent: true, opacity: 0.82 })
  );
  sea.rotation.x = -Math.PI / 2;
  sea.position.y = 0.08;
  group.add(sea);

  // Đảo đá karst hình nón vươn cao phủ thảm thực vật xanh
  const mountain = cyl(0.6, 4.2, 6.5, 8, KARST_STONE);
  mountain.position.set(-1.2, 3.25, -1.2);
  group.add(mountain);

  const foliage = sphere(2.4, 6, KARST_MOSS, 0);
  foliage.position.set(-1.2, 5.8, -1.2);
  group.add(foliage);

  // Vọng lâu quan sát trên đỉnh núi ngắm trọn vịnh Hạ Long
  const pavilion = box(1.2, 0.8, 1.2, 0x8a3828);
  pavilion.position.set(-1.2, 6.8, -1.2);
  group.add(pavilion);

  // Bãi tắm Ti Tốp bờ cát trắng mịn hình vành trăng khuyết
  const beach = cyl(4.2, 4.6, 0.22, 16, SAND_BEACH, 0.015);
  beach.position.set(2.4, 0.15, 2.0);
  beach.scale.set(1.2, 1, 0.7);
  group.add(beach);

  // Dù che nắng bãi biển sọc đỏ trắng
  for (let u = 0; u < 3; u++) {
    const umbrella = new THREE.Group();
    const pole = cyl(0.025, 0.025, 1.2, 6, 0x444444, 0.01);
    pole.position.y = 0.6;
    umbrella.add(pole);

    const canopyGeo = new THREE.ConeGeometry(0.75, 0.35, 8);
    const canopy = createToonMesh(canopyGeo, getToonMaterial(u % 2 === 0 ? 0xd43838 : 0x3878d4), { outline: 0.02 });
    canopy.position.y = 1.2;
    umbrella.add(canopy);

    umbrella.position.set(1.4 + u * 1.1, 0.25, 1.8 + (u % 2) * 0.6);
    group.add(umbrella);
  }

  return group;
}

// 4. Làng Chài Cửa Vạn (Cua Van Floating Fishing Village)
export function buildCuaVan(ctx: any): THREE.Group {
  const group = new THREE.Group();

  // Biển xanh
  const sea = new THREE.Mesh(
    new THREE.CircleGeometry(11, 28),
    getToonMaterial(WATER_EMERALD, { transparent: true, opacity: 0.82 })
  );
  sea.rotation.x = -Math.PI / 2;
  sea.position.y = 0.08;
  group.add(sea);

  const houses: THREE.Group[] = [];

  // 3 căn nhà bè nổi liên hoàn dập dềnh
  const houseColors = [0x3a728a, 0xba6a38, 0x3e8a5b];
  for (let i = 0; i < 3; i++) {
    const raftHouse = new THREE.Group();

    // Bè phao nổi (Raft base)
    const raft = box(3.2, 0.28, 2.6, 0x8a7250, 0.02);
    raft.position.y = 0.2;
    raftHouse.add(raft);

    // Thùng phuy nổi dưới bè
    for (const [bx, bz] of [
      [-1.2, -1.0],
      [1.2, -1.0],
      [-1.2, 1.0],
      [1.2, 1.0],
    ]) {
      const barrel = cyl(0.2, 0.2, 0.8, 6, 0x2e4858, 0.01);
      barrel.rotation.z = Math.PI / 2;
      barrel.position.set(bx, 0.05, bz);
      raftHouse.add(barrel);
    }

    // Nhà gỗ trên bè
    const hBody = box(2.4, 1.5, 1.8, houseColors[i]);
    hBody.position.y = 1.05;
    raftHouse.add(hBody);

    // Mái tôn ngói dốc
    const hRoofGeo = new THREE.ConeGeometry(2.1, 0.9, 4);
    hRoofGeo.rotateY(Math.PI / 4);
    hRoofGeo.scale(1, 1, 0.65);
    const hRoof = createToonMesh(hRoofGeo, getToonMaterial(0x9a3e2a), { outline: 0.03 });
    hRoof.position.y = 2.1;
    raftHouse.add(hRoof);

    // Lưới đánh cá phơi trên bè
    const net = box(0.8, 0.06, 0.6, 0x4a7a5a, 0.01);
    net.position.set(-1.0, 0.36, 0.6);
    raftHouse.add(net);

    raftHouse.position.set((i - 1) * 3.4, 0, (i % 2 === 0 ? 0.3 : -0.4));
    group.add(raftHouse);
    houses.push(raftHouse);
  }

  // Chiếc thuyền nan đan bằng tre (Sampan)
  const sampan = createWoodenBoat();
  sampan.position.set(2.4, 0.12, 2.5);
  sampan.rotation.y = 0.6;
  group.add(sampan);

  // Người làng chài chèo đò
  const fisherman = createNPC({
    outfitColor: 0x4a6572,
    skinColor: 0xffd8b8,
    action: 'sitting',
    hasHat: true,
    scale: 0.88,
  });
  fisherman.position.set(2.4, 0.22, 2.5);
  group.add(fisherman);

  // Animation bè nổi dập dềnh theo sóng
  let waveTime = 0;
  ctx.onUpdate = (dt: number) => {
    waveTime += dt * 2.0;
    houses.forEach((h, idx) => {
      h.position.y = Math.sin(waveTime + idx * 1.5) * 0.05;
      h.rotation.z = Math.cos(waveTime + idx * 1.5) * 0.02;
    });
  };

  return group;
}

// 5. Hang Đầu Gỗ (Wooden Stakes Cave)
export function buildDauGo(_ctx: any): THREE.Group {
  const group = new THREE.Group();

  // Vòm cửa hang đá karst uy nghi
  const rockArch = sphere(4.5, 7, KARST_STONE);
  rockArch.scale.set(1.3, 0.9, 0.8);
  rockArch.position.set(0, 3.2, -1.8);
  group.add(rockArch);

  // Bãi cát ven chân núi
  const sand = cyl(5.5, 5.8, 0.2, 16, SAND_BEACH, 0.015);
  sand.position.set(0, 0.1, 0);
  group.add(sand);

  // Các cọc gỗ lim lịch sử cắm xuống bãi cát ven cửa hang
  for (let s = 0; s < 10; s++) {
    const stake = cyl(0.08, 0.12, 1.4, 6, 0x4a321e, 0.015);
    const sx = (s % 5 - 2) * 0.85 + (Math.random() - 0.5) * 0.25;
    const sz = Math.floor(s / 5) * 0.9 + 1.2;
    stake.position.set(sx, 0.65, sz);
    stake.rotation.x = (Math.random() - 0.5) * 0.25;
    stake.rotation.z = (Math.random() - 0.5) * 0.25;
    group.add(stake);
  }

  return group;
}

// 6. Động Thiên Cung (Heavenly Palace Grotto)
export function buildThienCung(_ctx: any): THREE.Group {
  const group = new THREE.Group();

  // Khối hang động tráng lệ
  const dome = sphere(5.0, 8, 0x68645e);
  dome.scale.set(1.4, 0.9, 1.2);
  dome.position.set(0, 3.5, 0);
  group.add(dome);

  // Các cột thạch nhũ đồ sộ lung linh sắc màu (ngọc thạch, vàng hổ phách, xanh ngọc)
  const stalactiteColors = [0x5ebcb0, 0xd8a042, 0xa262b8, 0x4ea86a];
  for (let i = 0; i < 6; i++) {
    const colGeo = new THREE.CylinderGeometry(0.18, 0.35, 3.2, 6);
    const colMesh = createToonMesh(colGeo, getToonMaterial(stalactiteColors[i % stalactiteColors.length]), { outline: 0.025 });
    const ang = (i * Math.PI * 2) / 6;
    colMesh.position.set(Math.cos(ang) * 2.4, 1.8, Math.sin(ang) * 2.4);
    group.add(colMesh);
  }

  // Lối đi cầu gỗ lượn quanh các nhũ đá
  const path = cyl(3.2, 3.2, 0.12, 16, 0x7c5a38, 0.02);
  path.position.y = 0.2;
  group.add(path);

  return group;
}
