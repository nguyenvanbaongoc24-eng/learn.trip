import * as THREE from 'three';

export interface FactDef {
  text: string;
  source: string;
}

export interface StageDef {
  id: string;
  index: number;
  name: { vi: string; en: string };
  subtitle: { vi: string; en: string };
  dir: [number, number]; // lat, lon
  spawnOffset?: { bearing: number; dist: number };
  interactAt?: { bearing: number; dist: number };
  flatR: number;
  ground: 'lawn' | 'paved' | 'sand' | 'terrace';
  build: (ctx: any) => THREE.Group;
  photos: string[];
  facts?: FactDef[];
  checkinXp?: number;
}

export interface WaterDef {
  type: 'lake' | 'river' | 'ocean';
  dir: [number, number];
  radius: number;
  depth: number;
}

export interface TerrainParams {
  amp: number;
  freq: number;
  type: 'hills' | 'mountains' | 'flat' | 'islands';
}

export interface DestinationDef {
  id: string;
  name: { vi: string; en: string };
  blurb?: { vi: string; en: string };
  locationLine?: { vi: string; en: string };
  seed: number;
  palette: any; // We'll keep it any for now or reuse C
  sky: { top: string; bottom: string; fog: string; fogDensity: number };
  terrain: TerrainParams;
  waters: WaterDef[];
  paths: [number, number][][];
  stages: StageDef[];
}
