import { useState, useEffect, useMemo, useCallback } from 'react';
import { ActivePowerUp, GameScreen, GameSettings, HighScoreEntry } from './types';
import { GameEngine } from './game/GameEngine';
import { soundEngine } from './audio/soundEngine';
import {
  loadSettings,
  saveSettings,
  loadHighScores,
  saveHighScore,
  isHighScore,
  loadUnlockedLevels,
  unlockLevel,
  saveStats,
} from './utils/storage';
import { MainMenu } from './components/MainMenu';
import { LevelSelect } from './components/LevelSelect';
import { HighScores } from './components/HighScores';
import { SettingsModal } from './components/SettingsModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { HUD } from './components/HUD';
import { GameCanvas } from './components/GameCanvas';
import { PauseModal } from './components/PauseModal';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { GameOverModal } from './components/GameOverModal';

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('MENU');
  const [settings, setSettings] = useState<GameSettings>(loadSettings);
  const [unlockedLevels, setUnlockedLevels] = useState<number>(loadUnlockedLevels);
  const [highScores, setHighScores] = useState<HighScoreEntry[]>(loadHighScores);

  // Gameplay Reactive State
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [level, setLevel] = useState<number>(1);
  const [combo, setCombo] = useState<number>(0);
  const [activePowerUps, setActivePowerUps] = useState<ActivePowerUp[]>([]);
  const [safetyFloorActive, setSafetyFloorActive] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isLevelComplete, setIsLevelComplete] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [levelClearStats, setLevelClearStats] = useState<{ score: number; combo: number; timeSeconds: number }>({
    score: 0,
    combo: 0,
    timeSeconds: 0,
  });

  // Create & memoize engine instance
  const engine = useMemo(() => new GameEngine(settings), []);

  // Sync settings with sound engine and game engine
  useEffect(() => {
    soundEngine.sfxEnabled = settings.sfxEnabled;
    soundEngine.musicEnabled = settings.musicEnabled;
    soundEngine.sfxVolume = settings.sfxVolume;
    soundEngine.musicVolume = settings.musicVolume;
    engine.settings = settings;
  }, [settings, engine]);

  // High score calculation
  const highestScore = useMemo(() => {
    return highScores.length > 0 ? highScores[0].score : 0;
  }, [highScores]);

  // Engine callbacks setup
  useEffect(() => {
    engine.onScoreChange = newScore => {
      setScore(newScore);
    };

    engine.onLivesChange = newLives => {
      setLives(newLives);
    };

    engine.onPowerUpsChange = powerUps => {
      setActivePowerUps([...powerUps]);
      setSafetyFloorActive(engine.safetyFloorActive);
    };

    engine.onLevelComplete = (lvl, stats) => {
      setIsLevelComplete(true);
      setLevelClearStats(stats);

      // Unlock next level
      const nextUnlocked = unlockLevel(lvl + 1);
      setUnlockedLevels(nextUnlocked);

      // Save lifetime stats
      saveStats({
        totalScore: stats.score,
        totalBricksDestroyed: engine.bricksDestroyedInLevel,
        bestCombo: stats.combo,
        highestLevelCompleted: lvl,
        levelsUnlocked: nextUnlocked,
      });
    };

    engine.onGameOver = (finalScore, levelReached) => {
      setIsGameOver(true);
      saveStats({
        totalScore: finalScore,
        totalGamesPlayed: 1,
        totalBricksDestroyed: engine.bricksDestroyedInLevel,
      });
    };
  }, [engine]);

  // Keep background music active when in gameplay
  useEffect(() => {
    if (screen === 'PLAYING' && !isPaused && !isGameOver && !isLevelComplete) {
      const trackIndex = (level - 1) % 3;
      soundEngine.startMusic(trackIndex);
    } else {
      soundEngine.stopMusic();
    }
    return () => {
      soundEngine.stopMusic();
    };
  }, [screen, isPaused, isGameOver, isLevelComplete, level]);

  // Auto pause when tab goes to background
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && screen === 'PLAYING' && !isPaused && !isGameOver && !isLevelComplete) {
        setIsPaused(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [screen, isPaused, isGameOver, isLevelComplete]);

  // Action Handlers
  const handleStartGame = useCallback((startLevel: number = 1) => {
    setLevel(startLevel);
    setScore(0);
    setLives(3);
    setCombo(0);
    setIsPaused(false);
    setIsLevelComplete(false);
    setIsGameOver(false);
    setActivePowerUps([]);

    engine.score = 0;
    engine.lives = 3;
    engine.loadLevel(startLevel);
    setScreen('PLAYING');
  }, [engine]);

  const handleNextLevel = useCallback(() => {
    setIsLevelComplete(false);
    if (level >= 10) {
      setLevel(1);
      engine.loadLevel(1);
    } else {
      const nextLvl = level + 1;
      setLevel(nextLvl);
      engine.loadLevel(nextLvl);
    }
  }, [engine, level]);

  const handleRestartLevel = useCallback(() => {
    setIsPaused(false);
    setIsGameOver(false);
    setIsLevelComplete(false);
    engine.lives = 3;
    setLives(3);
    engine.loadLevel(level);
  }, [engine, level]);

  const handleResume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const handlePause = useCallback(() => {
    if (screen === 'PLAYING' && !isGameOver && !isLevelComplete) {
      setIsPaused(prev => !prev);
    }
  }, [screen, isGameOver, isLevelComplete]);

  const handleQuitToMenu = useCallback(() => {
    setIsPaused(false);
    setIsGameOver(false);
    setIsLevelComplete(false);
    soundEngine.stopMusic();
    setScreen('MENU');
  }, []);

  const handleSaveHighScore = useCallback((name: string) => {
    const updated = saveHighScore({
      name,
      score,
      levelReached: level,
      date: new Date().toISOString().split('T')[0],
    });
    setHighScores(updated);
  }, [score, level]);

  const handleUpdateSettings = useCallback((newSettings: GameSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  }, []);

  const handleToggleSound = useCallback(() => {
    const nextSfx = !settings.sfxEnabled;
    const nextMusic = !settings.musicEnabled;
    handleUpdateSettings({
      ...settings,
      sfxEnabled: nextSfx,
      musicEnabled: nextMusic,
    });
  }, [settings, handleUpdateSettings]);

  const isCurrentScoreHighScore = useMemo(() => {
    return isHighScore(score);
  }, [score]);

  // Level completion progress %
  const progressPercent = useMemo(() => {
    if (engine.totalBricksInLevel === 0) return 0;
    return Math.min(100, Math.round((engine.bricksDestroyedInLevel / engine.totalBricksInLevel) * 100));
  }, [engine.totalBricksInLevel, engine.bricksDestroyedInLevel, score]);

  return (
    <div className="relative w-full h-full bg-geometric-radial text-slate-100 flex flex-col font-mono select-none overflow-hidden">
      {/* Background Geometric Grid Overlay */}
      <div className="absolute inset-0 bg-geometric-grid opacity-10 pointer-events-none" />

      {/* Screen Router */}
      {screen === 'MENU' && (
        <MainMenu
          onNavigate={setScreen}
          onStartGame={() => handleStartGame(1)}
          soundEnabled={settings.sfxEnabled || settings.musicEnabled}
          onToggleSound={handleToggleSound}
        />
      )}

      {screen === 'LEVEL_SELECT' && (
        <LevelSelect
          unlockedLevels={unlockedLevels}
          onSelectLevel={lvl => handleStartGame(lvl)}
          onBack={() => setScreen('MENU')}
        />
      )}

      {screen === 'HIGH_SCORES' && (
        <HighScores
          entries={highScores}
          onBack={() => setScreen('MENU')}
        />
      )}

      {screen === 'SETTINGS' && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onBack={() => setScreen('MENU')}
        />
      )}

      {screen === 'HOW_TO_PLAY' && (
        <HowToPlayModal
          onBack={() => setScreen('MENU')}
        />
      )}

      {screen === 'PLAYING' && (
        <div className="relative w-full h-full flex flex-col justify-between">
          {/* Top HUD */}
          <HUD
            score={score}
            highScore={highestScore}
            level={level}
            lives={lives}
            combo={combo}
            activePowerUps={activePowerUps}
            safetyFloorActive={safetyFloorActive}
            hasLaser={engine.paddle.hasLaser}
            isReady={engine.status === 'READY'}
            onPause={handlePause}
            onLaunchOrFire={() => engine.launchBall()}
          />

          {/* Game Canvas Arena */}
          <main className="flex-1 relative w-full h-full flex items-center justify-center overflow-hidden">
            <GameCanvas
              engine={engine}
              onPause={handlePause}
            />

            {/* In-Game Pause Modal */}
            {isPaused && (
              <PauseModal
                onResume={handleResume}
                onRestart={handleRestartLevel}
                onSettings={() => setScreen('SETTINGS')}
                onQuit={handleQuitToMenu}
              />
            )}

            {/* Level Complete Victory Modal */}
            {isLevelComplete && (
              <LevelCompleteModal
                level={level}
                score={levelClearStats.score}
                combo={levelClearStats.combo}
                timeSeconds={levelClearStats.timeSeconds}
                onNextLevel={handleNextLevel}
                onMenu={handleQuitToMenu}
              />
            )}

            {/* Game Over Modal */}
            {isGameOver && (
              <GameOverModal
                score={score}
                level={level}
                isHighScore={isCurrentScoreHighScore}
                onSaveHighScore={handleSaveHighScore}
                onRestart={handleRestartLevel}
                onMenu={handleQuitToMenu}
              />
            )}
          </main>

          {/* Geometric Balance In-Game Footer HUD */}
          <footer className="w-full px-4 sm:px-8 py-2.5 sm:py-3 bg-black/60 backdrop-blur-md border-t border-white/10 flex items-center justify-between z-20 text-white select-none">
            {/* Left: Active Powerups Status Tray */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono font-bold mb-0.5">
                  Active Powerups
                </span>
                <div className="flex gap-1.5 flex-wrap max-w-[200px] sm:max-w-none">
                  {activePowerUps.length === 0 && !safetyFloorActive ? (
                    <span className="text-[10px] text-slate-500 font-mono italic">
                      None active
                    </span>
                  ) : (
                    <>
                      {safetyFloorActive && (
                        <div className="px-2 py-0.5 bg-teal-950/60 border border-teal-400/80 text-teal-300 text-[10px] font-bold uppercase tracking-wider rounded-sm shadow-[0_0_6px_rgba(45,212,191,0.3)]">
                          Barrier
                        </div>
                      )}
                      {activePowerUps.map(p => (
                        <div
                          key={p.type}
                          className="px-2 py-0.5 bg-cyan-950/60 border border-cyan-400/80 text-cyan-300 text-[10px] font-bold uppercase tracking-wider rounded-sm shadow-[0_0_6px_rgba(34,211,238,0.3)]"
                        >
                          {p.type.replace('_', ' ')}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Center: Stage Progress Bar */}
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="h-1.5 w-24 sm:w-48 bg-white/10 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-cyan-400 font-bold whitespace-nowrap">
                {progressPercent}% COMPLETE
              </span>
            </div>

            {/* Right: High Score Label */}
            <div className="text-right flex flex-col">
              <span className="text-[9px] text-slate-400 mb-0.5 uppercase tracking-widest font-mono">
                Top Record
              </span>
              <span className="text-xs sm:text-sm font-mono text-white font-bold">
                {Math.max(score, highestScore).toLocaleString()}
              </span>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}
