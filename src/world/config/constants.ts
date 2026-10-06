export const PLANET_R = 28;
export const PLAYER_H = 1;            // đơn vị tham chiếu: nhân vật cao 1
export const WALK_SPEED = 3.0;        // đơn vị/giây
export const RUN_MULT = 1.6;
export const WATER_LEVEL = -0.35;     // tương đối so với R
export const OUTLINE_THICK = 0.045;   // dày hơn ~2x để rõ viền mực như daokyuc
export const POI_TITLE_R = 7;         // hiện tiêu đề lớn
export const POI_NEAR_R = 3.5;        // hiện "Xem ảnh [E]"
export const CAM = {
  // A wider authored establishing view makes each destination read as a
  // location before the player starts walking through it.
  walk: { fov: 50, dist: 7.6, pitch: 0.46, lift: 1.2, lookAhead: 3.0,
          minDist: 3.5, maxDist: 12, minPitch: 0.08, maxPitch: 0.9 },
  overview: { fov: 34, dist: 125 },
};
export const SUN_INTENSITY = 2.2;
