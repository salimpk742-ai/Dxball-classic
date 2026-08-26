import React from 'react';
import { soundEngine } from '../audio/soundEngine';
import { Play, Trophy, Sparkles, Clock, Flame } from 'lucide-react';

interface LevelCompleteModalProps {
  level: number;
  score: number;
  combo: number;
  timeSeconds: number;
  onNextLevel: () => void;
  onMenu: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  level,
  score,
  combo,
  timeSeconds,
  onNextLevel,
  onMenu,
}) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none animate-fade-in">
      <div className="max-w-sm w-full bg-black/75 border border-amber-400/50 rounded-sm p-6 shadow-[0_0_40px_rgba(251,191,36,0.2)] text-center space-y-4">
        {/* Victory Header */}
        <div className="inline-flex p-3.5 rounded-full bg-amber-500/10 border border-amber-400/30 mb-1">
          <Trophy className="w-8 h-8 text-amber-300 animate-bounce" />
        </div>

        <div>
          <h2 className="text-xl font-bold font-mono tracking-wider bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
            {level >= 10 ? 'DX-BALL CHAMPION!' : `LEVEL ${level} COMPLETE!`}
          </h2>
          <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-widest">
            {level >= 10 ? 'ALL 10 LEVELS CLEARED!' : `STAGE CLEARED • LEVEL ${level + 1} UNLOCKED`}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="bg-black/60 rounded-sm p-3.5 border border-white/10 space-y-2.5 text-xs font-mono">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Total Score</span>
            </span>
            <span className="font-mono text-white text-sm font-bold">
              {score.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-white/10 pt-2">
            <span className="text-slate-400 flex items-center space-x-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Max Combo</span>
            </span>
            <span className="font-mono text-orange-400 font-bold">
              x{combo}
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-white/10 pt-2">
            <span className="text-slate-400 flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Clear Time</span>
            </span>
            <span className="font-mono text-cyan-300 font-bold">
              {timeSeconds}s
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 font-mono text-xs pt-2">
          <button
            id="level-complete-next-btn"
            onClick={() => {
              soundEngine.playButtonClick();
              onNextLevel();
            }}
            className="w-full py-3.5 px-4 rounded-sm bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold uppercase tracking-wider border border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center justify-center space-x-2 transition active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{level >= 10 ? 'PLAY AGAIN (LEVEL 1)' : `PLAY LEVEL ${level + 1}`}</span>
          </button>

          <button
            id="level-complete-menu-btn"
            onClick={() => {
              soundEngine.playButtonClick();
              onMenu();
            }}
            className="w-full py-2.5 px-4 rounded-sm bg-white/5 hover:bg-white/10 text-slate-300 border border-white/15 uppercase tracking-wider transition active:scale-95"
          >
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
};
