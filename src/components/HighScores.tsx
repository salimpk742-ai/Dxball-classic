import React from 'react';
import { HighScoreEntry } from '../types';
import { soundEngine } from '../audio/soundEngine';
import { ArrowLeft, Trophy, Medal } from 'lucide-react';

interface HighScoresProps {
  entries: HighScoreEntry[];
  onBack: () => void;
}

export const HighScores: React.FC<HighScoresProps> = ({ entries, onBack }) => {
  return (
    <div className="w-full h-full flex flex-col bg-geometric-radial text-slate-100 select-none p-4 sm:p-6 overflow-y-auto relative">
      {/* Background Geometric Grid Overlay */}
      <div className="absolute inset-0 bg-geometric-grid opacity-10 pointer-events-none" />

      {/* Top Header */}
      <div className="max-w-2xl w-full mx-auto flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
        <button
          id="highscores-back-btn"
          onClick={() => {
            soundEngine.playButtonClick();
            onBack();
          }}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-sm bg-white/5 hover:bg-white/10 border border-white/20 text-xs font-mono uppercase tracking-wider text-slate-300 hover:text-white transition active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK</span>
        </button>

        <div className="flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-amber-300" />
          <h2 className="text-lg font-bold font-mono tracking-wider bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
            HALL OF FAME
          </h2>
        </div>

        <div className="w-16" />
      </div>

      {/* High Scores Table */}
      <div className="max-w-2xl w-full mx-auto flex-1 mt-5 bg-black/50 backdrop-blur-md rounded-sm border border-white/15 p-4 sm:p-6 shadow-[0_0_30px_rgba(2,5,18,0.8)] overflow-hidden relative z-10">
        <div className="grid grid-cols-12 pb-3 border-b border-white/10 text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-400 font-bold">
          <div className="col-span-2 text-center">RANK</div>
          <div className="col-span-4">PLAYER</div>
          <div className="col-span-3 text-right">SCORE</div>
          <div className="col-span-3 text-right">LEVEL</div>
        </div>

        <div className="divide-y divide-white/5">
          {entries.map((entry, index) => {
            const isFirst = index === 0;
            const isSecond = index === 1;
            const isThird = index === 2;

            return (
              <div
                key={entry.id || index}
                className={`grid grid-cols-12 py-3 items-center font-mono text-xs sm:text-sm transition ${
                  isFirst
                    ? 'bg-amber-500/10 text-amber-300 font-bold'
                    : isSecond
                    ? 'bg-white/5 text-slate-200'
                    : isThird
                    ? 'bg-amber-800/10 text-amber-200/90'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                {/* Rank */}
                <div className="col-span-2 flex items-center justify-center font-mono text-xs font-bold">
                  {isFirst ? (
                    <Medal className="w-4 h-4 text-amber-300 inline" />
                  ) : isSecond ? (
                    <Medal className="w-4 h-4 text-slate-300 inline" />
                  ) : isThird ? (
                    <Medal className="w-4 h-4 text-amber-600 inline" />
                  ) : (
                    `#${index + 1}`
                  )}
                </div>

                {/* Player Name */}
                <div className="col-span-4 font-mono font-bold uppercase tracking-wider truncate">
                  {entry.name}
                </div>

                {/* Score */}
                <div className="col-span-3 text-right font-mono text-xs sm:text-sm text-white font-bold tracking-tight">
                  {entry.score.toLocaleString()}
                </div>

                {/* Level Reached */}
                <div className="col-span-3 text-right font-mono text-xs text-cyan-400 font-bold">
                  LVL {entry.levelReached}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
