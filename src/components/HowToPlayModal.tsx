import React from 'react';
import { soundEngine } from '../audio/soundEngine';
import { ArrowLeft, Gamepad2, Shield, Flame, Zap, Crosshair } from 'lucide-react';

interface HowToPlayModalProps {
  onBack: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onBack }) => {
  return (
    <div className="w-full h-full flex flex-col bg-geometric-radial text-slate-100 select-none p-4 sm:p-6 overflow-y-auto relative">
      {/* Background Geometric Grid Overlay */}
      <div className="absolute inset-0 bg-geometric-grid opacity-10 pointer-events-none" />

      {/* Top Header */}
      <div className="max-w-2xl w-full mx-auto flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
        <button
          id="how-to-play-back-btn"
          onClick={() => {
            soundEngine.playButtonClick();
            onBack();
          }}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-sm bg-white/5 hover:bg-white/10 border border-white/20 text-xs font-mono uppercase tracking-wider text-slate-300 hover:text-white transition active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK</span>
        </button>

        <h2 className="text-lg font-bold font-mono tracking-wider bg-gradient-to-r from-cyan-400 via-sky-200 to-blue-500 bg-clip-text text-transparent">
          HOW TO PLAY
        </h2>

        <div className="w-16" />
      </div>

      {/* Content */}
      <div className="max-w-2xl w-full mx-auto flex-1 mt-4 space-y-4 pb-6 relative z-10">
        {/* Controls Section */}
        <div className="bg-black/50 backdrop-blur-md rounded-sm border border-white/15 p-5 shadow-[0_0_20px_rgba(2,5,18,0.8)] space-y-2.5">
          <div className="flex items-center space-x-2 text-cyan-400">
            <Gamepad2 className="w-5 h-5" />
            <h3 className="text-xs font-bold font-mono uppercase tracking-[0.2em]">CONTROLS & PHYSICS</h3>
          </div>
          <p className="text-xs text-slate-300 font-mono leading-relaxed">
            • <strong className="text-cyan-300">Touch & Drag:</strong> Slide your finger across the bottom of the screen to move the paddle smoothly.
          </p>
          <p className="text-xs text-slate-300 font-mono leading-relaxed">
            • <strong className="text-cyan-300">Tap / Spacebar:</strong> Launch the ball at level start or release magnet-caught balls. Also fires laser cannons!
          </p>
          <p className="text-xs text-slate-300 font-mono leading-relaxed">
            • <strong className="text-cyan-300">DX-Ball Angle Deflection:</strong> Ball bounce direction depends on where it strikes the paddle. Hitting the <em>center</em> bounces straight up; hitting the <em>edges</em> sends it diagonally outward at sharp angles!
          </p>
        </div>

        {/* Power-Ups Encyclopedia */}
        <div className="bg-black/50 backdrop-blur-md rounded-sm border border-white/15 p-5 shadow-[0_0_20px_rgba(2,5,18,0.8)] space-y-3.5">
          <h3 className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-[0.2em]">
            ARCADE POWER-UPS
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            <div className="flex items-center space-x-2.5 bg-white/5 p-2.5 rounded-sm border border-white/10">
              <span className="w-7 h-5 bg-cyan-500 rounded-sm text-center text-[10px] font-bold text-white leading-5">↔</span>
              <div>
                <strong className="text-cyan-300 block">Wide Paddle</strong>
                <span className="text-[10px] text-slate-400">Expands paddle width</span>
              </div>
            </div>

            <div className="flex items-center space-x-2.5 bg-white/5 p-2.5 rounded-sm border border-white/10">
              <span className="w-7 h-5 bg-purple-500 rounded-sm text-center text-[10px] font-bold text-white leading-5">●●●</span>
              <div>
                <strong className="text-purple-300 block">Multi-Ball</strong>
                <span className="text-[10px] text-slate-400">Splits each ball into 3</span>
              </div>
            </div>

            <div className="flex items-center space-x-2.5 bg-white/5 p-2.5 rounded-sm border border-white/10">
              <span className="w-7 h-5 bg-orange-500 rounded-sm text-center text-[10px] font-bold text-white leading-5">🔥</span>
              <div>
                <strong className="text-orange-300 block">Fire Ball</strong>
                <span className="text-[10px] text-slate-400">Blazes through all standard bricks</span>
              </div>
            </div>

            <div className="flex items-center space-x-2.5 bg-white/5 p-2.5 rounded-sm border border-white/10">
              <span className="w-7 h-5 bg-emerald-500 rounded-sm text-center text-[10px] font-bold text-white leading-5">🔫</span>
              <div>
                <strong className="text-emerald-300 block">Laser Cannons</strong>
                <span className="text-[10px] text-slate-400">Tap or space to shoot lasers</span>
              </div>
            </div>

            <div className="flex items-center space-x-2.5 bg-white/5 p-2.5 rounded-sm border border-white/10">
              <span className="w-7 h-5 bg-violet-500 rounded-sm text-center text-[10px] font-bold text-white leading-5">🧲</span>
              <div>
                <strong className="text-violet-300 block">Magnet Catch</strong>
                <span className="text-[10px] text-slate-400">Catches ball; tap to aim & fire</span>
              </div>
            </div>

            <div className="flex items-center space-x-2.5 bg-white/5 p-2.5 rounded-sm border border-white/10">
              <span className="w-7 h-5 bg-teal-500 rounded-sm text-center text-[10px] font-bold text-white leading-5">🛡️</span>
              <div>
                <strong className="text-teal-300 block">Safety Barrier</strong>
                <span className="text-[10px] text-slate-400">Protects bottom floor</span>
              </div>
            </div>

            <div className="flex items-center space-x-2.5 bg-white/5 p-2.5 rounded-sm border border-white/10">
              <span className="w-7 h-5 bg-pink-500 rounded-sm text-center text-[10px] font-bold text-white leading-5">❤️</span>
              <div>
                <strong className="text-pink-300 block">Extra Life</strong>
                <span className="text-[10px] text-slate-400">+1 extra ball life</span>
              </div>
            </div>

            <div className="flex items-center space-x-2.5 bg-white/5 p-2.5 rounded-sm border border-white/10">
              <span className="w-7 h-5 bg-amber-500 rounded-sm text-center text-[10px] font-bold text-white leading-5">💎</span>
              <div>
                <strong className="text-amber-300 block">Score Bonus</strong>
                <span className="text-[10px] text-slate-400">+1,000 instant bonus points</span>
              </div>
            </div>
          </div>
        </div>

        {/* Special Bricks */}
        <div className="bg-black/50 backdrop-blur-md rounded-sm border border-white/15 p-5 shadow-[0_0_20px_rgba(2,5,18,0.8)] space-y-2.5">
          <h3 className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-[0.2em]">
            SPECIAL BRICK TYPES
          </h3>
          <p className="text-xs text-slate-300 font-mono leading-relaxed">
            • <strong className="text-red-400">TNT Explosive Brick:</strong> Triggers an instant blast wave destroying surrounding bricks.
          </p>
          <p className="text-xs text-slate-300 font-mono leading-relaxed">
            • <strong className="text-slate-400">Indestructible Steel Brick:</strong> Solid metal that reflects standard balls. Can only be pierced by Fireball or Lasers!
          </p>
          <p className="text-xs text-slate-300 font-mono leading-relaxed">
            • <strong className="text-amber-300">Gold Star Bonus Brick:</strong> Guaranteed to drop an arcade power-up capsule.
          </p>
        </div>
      </div>
    </div>
  );
};
