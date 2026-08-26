import React from 'react';
import { soundEngine } from '../audio/soundEngine';
import { Play, RotateCcw, Home, Settings } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onSettings: () => void;
  onQuit: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onSettings,
  onQuit,
}) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none animate-fade-in">
      <div className="max-w-xs w-full bg-black/70 border border-white/20 rounded-sm p-6 shadow-[0_0_40px_rgba(2,5,18,0.9)] text-center space-y-4">
        <h2 className="text-xl font-bold font-mono tracking-[0.2em] bg-gradient-to-r from-cyan-400 via-sky-200 to-blue-500 bg-clip-text text-transparent">
          PAUSED
        </h2>

        <div className="space-y-2.5 font-mono text-xs pt-2">
          <button
            id="pause-resume-btn"
            onClick={() => {
              soundEngine.playButtonClick();
              onResume();
            }}
            className="w-full py-3 px-4 rounded-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold uppercase tracking-wider border border-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.4)] flex items-center justify-center space-x-2 transition active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>RESUME</span>
          </button>

          <button
            id="pause-restart-btn"
            onClick={() => {
              soundEngine.playButtonClick();
              onRestart();
            }}
            className="w-full py-2.5 px-4 rounded-sm bg-white/5 hover:bg-white/10 text-white border border-white/15 uppercase tracking-wider flex items-center justify-center space-x-2 transition active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-300" />
            <span>RESTART</span>
          </button>

          <button
            id="pause-settings-btn"
            onClick={() => {
              soundEngine.playButtonClick();
              onSettings();
            }}
            className="w-full py-2.5 px-4 rounded-sm bg-white/5 hover:bg-white/10 text-white border border-white/15 uppercase tracking-wider flex items-center justify-center space-x-2 transition active:scale-95"
          >
            <Settings className="w-3.5 h-3.5 text-fuchsia-400" />
            <span>SETTINGS</span>
          </button>

          <button
            id="pause-quit-btn"
            onClick={() => {
              soundEngine.playButtonClick();
              onQuit();
            }}
            className="w-full py-2.5 px-4 rounded-sm bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase tracking-wider flex items-center justify-center space-x-2 transition active:scale-95"
          >
            <Home className="w-3.5 h-3.5 text-rose-400" />
            <span>QUIT TO MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
