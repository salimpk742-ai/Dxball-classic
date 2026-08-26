import React, { useEffect, useRef } from 'react';
import { GameScreen } from '../types';
import { soundEngine } from '../audio/soundEngine';
import { Play, Grid, Trophy, Settings, HelpCircle, Volume2, VolumeX } from 'lucide-react';

interface MainMenuProps {
  onNavigate: (screen: GameScreen) => void;
  onStartGame: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onNavigate,
  onStartGame,
  soundEnabled,
  onToggleSound,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Retro Animated Background Demo
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    // Floating Demo Bricks & Balls
    const demoBricks = Array.from({ length: 18 }, () => ({
      x: Math.random() * 800,
      y: Math.random() * 500,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      color: ['#dc2626', '#2563eb', '#16a34a', '#eab308', '#9333ea', '#0891b2'][
        Math.floor(Math.random() * 6)
      ],
      width: 48,
      height: 18,
    }));

    const demoBalls = Array.from({ length: 4 }, () => ({
      x: Math.random() * 800,
      y: Math.random() * 500,
      vx: (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 3 + 2),
      vy: (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 3 + 2),
      radius: 6,
    }));

    const render = () => {
      time += 0.02;
      ctx.fillStyle = '#050b18';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Starfield grid
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.06)';
      ctx.lineWidth = 1;
      const step = 40;
      for (let x = 0; x < canvas.width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Render floating demo bricks
      demoBricks.forEach(b => {
        b.x += b.vx;
        b.y += b.vy;
        if (b.x < 0 || b.x + b.width > canvas.width) b.vx *= -1;
        if (b.y < 0 || b.y + b.height > canvas.height) b.vy *= -1;

        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, b.width, b.height);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(b.x, b.y, b.width, 3);
      });

      // Render floating demo chrome balls
      demoBalls.forEach(ball => {
        ball.x += ball.vx;
        ball.y += ball.vy;
        if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) ball.vx *= -1;
        if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) ball.vy *= -1;

        const grad = ctx.createRadialGradient(
          ball.x - ball.radius * 0.3,
          ball.y - ball.radius * 0.3,
          1,
          ball.x,
          ball.y,
          ball.radius
        );
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.5, '#60a5fa');
        grad.addColorStop(1, '#1e3a8a');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  const handleMenuClick = (action: () => void) => {
    soundEngine.playButtonClick();
    action();
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-950 overflow-hidden select-none">
      {/* Background Canvas */}
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
      />

      {/* Retro Vignette Overlay */}
      <div className="absolute inset-0 bg-radial from-transparent via-slate-950/60 to-slate-950 pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 flex flex-col items-center max-w-md w-full px-6 py-8">
        {/* Title Logo */}
        <div className="text-center mb-8">
          <div className="inline-block bg-black/60 border border-white/20 p-5 rounded-sm shadow-[0_0_30px_rgba(34,211,238,0.2)] backdrop-blur-md">
            <h1 className="text-3xl sm:text-4xl font-extrabold font-mono tracking-wider bg-gradient-to-r from-cyan-400 via-sky-200 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">
              DX-BALL
            </h1>
            <div className="mt-1.5 flex items-center justify-center space-x-2">
              <span className="h-[1px] w-8 bg-cyan-400/60"></span>
              <span className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-cyan-300">
                CLASSIC ARCADE
              </span>
              <span className="h-[1px] w-8 bg-cyan-400/60"></span>
            </div>
          </div>
          <p className="mt-2.5 text-[11px] text-slate-400 font-mono tracking-widest uppercase">
            10 Stage Sequential Challenge
          </p>
        </div>

        {/* Menu Buttons */}
        <div className="w-full space-y-3 font-mono text-xs sm:text-sm">
          <button
            id="start-game-btn"
            onClick={() => handleMenuClick(onStartGame)}
            className="w-full py-3.5 px-4 rounded-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold tracking-wider uppercase border border-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.4)] flex items-center justify-center space-x-3 transition active:scale-98"
          >
            <Play className="w-4 h-4 fill-current text-white" />
            <span>START GAME</span>
          </button>

          <button
            id="level-select-btn"
            onClick={() => handleMenuClick(() => onNavigate('LEVEL_SELECT'))}
            className="w-full py-3 px-4 rounded-sm bg-white/5 hover:bg-white/10 text-white border border-white/15 backdrop-blur-sm shadow-sm flex items-center justify-center space-x-3 transition active:scale-98"
          >
            <Grid className="w-4 h-4 text-cyan-400" />
            <span>LEVEL SELECT</span>
          </button>

          <button
            id="high-scores-btn"
            onClick={() => handleMenuClick(() => onNavigate('HIGH_SCORES'))}
            className="w-full py-3 px-4 rounded-sm bg-white/5 hover:bg-white/10 text-white border border-white/15 backdrop-blur-sm shadow-sm flex items-center justify-center space-x-3 transition active:scale-98"
          >
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>HIGH SCORES</span>
          </button>

          <button
            id="how-to-play-btn"
            onClick={() => handleMenuClick(() => onNavigate('HOW_TO_PLAY'))}
            className="w-full py-3 px-4 rounded-sm bg-white/5 hover:bg-white/10 text-white border border-white/15 backdrop-blur-sm shadow-sm flex items-center justify-center space-x-3 transition active:scale-98"
          >
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span>HOW TO PLAY</span>
          </button>

          <button
            id="settings-btn"
            onClick={() => handleMenuClick(() => onNavigate('SETTINGS'))}
            className="w-full py-3 px-4 rounded-sm bg-white/5 hover:bg-white/10 text-white border border-white/15 backdrop-blur-sm shadow-sm flex items-center justify-center space-x-3 transition active:scale-98"
          >
            <Settings className="w-4 h-4 text-fuchsia-400" />
            <span>SETTINGS</span>
          </button>
        </div>

        {/* Footer & Sound Toggle */}
        <div className="mt-8 flex items-center justify-between w-full text-slate-400 text-[10px] font-mono tracking-wider">
          <span>10 LEVELS • 60 FPS</span>
          <button
            id="main-sound-toggle-btn"
            onClick={() => {
              soundEngine.playButtonClick();
              onToggleSound();
            }}
            className="p-2 rounded-sm bg-white/5 hover:bg-white/10 border border-white/20 text-slate-300 hover:text-white transition"
            title="Toggle Audio"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
          </button>
        </div>
      </div>
    </div>
  );
};
