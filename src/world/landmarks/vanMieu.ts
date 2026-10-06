import * as THREE from 'three';
import { getToonMaterial, createToonMesh } from '../materials/toon';
import { createNPC } from '../props/life';

/**
 * Stage 3: Văn Miếu – Quốc Tử Giám (Temple of Literature)
 * - Cổng Văn Miếu Môn 3 lối
 * - Khuê Văn Các với cửa sổ mặt trời tròn đặc trưng
 * - Giếng Thiên Quang vuông thành sắc cạnh, hoa sen nổi
 * - Vườn bia Tiến sĩ cưỡi rùa đá
 * - Học sĩ / sinh viên áo dài & cây cổ thụ
 */

const STONE      = 0xb0a89a;
const DARK_STONE = 0x6e6860;
const ROOF       = 0xa04226;
const WOOD       = 0x583520;
const RED        = 0xb83226;
const GOLD       = 0xd4a032;
const WATER      = 0x3ea8a0;
const LEAF_DARK  = 0x3d7041;
const LEAF_MID   = 0x5f914c;

function box(w: number, h: number, d: number, color: number, outline = 0.032): THREE.Mesh {
  return createToonMesh(new THREE.BoxGeometry(w, h, d), getToonMaterial(color), { outline });
}

function cyl(rt: number, rb: number, h: number, seg: number, color: number, outline = 0.032): THREE.Mesh {
  return createToonMesh(new THREE.CylinderGeometry(rt, rb, h, seg), getToonMaterial(color), { outline });
}

function sphere(r: number, seg: number, color: number, outline = 0.032): THREE.Mesh {
  return createToonMesh(new THREE.SphereGeometry(r, seg, seg), getToonMaterial(color), { outline });
}

export function buildVanMieu(_ctx?: any): THREE.Group {
  const group = new THREE.Group();

  // === LỐI ĐI BỘ ĐÁ DẪN TỪ SPAWN VÀO KHUÔN VIÊN ===
  const stepMat = getToonMaterial(0x9e988e);
  for (let s = 0; s < 7; s++) {
    const pz = 4.4 + s * 0.7;
    const stepStone = createToonMesh(
      new THREE.CylinderGeometry(0.42, 0.46, 0.12, 8),
      stepMat,
      { outline: 0.015 }
    );
    stepStone.position.set(s % 2 === 0 ? 0.06 : -0.06, 0.04, pz);
    stepStone.rotation.y = s * 0.35;
    group.add(stepStone);
  }

  // === Cổng Văn Miếu Môn (3 cửa vòm trang nghiêm) ===
  const gate = new THREE.Group();

  // Móng cổng đá chìm sâu vào lòng đất âm Y
  const gateFound = box(6.8, 0.6, 1.2, DARK_STONE);
  gateFound.position.set(0, -0.22, -4.5);
  gate.add(gateFound);

  // 4 cột trụ chính hoa biểu
  for (const x of [-2.4, -0.9, 0.9, 2.4]) {
    const isInner = Math.abs(x) < 1.5;
    const colH = isInner ? 4.8 : 3.8;
    const col = box(0.42, colH, 0.45, STONE);
    col.position.set(x, colH / 2, -4.5);
    gate.add(col);

    // Đỉnh cột có nghê đá hoặc lồng đèn
    const cap = box(0.55, 0.25, 0.58, DARK_STONE);
    cap.position.set(x, colH + 0.12, -4.5);
    gate.add(cap);

    const finial = cyl(0.08, 0.16, 0.4, 6, GOLD, 0.015);
    finial.position.set(x, colH + 0.45, -4.5);
    gate.add(finial);
  }

  // Xà ngang & vòm cuốn
  const beamCenter = box(2.0, 0.35, 0.35, STONE);
  beamCenter.position.set(0, 3.8, -4.5);
  gate.add(beamCenter);

  const beamLeft = box(1.6, 0.3, 0.3, STONE);
  beamLeft.position.set(-1.65, 3.0, -4.5);
  gate.add(beamLeft);

  const beamRight = box(1.6, 0.3, 0.3, STONE);
  beamRight.position.set(1.65, 3.0, -4.5);
  gate.add(beamRight);

  // Mái ngói mũi hài cổng chính cong vút
  const centerRoof = box(2.6, 0.35, 1.2, ROOF);
  centerRoof.position.set(0, 4.35, -4.5);
  gate.add(centerRoof);

  const centerRidge = box(2.2, 0.2, 0.3, GOLD, 0.02);
  centerRidge.position.set(0, 4.6, -4.5);
  gate.add(centerRidge);

  // Mái cổng phụ hai bên
  for (const sx of [-1.65, 1.65]) {
    const sideRoof = box(1.8, 0.25, 0.9, ROOF);
    sideRoof.position.set(sx, 3.4, -4.5);
    gate.add(sideRoof);
  }

  // Biển chữ Hán "Văn Miếu Môn" sơn son thiếp vàng
  const plaque = box(1.2, 0.45, 0.1, RED, 0.02);
  plaque.position.set(0, 3.2, -4.3);
  gate.add(plaque);

  group.add(gate);

  // === Khuê Văn Các (Gác Sao Khuê biểu tượng Hà Nội) ===
  const khuVanCac = new THREE.Group();

  // Khối móng đá chìm sâu vào lòng đất âm Y
  const kvcFoundation = box(3.6, 0.6, 3.6, DARK_STONE);
  kvcFoundation.position.y = -0.22;
  khuVanCac.add(kvcFoundation);

  // Bệ móng đá 2 bậc vuông
  const baseStep1 = box(3.2, 0.22, 3.2, STONE);
  baseStep1.position.y = 0.11;
  khuVanCac.add(baseStep1);

  const baseStep2 = box(2.6, 0.24, 2.6, STONE);
  baseStep2.position.y = 0.34;
  khuVanCac.add(baseStep2);

  // 4 cột gạch vuông tầng dưới nâng đỡ tầng gác gỗ
  for (const [x, z] of [[-0.85, -0.85], [0.85, -0.85], [-0.85, 0.85], [0.85, 0.85]]) {
    const col = box(0.38, 2.4, 0.38, STONE);
    col.position.set(x, 1.66, z);
    khuVanCac.add(col);
  }

  // Sàn gác gỗ & lan can con tiện
  const woodenFloor = box(2.4, 0.15, 2.4, WOOD);
  woodenFloor.position.y = 2.94;
  khuVanCac.add(woodenFloor);

  // Lan can gỗ
  for (const [lx, lz, lw, ld] of [
    [0, 1.15, 2.4, 0.08],
    [0, -1.15, 2.4, 0.08],
    [1.15, 0, 0.08, 2.4],
    [-1.15, 0, 0.08, 2.4],
  ]) {
    const rail = box(lw, 0.35, ld, WOOD, 0.015);
    rail.position.set(lx, 3.18, lz);
    khuVanCac.add(rail);
  }

  // Tầng trên bằng gỗ sơn đỏ son
  const topChamber = box(1.7, 1.45, 1.7, RED);
  topChamber.position.y = 3.75;
  khuVanCac.add(topChamber);

  // Cửa tròn Khuê Văn Các (với nan gỗ tỏa như ánh sao Khuê trên cả 4 mặt)
  for (const rotY of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
    const windowGroup = new THREE.Group();
    const frame = cyl(0.38, 0.38, 0.08, 20, GOLD, 0.015);
    frame.rotation.x = Math.PI / 2;
    windowGroup.add(frame);

    const centerVoid = cyl(0.32, 0.32, 0.09, 16, 0x1b282c, 0);
    centerVoid.rotation.x = Math.PI / 2;
    windowGroup.add(centerVoid);

    for (let s = 0; s < 4; s++) {
      const spoke = box(0.68, 0.04, 0.1, GOLD, 0);
      spoke.rotation.z = (s * Math.PI) / 4;
      windowGroup.add(spoke);
    }
    windowGroup.position.set(0, 3.82, 0.88);
    windowGroup.rotation.y = rotY;
    if (rotY === Math.PI / 2) windowGroup.position.set(0.88, 3.82, 0);
    else if (rotY === Math.PI) windowGroup.position.set(0, 3.82, -0.88);
    else if (rotY === -Math.PI / 2) windowGroup.position.set(-0.88, 3.82, 0);

    khuVanCac.add(windowGroup);
  }

  // Mái chồng diêm 2 tầng 8 mái lợp ngói đỏ
  const lowerRoof = box(2.6, 0.28, 2.6, ROOF);
  lowerRoof.position.y = 4.58;
  khuVanCac.add(lowerRoof);

  const upperRoof = box(2.0, 0.35, 2.0, ROOF);
  upperRoof.position.y = 4.95;
  khuVanCac.add(upperRoof);

  const kvcTopPeak = createToonMesh(
    new THREE.ConeGeometry(1.2, 0.65, 4),
    getToonMaterial(ROOF),
    { outline: 0.03 }
  );
  kvcTopPeak.rotateY(Math.PI / 4);
  kvcTopPeak.position.y = 5.4;
  khuVanCac.add(kvcTopPeak);

  khuVanCac.position.set(0, 0.05, -1.2);
  group.add(khuVanCac);

  // === Giếng Thiên Quang (Hồ vuông đón ánh sáng trời) ===
  const wellGroup = new THREE.Group();

  const wellFound = box(3.8, 0.5, 3.8, DARK_STONE);
  wellFound.position.set(0, -0.2, 2.6);
  wellGroup.add(wellFound);

  const wellWater = new THREE.Mesh(
    new THREE.BoxGeometry(3.0, 0.08, 3.0),
    getToonMaterial(WATER, { transparent: true, opacity: 0.85 })
  );
  wellWater.position.set(0, 0.08, 2.6);
  wellGroup.add(wellWater);

  const borderThick = 0.25;
  const wellSize = 3.2;
  for (const [bx, bz, bw, bd] of [
    [0, 2.6 + wellSize / 2, wellSize + borderThick * 2, borderThick],
    [0, 2.6 - wellSize / 2, wellSize + borderThick * 2, borderThick],
    [wellSize / 2, 2.6, borderThick, wellSize],
    [-wellSize / 2, 2.6, borderThick, wellSize],
  ]) {
    const wall = box(bw, 0.3, bd, STONE);
    wall.position.set(bx, 0.18, bz);
    wellGroup.add(wall);
  }

  // Trụ đá góc chạm trổ
  for (const [dx, dz] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
    const post = cyl(0.1, 0.12, 0.5, 6, DARK_STONE);
    post.position.set(dx * (wellSize / 2 + 0.12), 0.32, 2.6 + dz * (wellSize / 2 + 0.12));
    wellGroup.add(post);
  }

  // Cụm hoa sen & lá sen nổi trên giếng
  const lilyMat = getToonMaterial(0x387342);
  for (const [lx, lz] of [[-0.8, 2.1], [0.7, 3.1], [-0.5, 3.3]]) {
    const pad = new THREE.Mesh(new THREE.CircleGeometry(0.28, 8), lilyMat);
    pad.rotation.x = -Math.PI / 2;
    pad.position.set(lx, 0.12, lz);
    wellGroup.add(pad);

    const bloom = sphere(0.09, 5, 0xf29cb3, 0.01);
    bloom.position.set(lx + 0.08, 0.18, lz + 0.06);
    wellGroup.add(bloom);
  }

  group.add(wellGroup);

  // === Vườn Bia Tiến Sĩ (82 tấm bia rùa đá 2 dãy bên giếng) ===
  for (let row = 0; row < 2; row++) {
    const rx = row === 0 ? -2.4 : 2.4;
    for (let i = 0; i < 4; i++) {
      const stele = new THREE.Group();

      const turtleBody = box(0.42, 0.14, 0.6, STONE, 0.02);
      turtleBody.position.y = 0.08;
      stele.add(turtleBody);

      const turtleHead = sphere(0.08, 5, DARK_STONE, 0.015);
      turtleHead.position.set(0, 0.14, 0.36);
      stele.add(turtleHead);

      const tablet = box(0.34, 0.85, 0.1, 0xc8bea8, 0.02);
      tablet.position.y = 0.55;
      stele.add(tablet);

      const tabletArch = cyl(0.17, 0.17, 0.1, 10, 0xc8bea8, 0.02);
      tabletArch.rotation.x = Math.PI / 2;
      tabletArch.position.y = 0.98;
      stele.add(tabletArch);

      const rz = (i - 1.5) * 0.9 + 2.6;
      stele.position.set(rx, 0, rz);
      stele.rotation.y = row === 0 ? Math.PI / 2 : -Math.PI / 2;
      group.add(stele);
    }
  }

  // === Cây cổ thụ bóng mát quanh sân (Cây đa / Cây muồng bách niên) ===
  for (const [tx, tz, s] of [
    [-3.8, -1.8, 1.2],
    [3.8, -1.8, 1.1],
    [-3.8, 4.2, 1.15],
    [3.8, 4.2, 1.25],
  ]) {
    const tree = new THREE.Group();

    const trunk = cyl(0.18 * s, 0.3 * s, 2.8 * s, 7, WOOD);
    trunk.position.y = 1.4 * s;
    tree.add(trunk);

    const c1 = sphere(1.3 * s, 6, LEAF_DARK);
    c1.position.y = 3.2 * s;
    tree.add(c1);

    const c2 = sphere(1.0 * s, 6, LEAF_MID);
    c2.position.set(0.6 * s, 3.6 * s, 0.3 * s);
    tree.add(c2);

    const c3 = sphere(0.9 * s, 5, 0x76a752);
    c3.position.set(-0.5 * s, 3.4 * s, -0.4 * s);
    tree.add(c3);

    tree.position.set(tx, 0, tz);
    group.add(tree);
  }

  // === NPCs: Các sĩ tử / sinh viên áo dài chụp ảnh tốt nghiệp ===
  const studentGirl = createNPC({
    outfitColor: 0xf5f5fa,
    skinColor: 0xffd8b8,
    hairColor: 0x1f1b18,
    action: 'walk',
    hasHat: false,
    scale: 0.92,
  });
  studentGirl.position.set(1.1, 0.08, 0.8);
  studentGirl.rotation.y = -Math.PI / 3;
  group.add(studentGirl);

  const studentBoy = createNPC({
    outfitColor: 0x9e2424,
    skinColor: 0xffd8b8,
    hairColor: 0x1a1a1a,
    action: 'idle',
    hasHat: false,
    scale: 0.95,
  });
  studentBoy.position.set(0.6, 0.08, 0.6);
  studentBoy.rotation.y = Math.PI / 4;
  group.add(studentBoy);

  const tourist = createNPC({
    outfitColor: 0x48929e,
    skinColor: 0xffd8b8,
    action: 'sitting',
    hasHat: true,
    scale: 0.9,
  });
  tourist.position.set(-1.8, 0.16, 1.2);
  tourist.rotation.y = Math.PI / 2;
  group.add(tourist);

  return group;
}
