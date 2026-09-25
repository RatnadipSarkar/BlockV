export type GameMode = 'classic' | 'zen' | 'time_attack' | 'blitz' | 'daily' | 'boss';

export type SpecialCellType = 'normal' | 'bomb' | 'lightning' | 'rainbow' | 'ice' | 'stone' | 'multiplier';

export interface BoardCell {
  filled: boolean;
  color?: string;
  type?: SpecialCellType;
  hitsNeeded?: number; // for ice (takes 2 clears) or stone
  isClearing?: boolean;
  multiplier?: number;
}

export type ShapeMatrix = number[][];

export interface Piece {
  id: string;
  shape: ShapeMatrix;
  color: string;
  colorKey: string;
  specialType?: SpecialCellType;
  rotation: number;
}

export type PowerupType = 'hammer' | 'bomb' | 'lightning' | 'shuffle';

export interface PowerupInventory {
  hammer: number;
  bomb: number;
  lightning: number;
  shuffle: number;
}

export interface FloatingNotification {
  id: string;
  text: string;
  subtext?: string;
  x?: number;
  y?: number;
  color?: string;
  type: 'score' | 'combo' | 'mega' | 'perfect' | 'level';
}

export interface GameSettings {
  soundVolume: number;
  musicVolume: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
  hapticsEnabled: boolean;
  screenShake: boolean;
  reducedMotion: boolean;
  colorBlindMode: boolean;
  highContrast: boolean;
  themeId: string;
}

export interface PlayerStats {
  gamesPlayed: number;
  totalScore: number;
  bestScore: number;
  bestScoreByMode: Record<GameMode, number>;
  totalLinesCleared: number;
  maxCombo: number;
  perfectClears: number;
  blocksPlaced: number;
  powerupsUsed: number;
  currentStreak: number;
  lastPlayedDate: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  rewardXp: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  completed: boolean;
  claimed: boolean;
  rewardXp: number;
  rewardCoins: number;
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  score: number;
  mode: GameMode;
  lines: number;
  maxCombo: number;
  date: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  accent: string;
  accentGlow: string;
  secondary: string;
  bgGradient: string;
  boardBg: string;
  gridLine: string;
  unlockLevel: number;
  isUnlocked?: boolean;
}
