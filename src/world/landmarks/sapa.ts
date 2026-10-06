import * as THREE from 'three';
import { getToonMaterial, createToonMesh } from '../materials/toon';
import { createNPC } from '../props/life';

/**
 * Sa Pa Destination Stages:
 * 1. buildNhaThoDa (Nhà thờ đá cổ Sa Pa)
 * 2. buildCatCat (Bản Cát Cát - Nhà gỗ H'Mông & Cối xay nước suối)
 * 3. buildMuongHoa (Thung lũng Mường Hoa - Ruộng bậc thang lúa chín & Bãi đá cổ)
 * 4. buildThacBac (Thác Bạc - Dòng thác trắng xoá & Cầu treo)
 * 5. buildCongTroi (Cổng Trời Ô Quy Hồ - Biển mây bồng bềnh)
 * 6. buildFansipan (Đỉnh Fansipan 3.143m - Chóp kim loại & Cáp treo)
 */

const STONE_GREY   = 0x8e8a82;
const ROOF_DARK    = 0x4a423d;
const WOOD_DARK    = 0x4f3622;
const WOOD_BAMBOO  = 0x8a6a42;
const THATCH_GOLD  = 0xd9b35b;
const RICE_GOLD    = 0xe5c242;
const RICE_GREEN   = 0x6ca33b;
const WATER_MOUNTAIN=0x389ea8;
const HILIGHT_GOLD = 0xdca832;

function box(w: number, h: number, d: number, color: number, outline = 0.032): THREE.Mesh {
  return createToonMesh(new THREE.BoxGeometry(w, h, d), getToonMaterial(color), { outline });
}

function cyl(rt: number, rb: number, h: number, seg: number, color: number, outline = 0.032): THREE.Mesh {
  return createToonMesh(new THREE.CylinderGeometry(rt, rb, h, seg), getToonMaterial(color), { outline });
}

function sphere(r: number, seg: number, color: number, outline = 0.032): THREE.Mesh {
  return createToonMesh(new THREE.SphereGeometry(r, seg, seg), getToonMaterial(color), { outline });
}

// 1. Nhà thờ đá Sa Pa (Notre Dame Cathedral Sa Pa)
export function buildNhaThoDa(_ctx: any): THREE.Group {
  const group = new THREE.Group();

  // Nền sân đá quảng trường trung tâm Sa Pa
  const plaza = cyl(6.5, 6.8, 0.14, 24, 0x9a958e, 0.02);
  plaza.position.y = 0.07;
  group.add(plaza);

  const church = new THREE.Group();

  // Gian giáo đường chính (Main hall)
  const hall = box(4.4, 3.4, 6.8, STONE_GREY);
  hall.position.set(0, 1.7, -1.2);
  church.add(hall);

  // Mái ngói dốc Gothic
  const roofGeo = new THREE.ConeGeometry(3.6, 2.2, 4);
  roofGeo.rotateY(Math.PI / 4);
  roofGeo.scale(1, 1, 1.6);
  const roof = createToonMesh(roofGeo, getToonMaterial(ROOF_DARK), { outline: 0.035 });
  roof.position.set(0, 4.4, -1.2);
  church.add(roof);

  // Tháp chuông vươn cao phía trước (Bell tower)
  const tower = box(2.6, 7.8, 2.6, STONE_GREY);
  tower.position.set(0, 3.9, 3.2);
  church.add(tower);

  // Đỉnh tháp chuông nhọn hình chóp vút cao
  const towerRoofGeo = new THREE.ConeGeometry(2.1, 3.4, 4);
  towerRoofGeo.rotateY(Math.PI / 4);
  const towerRoof = createToonMesh(towerRoofGeo, getToonMaterial(ROOF_DARK), { outline: 0.035 });
  towerRoof.position.set(0, 9.4, 3.2);
  church.add(towerRoof);

  // Cây thánh giá trên đỉnh tháp
  const cross = box(0.12, 0.9, 0.12, 0xdedede, 0.015);
  cross.position.set(0, 11.4, 3.2);
  church.add(cross);
  const crossBar = box(0.6, 0.12, 0.12, 0xdedede, 0.015);
  crossBar.position.set(0, 11.55, 3.2);
  church.add(crossBar);

  // Cửa sổ hoa hồng tròn (Rose window)
  const roseWin = cyl(0.65, 0.65, 0.15, 16, 0x22363d, 0.02);
  roseWin.rotation.x = Math.PI / 2;
  roseWin.position.set(0, 5.2, 4.5);
  church.add(roseWin);

  // Cửa vòm đá chính bước vào nhà thờ
  const portal = box(1.3, 2.2, 0.2, 0x3d281a, 0.02);
  portal.position.set(0, 1.1, 4.5);
  church.add(portal);

  church.position.set(0, 0, 0);
  group.add(church);

  // Cây sa mộc / thông gai đặc trưng Sa Pa quanh sân
  for (const [tx, tz, s] of [
    [-3.8, 2.5, 1.1],
    [3.8, 2.5, 1.2],
    [-3.6, -3.2, 1.3],
    [3.6, -3.2, 1.0],
  ]) {
    const pine = new THREE.Group();
    const trunk = cyl(0.12 * s, 0.18 * s, 1.6 * s, 6, WOOD_DARK);
    trunk.position.y = 0.8 * s;
    pine.add(trunk);

    for (let l = 0; l < 3; l++) {
      const coneF = createToonMesh(
        new THREE.ConeGeometry((1.3 - l * 0.3) * s, 1.5 * s, 7),
        getToonMaterial(0x2a5c32),
        { outline: 0.03 }
      );
      coneF.position.y = (1.5 + l * 0.9) * s;
      pine.add(coneF);
    }

    pine.position.set(tx, 0.1, tz);
    group.add(pine);
  }

  // Chibi cô gái dân tộc H'Mông xòe váy hoa thổ cẩm
  const hmongGirl = createNPC({
    outfitColor: 0x2e428c, // Váy thổ cẩm chàm xanh
    skinColor: 0xffd8b8,
    hairColor: 0x111111,
    action: 'idle',
    hasHat: false,
    scale: 0.9,
  });
  hmongGirl.position.set(1.5, 0.14, 2.5);
  hmongGirl.rotation.y = -Math.PI / 4;
  group.add(hmongGirl);

  return group;
}

// 2. Bản Cát Cát (Cat Cat Village)
export function buildCatCat(ctx: any): THREE.Group {
  const group = new THREE.Group();

  // Nền đất đồi thung lũng đá cuội
  const terrain = box(14, 0.16, 12, 0x6e8a4a, 0.02);
  terrain.position.y = 0.08;
  group.add(terrain);

  // Dòng suối Mường Hoa nước trong veo chảy qua bản
  const stream = box(3.2, 0.12, 12, WATER_MOUNTAIN, 0);
  stream.position.set(2.8, 0.1, 0);
  group.add(stream);

  // Nhà gỗ Pơ-mu truyền thống người H'Mông
  for (let h = 0; h < 2; h++) {
    const house = new THREE.Group();
    const hBody = box(3.4, 2.0, 2.4, WOOD_DARK);
    hBody.position.y = 1.0;
    house.add(hBody);

    // Mái ngói lợp bằng ván gỗ Pơ mu xám mốc
    const hRoofGeo = new THREE.ConeGeometry(2.8, 1.4, 4);
    hRoofGeo.rotateY(Math.PI / 4);
    hRoofGeo.scale(1, 1, 0.7);
    const hRoof = createToonMesh(hRoofGeo, getToonMaterial(THATCH_GOLD), { outline: 0.035 });
    hRoof.position.y = 2.6;
    house.add(hRoof);

    // Cửa liếp gỗ
    const door = box(0.8, 1.4, 0.08, 0x2b1c12, 0.015);
    door.position.set(0, 0.7, 1.22);
    house.add(door);

    if (h === 0) {
      house.position.set(-2.4, 0.16, -1.8);
      house.rotation.y = 0.2;
    } else {
      house.position.set(-1.8, 0.16, 2.5);
      house.rotation.y = -0.3;
    }
    group.add(house);
  }

  // Cối giã gạo bằng sức nước & cối xay nước khổng lồ bằng tre (Water Wheel)
  const wheelGroup = new THREE.Group();
  const rimOuter = cyl(1.8, 1.8, 0.12, 16, WOOD_BAMBOO, 0.025);
  rimOuter.rotation.x = Math.PI / 2;
  wheelGroup.add(rimOuter);

  // Trục & các nan hoa tre
  for (let s = 0; s < 8; s++) {
    const spoke = box(0.12, 3.4, 0.1, WOOD_BAMBOO, 0.015);
    spoke.rotation.z = (s * Math.PI) / 8;
    wheelGroup.add(spoke);
  }

  // Các ống tre múc nước gắn quanh vành bánh xe
  for (let b = 0; b < 8; b++) {
    const scoop = cyl(0.1, 0.1, 0.45, 6, WOOD_BAMBOO, 0.015);
    const ang = (b * Math.PI * 2) / 8;
    scoop.position.set(Math.cos(ang) * 1.6, Math.sin(ang) * 1.6, 0);
    scoop.rotation.z = ang + 0.4;
    wheelGroup.add(scoop);
  }

  // Trụ đỡ cối xay nước cắm xuống suối
  for (const pz of [-0.35, 0.35]) {
    const postA = box(0.18, 2.4, 0.18, WOOD_DARK);
    postA.position.set(2.8, 1.1, pz);
    group.add(postA);
  }

  wheelGroup.position.set(2.8, 1.4, 0);
  group.add(wheelGroup);

  // Cầu tre bắc qua suối
  const bridge = box(1.0, 0.15, 3.6, WOOD_BAMBOO);
  bridge.position.set(2.8, 0.5, 3.5);
  bridge.rotation.y = Math.PI / 2;
  group.add(bridge);

  // NPC H'Mông dắt ngựa trên cầu
  const hmongBoy = createNPC({
    outfitColor: 0x943224, // Áo thổ cẩm đỏ
    skinColor: 0xffd8b8,
    hairColor: 0x111111,
    action: 'walk',
    hasHat: false,
    scale: 0.9,
  });
  hmongBoy.position.set(2.8, 0.58, 3.2);
  group.add(hmongBoy);

  // Animation quay cối xay nước
  ctx.onUpdate = (dt: number) => {
    wheelGroup.rotation.z -= dt * 0.6;
  };

  return group;
}

// 3. Thung lũng Mường Hoa (Muong Hoa Terraced Rice Valley)
export function buildMuongHoa(_ctx: any): THREE.Group {
  const group = new THREE.Group();

  // Các bậc ruộng bậc thang uốn lượn tầng tầng lớp lớp vàng óng
  const terraceSteps = 5;
  for (let t = 0; t < terraceSteps; t++) {
    const radius = 6.8 - t * 0.9;
    const terrace = cyl(radius, radius + 0.3, 0.35, 20, t % 2 === 0 ? RICE_GOLD : 0xd8b532, 0.02);
    terrace.position.set(0, t * 0.3, 0);
    group.add(terrace);

    // Mép bờ ruộng đắp đất
    const rim = cyl(radius + 0.08, radius + 0.15, 0.38, 20, 0x6e5a38, 0.015);
    rim.position.set(0, t * 0.3 + 0.02, 0);
    group.add(rim);
  }

  // Bãi đá cổ Sa Pa khắc các hình vẽ tiền sử bí ẩn
  const ancientRock = sphere(1.2, 6, STONE_GREY, 0.03);
  ancientRock.scale.set(1.4, 0.7, 1.1);
  ancientRock.position.set(-1.8, 1.6, 0.5);
  ancientRock.rotation.set(0.2, 0.4, -0.1);
  group.add(ancientRock);

  // Hoa tam giác mạch hồng phấn nở ven sườn đồi
  for (let f = 0; f < 8; f++) {
    const flower = sphere(0.16, 5, 0xefa2ba, 0.01);
    const ang = (f * Math.PI * 2) / 8;
    flower.position.set(Math.cos(ang) * 3.8, 0.9, Math.sin(ang) * 3.8);
    group.add(flower);
  }

  // Chòi canh lúa nhỏ trên nương
  const hut = new THREE.Group();
  for (const [hx, hz] of [[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]]) {
    const post = box(0.08, 1.2, 0.08, WOOD_DARK);
    post.position.set(hx, 0.6, hz);
    hut.add(post);
  }
  const hutRoof = box(1.3, 0.15, 1.3, THATCH_GOLD);
  hutRoof.position.y = 1.25;
  hut.add(hutRoof);
  hut.position.set(2.2, 1.5, -1.2);
  group.add(hut);

  return group;
}

// 4. Thác Bạc (Silver Waterfall)
export function buildThacBac(ctx: any): THREE.Group {
  const group = new THREE.Group();

  // Vách núi đá dựng đứng
  for (let r = 0; r < 7; r++) {
    const rock = box(3.2 + (r % 2) * 1.0, 1.8, 2.5, STONE_GREY);
    rock.position.set((Math.sin(r * 2) - 0.5) * 1.5, r * 1.2 + 0.9, -2.5);
    group.add(rock);
  }

  // Dòng thác nước bạc đổ ào ạt từ đỉnh núi xuống
  const fallGeo = new THREE.PlaneGeometry(2.4, 8.5, 6, 12);
  const fallMat = getToonMaterial(0xf4f9fb, { transparent: true, opacity: 0.88, side: THREE.DoubleSide });
  const fallMesh = new THREE.Mesh(fallGeo, fallMat);
  fallMesh.position.set(0, 4.4, -1.2);
  fallMesh.rotation.x = -0.15;
  group.add(fallMesh);

  // Bọt nước trắng xóa cuộn trào chân thác
  const foamGroup = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const puff = sphere(0.45 + i * 0.08, 6, 0xffffff, 0);
    puff.position.set((i - 2.5) * 0.55, 0.25, -0.6);
    foamGroup.add(puff);
  }
  group.add(foamGroup);

  // Cầu treo ngắm thác vắt ngang
  const bridge = box(5.5, 0.1, 0.8, WOOD_DARK, 0.02);
  bridge.position.set(0, 1.4, 0.8);
  group.add(bridge);

  // Lan can dây cáp cầu treo
  for (const sz of [0.45, 1.15]) {
    const cable = box(5.5, 0.04, 0.04, 0x333333, 0);
    cable.position.set(0, 2.0, sz);
    group.add(cable);
  }

  // Du khách đứng trên cầu chụp ảnh thác
  const tourist = createNPC({
    outfitColor: 0xcc3333,
    skinColor: 0xffd8b8,
    action: 'idle',
    hasHat: false,
    scale: 0.88,
  });
  tourist.position.set(0, 1.45, 0.8);
  tourist.rotation.y = Math.PI;
  group.add(tourist);

  // Animation dòng thác cuộn chảy
  let fallTime = 0;
  ctx.onUpdate = (dt: number) => {
    fallTime += dt * 6.0;
    const pos = fallGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const wave = Math.sin(fallTime + y * 2.0) * 0.12;
      pos.setZ(i, wave);
    }
    pos.needsUpdate = true;
  };

  return group;
}

// 5. Cổng Trời Đèo Ô Quy Hồ (Heaven's Gate / O Quy Ho Pass)
export function buildCongTroi(ctx: any): THREE.Group {
  const group = new THREE.Group();

  // Vọng cảnh đài trên đỉnh đèo lộng gió
  const platform = cyl(5.5, 5.8, 0.25, 20, STONE_GREY, 0.02);
  platform.position.y = 0.12;
  group.add(platform);

  // Lan can đá bảo vệ bờ vực
  for (let i = 0; i < 12; i++) {
    const ang = (i / 11) * Math.PI;
    const post = box(0.2, 0.8, 0.2, STONE_GREY, 0.015);
    post.position.set(Math.cos(ang) * 5.0, 0.5, Math.sin(ang) * 5.0);
    group.add(post);
  }

  // Cổng vòm đá hùng vĩ "CỔNG TRỜI Ô QUY HỒ"
  const gateLeft = box(0.8, 4.8, 0.8, STONE_GREY);
  gateLeft.position.set(-2.2, 2.4, 0);
  group.add(gateLeft);

  const gateRight = box(0.8, 4.8, 0.8, STONE_GREY);
  gateRight.position.set(2.2, 2.4, 0);
  group.add(gateRight);

  const gateArch = box(5.4, 0.9, 1.1, STONE_GREY);
  gateArch.position.set(0, 4.8, 0);
  group.add(gateArch);

  // Biển chữ vàng "CỔNG TRỜI"
  const sign = box(2.4, 0.6, 0.15, 0xa83226, 0.015);
  sign.position.set(0, 4.8, 0.6);
  group.add(sign);

  // Biển mây trắng bồng bềnh dưới chân đèo (Cloud sea)
  const clouds: THREE.Mesh[] = [];
  for (let c = 0; c < 8; c++) {
    const cloud = sphere(1.6 + (c % 3) * 0.4, 6, 0xf0f7f8, 0);
    cloud.scale.set(1.6, 0.6, 1.2);
    cloud.position.set((c - 3.5) * 2.2, -0.6, 3.5 + (c % 2) * 1.5);
    group.add(cloud);
    clouds.push(cloud);
  }

  let cloudTime = 0;
  ctx.onUpdate = (dt: number) => {
    cloudTime += dt;
    clouds.forEach((cl, idx) => {
      cl.position.y = -0.6 + Math.sin(cloudTime * 0.8 + idx) * 0.15;
    });
  };

  return group;
}

// 6. Đỉnh Fansipan 3.143m – Nóc nhà Đông Dương (Fansipan Peak)
export function buildFansipan(ctx: any): THREE.Group {
  const group = new THREE.Group();

  // Bệ đá đỉnh núi Fansipan lởm chởm hùng vĩ
  const summit = cyl(3.8, 4.5, 1.2, 8, STONE_GREY, 0.03);
  summit.position.y = 0.6;
  group.add(summit);

  // Chóp kim loại mạ inox sáng loáng 3.143M FANSIPAN
  const peakGeo = new THREE.ConeGeometry(0.85, 1.8, 3);
  peakGeo.rotateY(Math.PI / 4);
  const peakMat = getToonMaterial(0xe8ecef);
  const peakMesh = createToonMesh(peakGeo, peakMat, { outline: 0.035 });
  peakMesh.position.y = 2.1;
  group.add(peakMesh);

  // Cột cờ Tổ quốc trên đỉnh Fansipan
  const flagPole = cyl(0.05, 0.06, 4.5, 6, 0xdddddd, 0.015);
  flagPole.position.set(-1.8, 3.25, 0);
  group.add(flagPole);

  const flag = box(1.2, 0.75, 0.04, 0xd42828, 0.015);
  flag.position.set(-1.2, 4.8, 0);
  group.add(flag);

  // Cabin cáp treo Fansipan lơ lửng trên không
  const cableCar = new THREE.Group();
  const carBody = box(1.8, 1.4, 1.2, 0xd88a28); // Màu cam nổi bật
  carBody.position.y = 0;
  cableCar.add(carBody);

  // Dây cáp treo
  const arm = cyl(0.04, 0.04, 1.2, 6, 0x333333, 0.01);
  arm.position.y = 1.1;
  cableCar.add(arm);

  cableCar.position.set(3.5, 4.8, 2.0);
  group.add(cableCar);

  // Vận động viên leo núi mừng rỡ chạm tay vào chóp
  const climber = createNPC({
    outfitColor: 0x2868a8,
    skinColor: 0xffd8b8,
    hairColor: 0x111111,
    action: 'idle',
    hasHat: false,
    scale: 0.9,
  });
  climber.position.set(0.6, 1.2, 0.6);
  climber.rotation.y = -Math.PI / 4;
  group.add(climber);

  return group;
}
