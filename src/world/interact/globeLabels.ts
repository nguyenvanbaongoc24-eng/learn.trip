import * as THREE from 'three';
import { PLANET_R, OUTLINE_THICK } from '../config/constants';
import { StageDef } from '../config/destinations';
import { dirFromLatLon } from '../interact/poiManager';

// ── POI Labels visible on the globe in overview mode (mục 3.5) ──
// Pill-shaped "[number] Tên" labels, green if checked-in.
// Hidden on backside (horizon test). Clickable → fly to.

const LABEL_OFFSET = 3.2; // height above planet surface
const LABEL_SCALE = 0.016; // scale factor for canvas → world
const PILL_H = 48; // canvas height
const FONT_SIZE = 28;
const PILL_PADDING = 24;

export interface GlobeLabelHandle {
  group: THREE.Group;
  dir: THREE.Vector3;
  stageId: string;
  stage: StageDef;
  sprite: THREE.Sprite;
}

function createLabelTexture(index: number, name: string, checked: boolean): THREE.Texture {
  const text = `${index}  ${name}`;
  
  // Measure text
  const measureCanvas = document.createElement('canvas');
  const measureCtx = measureCanvas.getContext('2d')!;
  measureCtx.font = `bold ${FONT_SIZE}px Nunito, sans-serif`;
  const textWidth = measureCtx.measureText(text).width;
  
  const w = Math.ceil(textWidth + PILL_PADDING * 2 + 8);
  const h = PILL_H;
  
  const canvas = document.createElement('canvas');
  canvas.width = w * 2; // 2x for retina
  canvas.height = h * 2;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(2, 2);
  
  const r = h / 2; // pill radius
  
  // Background pill
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(w - r, 0);
  ctx.arc(w - r, r, r, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(r, h);
  ctx.arc(r, r, r, Math.PI / 2, -Math.PI / 2);
  ctx.closePath();
  
  ctx.fillStyle = checked ? '#2d8a5e' : '#f4f1ea';
  ctx.fill();
  ctx.strokeStyle = '#1d3538';
  ctx.lineWidth = 3;
  ctx.stroke();
  
  // Text
  ctx.font = `900 ${FONT_SIZE}px Nunito, sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillStyle = checked ? '#ffffff' : '#1d3538';
  ctx.fillText(text, PILL_PADDING, h / 2 + 1);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  
  // Store dimensions for sprite aspect ratio
  (texture as any)._pillWidth = w;
  (texture as any)._pillHeight = h;
  
  return texture;
}

export function createGlobeLabels(
  stages: StageDef[],
  checkedInIds: Set<string>
): GlobeLabelHandle[] {
  const handles: GlobeLabelHandle[] = [];
  
  for (const stage of stages) {
    const dir = dirFromLatLon(stage.dir[0], stage.dir[1]);
    const checked = checkedInIds.has(stage.id);
    
    const texture = createLabelTexture(stage.index, stage.name.vi, checked);
    const pillW = (texture as any)._pillWidth || 200;
    const pillH = (texture as any)._pillHeight || PILL_H;
    
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
      sizeAttenuation: true,
    });
    
    const sprite = new THREE.Sprite(spriteMat);
    const aspect = pillW / pillH;
    sprite.scale.set(aspect * PILL_H * LABEL_SCALE, PILL_H * LABEL_SCALE, 1);
    
    // Position above the planet surface
    const pos = dir.clone().multiplyScalar(PLANET_R + LABEL_OFFSET);
    
    const group = new THREE.Group();
    group.position.copy(pos);
    group.add(sprite);
    
    handles.push({ group, dir, stageId: stage.id, stage, sprite });
  }
  
  return handles;
}

/** Update label visibility: hide labels on the back side of the planet */
export function updateGlobeLabels(
  handles: GlobeLabelHandle[],
  cameraPos: THREE.Vector3,
  visible: boolean
) {
  for (const h of handles) {
    if (!visible) {
      h.group.visible = false;
      continue;
    }
    
    // Horizon test: dot product of label direction with camera direction
    const camDir = _cameraDirection.copy(cameraPos).normalize();
    const dot = h.dir.dot(camDir);
    
    // Show only labels facing the camera (front hemisphere)
    h.group.visible = dot > -0.1;
    
    // Fade slightly based on angle
    if (h.group.visible) {
      const opacity = THREE.MathUtils.smoothstep(dot, -0.1, 0.3);
      (h.sprite.material as THREE.SpriteMaterial).opacity = opacity;
    }
    
    // Billboard: sprite auto-faces camera, but we want it slightly "standing up"
    h.group.lookAt(cameraPos);
    h.sprite.visible = false;
  }
}

const _cameraDirection = new THREE.Vector3();

/** Refresh the small number of overview labels after a check-in, without rebuilding the world. */
export function updateGlobeLabelCheckIns(handles: GlobeLabelHandle[], checkedInIds: Set<string>) {
  for (const handle of handles) {
    const material = handle.sprite.material as THREE.SpriteMaterial;
    const previousMap = material.map;
    const nextMap = createLabelTexture(handle.stage.index, handle.stage.name.vi, checkedInIds.has(handle.stageId));
    const width = (nextMap as THREE.Texture & { _pillWidth?: number })._pillWidth || 200;
    const height = (nextMap as THREE.Texture & { _pillHeight?: number })._pillHeight || PILL_H;

    material.map = nextMap;
    handle.sprite.scale.set((width / height) * PILL_H * LABEL_SCALE, PILL_H * LABEL_SCALE, 1);
    previousMap?.dispose();
    material.needsUpdate = true;
  }
}
