import React, { useEffect, useRef, useCallback } from 'react';
import { GameEngine, GAME_WIDTH, GAME_HEIGHT } from '../game/GameEngine';

interface GameCanvasProps {
  engine: GameEngine;
  onPause: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ engine, onPause }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const keysPressedRef = useRef<{ [key: string]: boolean }>({});

  // Coordinate Conversion Helper
  const getCanvasCoordinates = useCallback((clientX: number, clientY: number) => {
    if (!canvasRef.current) return { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 };
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = GAME_WIDTH / rect.width;
    const scaleY = GAME_HEIGHT / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, []);

  // Pointer & Touch Events
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignored if capture unsupported
    }

    const { x } = getCanvasCoordinates(e.clientX, e.clientY);
    engine.setPaddleTargetX(x);

    // If game is in READY state, tap launches ball
    if (engine.status === 'READY') {
      engine.launchBall();
    } else if (engine.status === 'PLAYING') {
      // If magnet holds ball or has laser, tap can trigger action
      engine.launchBall();
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { x } = getCanvasCoordinates(e.clientX, e.clientY);
    engine.setPaddleTargetX(x);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = false;
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignored
    }
  };

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressedRef.current[e.code] = true;

      if (e.code === 'Space') {
        e.preventDefault();
        engine.launchBall();
      } else if (e.code === 'KeyP' || e.code === 'Escape') {
        e.preventDefault();
        onPause();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Animation frame for smooth keyboard paddle movement
    let keyFrameId: number;
    const handleKeyMovement = () => {
      const step = 14;
      if (keysPressedRef.current['ArrowLeft'] || keysPressedRef.current['KeyA']) {
        engine.setPaddleTargetX(engine.paddle.x - step);
      }
      if (keysPressedRef.current['ArrowRight'] || keysPressedRef.current['KeyD']) {
        engine.setPaddleTargetX(engine.paddle.x + step);
      }
      keyFrameId = requestAnimationFrame(handleKeyMovement);
    };

    keyFrameId = requestAnimationFrame(handleKeyMovement);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(keyFrameId);
    };
  }, [engine, onPause]);

  // Init Engine with Canvas
  useEffect(() => {
    if (canvasRef.current) {
      engine.init(canvasRef.current);
    }
    return () => {
      engine.destroy();
    };
  }, [engine]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden p-2 sm:p-4 bg-geometric-radial"
    >
      {/* Background Geometric Grid Overlay */}
      <div className="absolute inset-0 bg-geometric-grid opacity-15 pointer-events-none" />

      {/* Subtle Glow Accent Behind Arena */}
      <div className="absolute w-[80%] h-[80%] rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

      <div className="relative max-w-full max-h-full aspect-[4/3] flex items-center justify-center shadow-[0_0_40px_rgba(2,5,18,0.9)] rounded-sm overflow-hidden border border-white/15 bg-[#020512]">
        <canvas
          id="brickstorm-game-canvas"
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="w-full h-full object-contain cursor-crosshair touch-none select-none"
        />

        {/* Ready overlay helper indicator on first launch */}
        {engine.status === 'READY' && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 pointer-events-none bg-black/80 backdrop-blur-md border border-cyan-400/60 px-4 py-1.5 rounded-sm text-cyan-300 text-xs font-mono tracking-widest uppercase font-bold shadow-[0_0_15px_rgba(34,211,238,0.4)] animate-pulse">
            TAP / DRAG OR SPACE TO LAUNCH
          </div>
        )}
      </div>
    </div>
  );
};
