import React, { useState } from 'react';
import { soundEngine } from '../audio/soundEngine';
import { RotateCcw, Home, Trophy, Skull } from 'lucide-react';

interface GameOverModalProps {
  score: number;
  level: number;
  isHighScore: boolean;
  onSaveHighScore: (name: string) => void;
  onRestart: () => void;
  onMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  level,
  isHighScore,
  onSaveHighScore,
  onRestart,
  onMenu,
}) => {
  const [playerName, setPlayerName] = useState<string>('PLAYER_1');
  const [saved, setSaved] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saved && playerName.trim()) {
      soundEngine.playButtonClick();
      onSaveHighScore(playerName.trim().toUpperCase());
      setSaved(true);
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none animate-fade-in">
      <div className="max-w-sm w-full bg-black/75 border border-rose-500/50 rounded-sm p-6 shadow-[0_0_40px_rgba(244,63,94,0.25)] text-center space-y-4">
        {/* Skull Header */}
        <div className="inline-flex p-3.5 rounded-full bg-rose-500/10 border border-rose-500/30 mb-1">
          <Skull className="w-8 h-8 text-rose-400 animate-pulse" />
        </div>

        <div>
          <h2 className="text-2xl font-bold font-mono tracking-wider bg-gradient-to-r from-rose-400 to-red-500 bg-clip-text text-transparent">
            GAME OVER
          </h2>
          <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">
            REACHED LEVEL {level}
          </span>
        </div>

        {/* Score Display */}
        <div className="bg-black/60 rounded-sm p-3.5 border border-white/10">
          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block mb-1">
            FINAL SCORE
          </span>
          <span className="text-xl font-bold font-mono text-white tracking-tight">
            {score.toLocaleString()}
          </span>
        </div>

        {/* High Score Submission Form */}
        {isHighScore && !saved && (
          <form onSubmit={handleSave} className="bg-amber-500/10 border border-amber-400/30 rounded-sm p-3.5 space-y-2.5">
            <div className="flex items-center justify-center space-x-1.5 text-amber-300 text-xs font-bold font-mono uppercase tracking-wider">
              <Trophy className="w-4 h-4" />
              <span>NEW HIGH SCORE!</span>
            </div>
            <p className="text-[10px] text-slate-300 font-mono tracking-wider">ENTER YOUR NAME / INITIALS:</p>
            <div className="flex space-x-2">
              <input
                type="text"
                id="player-name-input"
                maxLength={12}
                value={playerName}
                onChange={e => setPlayerName(e.target.value.toUpperCase())}
                className="flex-1 bg-black/60 border border-amber-400/60 px-2 py-1.5 rounded-sm text-center text-xs font-mono text-amber-300 uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
              <button
                type="submit"
                id="save-score-btn"
                className="px-3.5 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-mono text-[10px] font-bold uppercase tracking-wider rounded-sm shadow-sm"
              >
                SAVE
              </button>
            </div>
          </form>
        )}

        {saved && (
          <div className="text-xs font-mono text-emerald-400 font-bold tracking-wider uppercase">
            ✓ HIGH SCORE RECORDED!
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2 font-mono text-xs pt-2">
          <button
            id="game-over-retry-btn"
            onClick={() => {
              soundEngine.playButtonClick();
              onRestart();
            }}
            className="w-full py-3 px-4 rounded-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold uppercase tracking-wider border border-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.4)] flex items-center justify-center space-x-2 transition active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>TRY AGAIN</span>
          </button>

          <button
            id="game-over-menu-btn"
            onClick={() => {
              soundEngine.playButtonClick();
              onMenu();
            }}
            className="w-full py-2.5 px-4 rounded-sm bg-white/5 hover:bg-white/10 text-slate-300 border border-white/15 uppercase tracking-wider flex items-center justify-center space-x-2 transition active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
