import { GameSettings, GameStats, HighScoreEntry } from '../types';

const SETTINGS_KEY = 'brickstorm_settings';
const HIGHSCORES_KEY = 'brickstorm_highscores';
const STATS_KEY = 'brickstorm_stats';
const LEVEL_PROGRESS_KEY = 'brickstorm_levels';

export const DEFAULT_SETTINGS: GameSettings = {
  musicEnabled: true,
  sfxEnabled: true,
  musicVolume: 0.5,
  sfxVolume: 0.8,
  vibrationEnabled: true,
  crtFilter: false,
  screenShake: true,
  touchSensitivity: 1.0,
};

export const DEFAULT_HIGHSCORES: HighScoreEntry[] = [
  { id: '1', name: 'RETRO_KING', score: 154200, levelReached: 10, date: '1999-10-15' },
  { id: '2', name: 'CYBER_ACE', score: 122800, levelReached: 10, date: '2000-02-14' },
  { id: '3', name: 'BALL_MASTER', score: 98500, levelReached: 9, date: '2000-05-20' },
  { id: '4', name: 'NEO_BREAKER', score: 81400, levelReached: 8, date: '2001-01-09' },
  { id: '5', name: 'PIXEL_WARRIOR', score: 67300, levelReached: 7, date: '2001-08-30' },
  { id: '6', name: 'ARCADE_99', score: 54100, levelReached: 6, date: '2002-03-11' },
  { id: '7', name: 'PADDLE_PRO', score: 42000, levelReached: 5, date: '2002-07-04' },
  { id: '8', name: 'SHAREWARE_BOY', score: 33500, levelReached: 4, date: '2003-01-19' },
  { id: '9', name: 'VORTEX', score: 25000, levelReached: 3, date: '2003-06-22' },
  { id: '10', name: 'ROOKIE', score: 10000, levelReached: 2, date: '2004-11-01' },
];

export const DEFAULT_STATS: GameStats = {
  totalScore: 0,
  totalBricksDestroyed: 0,
  totalPowerUpsCollected: 0,
  totalGamesPlayed: 0,
  levelsUnlocked: 1,
  highestLevelCompleted: 0,
  bestCombo: 0,
};

export function loadSettings(): GameSettings {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn('Failed to load settings from localStorage', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save settings to localStorage', e);
  }
}

export function loadHighScores(): HighScoreEntry[] {
  try {
    const saved = localStorage.getItem(HIGHSCORES_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to load high scores', e);
  }
  return DEFAULT_HIGHSCORES;
}

export function saveHighScore(entry: Omit<HighScoreEntry, 'id'>): HighScoreEntry[] {
  const current = loadHighScores();
  const newEntry: HighScoreEntry = {
    ...entry,
    id: Date.now().toString(),
  };

  const updated = [...current, newEntry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  try {
    localStorage.setItem(HIGHSCORES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save high scores', e);
  }

  return updated;
}

export function isHighScore(score: number): boolean {
  if (score <= 0) return false;
  const current = loadHighScores();
  if (current.length < 10) return true;
  return score > current[current.length - 1].score;
}

export function loadStats(): GameStats {
  try {
    const saved = localStorage.getItem(STATS_KEY);
    if (saved) {
      return { ...DEFAULT_STATS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn('Failed to load stats', e);
  }
  return DEFAULT_STATS;
}

export function saveStats(stats: Partial<GameStats>): GameStats {
  const current = loadStats();
  const updated: GameStats = {
    ...current,
    ...stats,
    totalScore: (current.totalScore || 0) + (stats.totalScore || 0),
    totalBricksDestroyed: (current.totalBricksDestroyed || 0) + (stats.totalBricksDestroyed || 0),
    totalPowerUpsCollected: (current.totalPowerUpsCollected || 0) + (stats.totalPowerUpsCollected || 0),
    totalGamesPlayed: (current.totalGamesPlayed || 0) + (stats.totalGamesPlayed || 0),
    levelsUnlocked: Math.max(current.levelsUnlocked, stats.levelsUnlocked || 1),
    highestLevelCompleted: Math.max(current.highestLevelCompleted, stats.highestLevelCompleted || 0),
    bestCombo: Math.max(current.bestCombo, stats.bestCombo || 0),
  };

  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save stats', e);
  }

  return updated;
}

export function loadUnlockedLevels(): number {
  try {
    const saved = localStorage.getItem(LEVEL_PROGRESS_KEY);
    if (saved) {
      return parseInt(saved, 10) || 1;
    }
  } catch (e) {
    console.warn('Failed to load unlocked levels', e);
  }
  return 1;
}

export function unlockLevel(levelNumber: number): number {
  const current = loadUnlockedLevels();
  const next = Math.max(current, levelNumber);
  try {
    localStorage.setItem(LEVEL_PROGRESS_KEY, next.toString());
  } catch (e) {
    console.warn('Failed to save level progress', e);
  }
  return next;
}

// Haptic vibration helper
export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'failure' | 'success', enabled: boolean = true) {
  if (!enabled || typeof navigator === 'undefined' || !navigator.vibrate) return;

  try {
    switch (type) {
      case 'light':
        navigator.vibrate(8);
        break;
      case 'medium':
        navigator.vibrate(20);
        break;
      case 'heavy':
        navigator.vibrate([35, 20, 35]);
        break;
      case 'failure':
        navigator.vibrate([50, 40, 70]);
        break;
      case 'success':
        navigator.vibrate([20, 30, 40, 30, 60]);
        break;
    }
  } catch {
    // Ignore unsupported browser errors
  }
}
