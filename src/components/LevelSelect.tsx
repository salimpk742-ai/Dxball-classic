import React from 'react';
import { LEVELS } from '../data/levels';
import { soundEngine } from '../audio/soundEngine';
import { ArrowLeft, Lock, Play, Star, Sparkles } from 'lucide-react';

interface LevelSelectProps {
  unlockedLevels: number;
  onSelectLevel: (level: number) => void;
  onBack: () => void;
}

export const LevelSelect: React.FC<LevelSelectProps> = ({
  unlockedLevels,
  onSelectLevel,
  onBack,
}) => {
  const totalLevels = LEVELS.length; // 10

  const handleSelect = (levelNum: number) => {
    if (levelNum <= unlockedLevels) {
      soundEngine.playButtonClick();
      onSelectLevel(levelNum);
    } else {
      soundEngine.playLifeLost();
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-geometric-radial text-slate-100 select-none p-4 sm:p-6 overflow-y-auto relative">
      {/* Background Geometric Grid Overlay */}
      <div className="absolute inset-0 bg-geometric-grid opacity-10 pointer-events-none" />

      {/* Top Header */}
      <div className="max-w-3xl w-full mx-auto flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
        <button
          id="level-select-back-btn"
          onClick={() => {
            soundEngine.playButtonClick();
            onBack();
          }}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-sm bg-white/5 hover:bg-white/10 border border-white/20 text-xs font-mono uppercase tracking-wider text-slate-300 hover:text-white transition active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK</span>
        </button>

        <div className="text-center">
          <h2 className="text-lg font-bold font-mono tracking-wider bg-gradient-to-r from-cyan-400 via-sky-200 to-blue-500 bg-clip-text text-transparent">
            DX-BALL LEVEL SELECT
          </h2>
          <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-widest flex items-center justify-center space-x-1">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>{Math.min(unlockedLevels, totalLevels)} / {totalLevels} UNLOCKED</span>
          </span>
        </div>

        <div className="w-16" /> {/* Placeholder for spacing */}
      </div>

      {/* Level Cards Grid - 10 Levels */}
      <div className="max-w-3xl w-full mx-auto flex-1 grid grid-cols-2 sm:grid-cols-5 gap-3 py-6 relative z-10">
        {LEVELS.map(lvl => {
          const isUnlocked = lvl.id <= unlockedLevels;
          const isCompleted = lvl.id < unlockedLevels;
          const isCurrentTarget = lvl.id === unlockedLevels;

          return (
            <div
              key={lvl.id}
              onClick={() => handleSelect(lvl.id)}
              className={`relative rounded-sm p-4 flex flex-col justify-between border transition cursor-pointer select-none ${
                isUnlocked
                  ? isCurrentTarget
                    ? 'bg-gradient-to-b from-cyan-950/60 to-black/80 border-cyan-400/80 shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:scale-[1.02] active:scale-95'
                    : 'bg-black/50 hover:bg-black/70 border-white/20 hover:border-cyan-400/80 shadow-[0_0_15px_rgba(2,5,18,0.8)] hover:shadow-[0_0_15px_rgba(34,211,238,0.25)] hover:scale-[1.02] active:scale-95'
                  : 'bg-black/30 border-white/5 opacity-40 cursor-not-allowed'
              }`}
            >
              {/* Top Row: Level Num & Icon */}
              <div className="flex items-center justify-between">
                <span className={`text-base font-bold font-mono ${isUnlocked ? 'text-cyan-400' : 'text-slate-500'}`}>
                  #{lvl.id}
                </span>
                {isCompleted ? (
                  <Star className="w-4 h-4 text-amber-300 fill-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]" />
                ) : !isUnlocked ? (
                  <Lock className="w-4 h-4 text-slate-500" />
                ) : (
                  <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400 animate-pulse" />
                )}
              </div>

              {/* Center: Level Name & Theme */}
              <div className="my-3">
                <h4 className="text-xs font-bold font-mono text-slate-100 truncate">{lvl.name}</h4>
                <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase truncate block mt-0.5">
                  {lvl.theme}
                </span>
              </div>

              {/* Status Badge */}
              <div className="mt-1 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono tracking-wider uppercase">
                <span className={isCompleted ? 'text-amber-300 font-bold' : isUnlocked ? (isCurrentTarget ? 'text-cyan-300 font-bold' : 'text-emerald-400 font-bold') : 'text-slate-600'}>
                  {isCompleted ? 'COMPLETED' : isCurrentTarget ? 'NEXT UP' : isUnlocked ? 'PLAYABLE' : 'LOCKED'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

