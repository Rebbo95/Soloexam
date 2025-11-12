// src/types.ts
export type ClassId = string;

export interface PlayerStats {
  //not implemented
  maxHp: number;
  hp: number;
  level: number;
  xp: number;
  
  //implemented
  damage: number;
  speed: number;

 
}

export interface Player {
    name: string;
    classId: ClassId;
    stats: PlayerStats;
    x: number;
    y: number;
    spells?: Spell[];
}
export interface Spell {
  id: string;
  name: string;
  description: string;

  damage?: number;
}
export interface Enemy {
  id: string;
  name: string;
  maxHp: number;
  hp: number;
  damage: number;
  speed: number;
  x: number;
  y: number;
  xpReward: number;
}


export interface DamagePopup {
  x: number;
  y: number;
  text: string;
  life: number;
  alpha: number;
  vy: number;
  color?: string;
}

export interface RunSummary {
  timestamp: number;
  levelReached: number;
  xpEarned: number;
  enemiesDefeated: number;
  durationMs: number;
}

export interface SavedData {
  bestRun?: RunSummary;
  lastClass?: ClassId;
  muted?: boolean;
}
