import React from 'react';
import { ActivePowerUp } from '../types';
import { Pause, Zap, Shield, Play } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface HUDProps {
  score: number;
  highScore: number;
  level: number;
  lives: number;
  combo: number;
  activePowerUps: ActivePowerUp[];
  safetyFloorActive: boolean;
  hasLaser: boolean;
  isReady: boolean;
  onPause: () => void;
  onLaunchOrFire: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  score,
  highScore,
  level,
  lives,
  combo,
  activePowerUps,
  safetyFloorActive,
  hasLaser,
  isReady,
  onPause,
  onLaunchOrFire,
}) => {
  // Format score with leading zeroes or clean commas
  const formattedScore = score.toLocaleString().padStart(6, '0');

  return (
    <header className="w-full bg-black/50 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-2.5 sm:py-3 flex items-center justify-between shadow-lg select-none text-white z-20">
      {/* Left: Score & High Score */}
      <div className="flex items-center space-x-4 sm:space-x-6">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-400 font-bold font-mono">
            Current Score
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-xl sm:text-2xl md:text-3xl font-mono tracking-tighter text-white drop-shadow-[0_0_12px_rgba(34,211,238,0.35)] font-bold">
              {formattedScore}
            </span>
            {combo > 1 && (
              <span className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-400/50 text-amber-300 text-[10px] font-mono font-bold tracking-wider rounded-sm animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.3)]">
                x{combo} COMBO
              </span>
            )}
          </div>
        </div>

        <div className="hidden md:flex flex-col border-l border-white/10 pl-4">
          <span className="text-[9px] uppercase tracking-[0.15em] text-slate-400 font-mono">
            High Score
          </span>
          <span className="text-xs font-mono text-slate-200">
            {Math.max(score, highScore).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Center: Level & Title */}
      <div className="flex flex-col items-center">
        <span className="text-[10px] uppercase tracking-[0.2em] text-fuchsia-400 font-bold opacity-80 font-mono">
          Level {level} / 10
        </span>
        <h1 className="text-sm sm:text-lg font-bold tracking-widest uppercase italic bg-gradient-to-r from-cyan-400 via-sky-200 to-blue-500 bg-clip-text text-transparent">
          DX-BALL
        </h1>

        {/* Quick Power-up Indicators in HUD */}
        {(safetyFloorActive || activePowerUps.length > 0) && (
          <div className="flex items-center space-x-1 mt-1">
            {safetyFloorActive && (
              <div className="flex items-center space-x-1 px-1.5 py-0.5 bg-teal-950/60 border border-teal-400/60 rounded-sm text-[9px] text-teal-300 font-mono">
                <Shield className="w-2.5 h-2.5 text-teal-400 animate-pulse" />
                <span className="hidden sm:inline">BARRIER</span>
              </div>
            )}
            {activePowerUps.map(p => (
              <div
                key={p.type}
                className="px-1.5 py-0.5 bg-cyan-950/60 border border-cyan-400/50 rounded-sm text-[9px] text-cyan-300 font-mono tracking-wider font-bold"
              >
                <span>{p.type.split('_')[0]}</span>
                <span className="ml-1 text-yellow-300">{Math.ceil(p.timeRemaining)}s</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: Lives & Action Buttons */}
      <div className="flex items-center space-x-4 sm:space-x-6">
        {/* Quick Action Button: Launch or Fire */}
        {isReady ? (
          <button
            id="launch-ball-hud-btn"
            onClick={onLaunchOrFire}
            className="flex items-center space-x-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded text-xs font-mono font-bold uppercase tracking-wider border border-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.5)] transition active:scale-95 animate-pulse"
          >
            <Play className="w-3 h-3 fill-current text-white" />
            <span>LAUNCH</span>
          </button>
        ) : hasLaser ? (
          <button
            id="fire-laser-hud-btn"
            onClick={onLaunchOrFire}
            className="flex items-center space-x-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded text-xs font-mono font-bold uppercase tracking-wider border border-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.5)] transition active:scale-95 animate-pulse"
          >
            <Zap className="w-3 h-3 fill-current text-white" />
            <span>FIRE</span>
          </button>
        ) : null}

        {/* Geometric Balance Lives Indicators */}
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase tracking-[0.2em] text-yellow-400 font-bold font-mono">
            Lives
          </span>
          <div className="flex gap-1.5 mt-1 items-center">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className={`w-4 sm:w-6 h-2 border border-white/40 transition-all ${
                  lives >= i
                    ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]'
                    : 'bg-cyan-950/40 border-white/20 opacity-25'
                }`}
              />
            ))}
            {lives > 3 && (
              <span className="text-xs font-mono text-cyan-300 font-bold ml-1">
                +{lives - 3}
              </span>
            )}
          </div>
        </div>

        {/* Geometric Pause Button */}
        <button
          id="pause-game-btn"
          onClick={() => {
            soundEngine.playButtonClick();
            onPause();
          }}
          className="bg-white/5 hover:bg-white/10 border border-white/20 p-2 rounded text-white transition active:scale-95 shadow-sm"
          title="Pause Game (ESC / P)"
        >
          <Pause className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
