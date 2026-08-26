export type GameScreen = 'MENU' | 'PLAYING' | 'LEVEL_SELECT' | 'HIGH_SCORES' | 'SETTINGS' | 'HOW_TO_PLAY';

export type GameStatus = 'READY' | 'PLAYING' | 'BALL_LOST' | 'LEVEL_COMPLETE' | 'GAME_OVER' | 'PAUSED';

export type BrickType =
  | 'NORMAL_RED'
  | 'NORMAL_BLUE'
  | 'NORMAL_GREEN'
  | 'NORMAL_YELLOW'
  | 'NORMAL_ORANGE'
  | 'NORMAL_PURPLE'
  | 'NORMAL_CYAN'
  | 'NORMAL_WHITE'
  | 'HARD_2'
  | 'HARD_3'
  | 'METAL'
  | 'EXPLOSIVE'
  | 'BONUS'
  | 'REGENERATING'
  | 'GLASS';

export interface Brick {
  id: number;
  col: number;
  row: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: BrickType;
  hitsLeft: number;
  maxHits: number;
  points: number;
  isAlive: boolean;
  powerUpDrop?: PowerUpType;
  color: string;
  flashTimer?: number;
  shakeOffset?: { x: number; y: number };
}

export type PowerUpType =
  | 'BIGGER_PADDLE'
  | 'SMALLER_PADDLE'
  | 'MULTI_BALL'
  | 'FIRE_BALL'
  | 'POWER_BALL'
  | 'SLOW_BALL'
  | 'FAST_BALL'
  | 'EXTRA_LIFE'
  | 'MAGNET_PADDLE'
  | 'LASER_PADDLE'
  | 'BOMB'
  | 'SAFETY_FLOOR'
  | 'SCORE_BONUS';

export interface PowerUp {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  vy: number;
  type: PowerUpType;
  color: string;
  iconText: string;
  isAlive: boolean;
}

export interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  speed: number;
  baseSpeed: number;
  isStuckToPaddle: boolean;
  stuckOffset: number; // offset from paddle center
  isFireBall: boolean;
  isPowerBall: boolean;
  trail: Array<{ x: number; y: number; alpha: number }>;
}

export interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  baseWidth: number;
  targetX: number;
  speed: number;
  hasLaser: boolean;
  hasMagnet: boolean;
  color: string;
}

export interface LaserBolt {
  id: number;
  x: number;
  y: number;
  vy: number;
  width: number;
  height: number;
  isAlive: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  type?: 'SPARK' | 'SMOKE' | 'SHARD' | 'FIRE' | 'STAR';
}

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  vy: number;
  alpha: number;
  color: string;
  scale: number;
}

export interface ActivePowerUp {
  type: PowerUpType;
  timeRemaining: number; // in seconds
  maxDuration: number;
}

export interface LevelDefinition {
  id: number;
  name: string;
  theme: string;
  bgColor: string;
  bgPattern?: 'STARS' | 'GRID' | 'CIRCUIT' | 'NEBULA' | 'STRIPES';
  grid: (number | string)[][]; // 2D array of brick codes (0 = empty, 1-9 or code strings)
}

export interface HighScoreEntry {
  id: string;
  name: string;
  score: number;
  levelReached: number;
  date: string;
}

export interface GameSettings {
  musicEnabled: boolean;
  sfxEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
  vibrationEnabled: boolean;
  crtFilter: boolean;
  screenShake: boolean;
  touchSensitivity: number; // 0.5 to 2.0
}

export interface GameStats {
  totalScore: number;
  totalBricksDestroyed: number;
  totalPowerUpsCollected: number;
  totalGamesPlayed: number;
  levelsUnlocked: number;
  highestLevelCompleted: number;
  bestCombo: number;
}
