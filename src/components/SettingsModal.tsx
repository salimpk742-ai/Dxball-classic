import React from 'react';
import { GameSettings } from '../types';
import { soundEngine } from '../audio/soundEngine';
import { ArrowLeft, Volume2, VolumeX, Smartphone, Monitor, Activity, Zap } from 'lucide-react';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onBack: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onBack,
}) => {
  const update = (partial: Partial<GameSettings>) => {
    const updated = { ...settings, ...partial };
    onUpdateSettings(updated);

    if (partial.musicEnabled !== undefined) soundEngine.toggleMusic(partial.musicEnabled);
    if (partial.sfxEnabled !== undefined) soundEngine.toggleSfx(partial.sfxEnabled);
    if (partial.musicVolume !== undefined) soundEngine.setMusicVolume(partial.musicVolume);
    if (partial.sfxVolume !== undefined) soundEngine.setSfxVolume(partial.sfxVolume);
  };

  return (
    <div className="w-full h-full flex flex-col bg-geometric-radial text-slate-100 select-none p-4 sm:p-6 overflow-y-auto relative">
      {/* Background Geometric Grid Overlay */}
      <div className="absolute inset-0 bg-geometric-grid opacity-10 pointer-events-none" />

      {/* Top Header */}
      <div className="max-w-xl w-full mx-auto flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
        <button
          id="settings-back-btn"
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
          SETTINGS
        </h2>

        <div className="w-16" />
      </div>

      {/* Settings Form */}
      <div className="max-w-xl w-full mx-auto flex-1 mt-4 space-y-4 relative z-10">
        {/* Audio Section */}
        <div className="bg-black/50 backdrop-blur-md rounded-sm border border-white/15 p-5 shadow-[0_0_20px_rgba(2,5,18,0.8)] space-y-3.5">
          <h3 className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-[0.2em]">
            AUDIO SYNTHESIZER
          </h3>

          {/* Music Toggle & Volume */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              {settings.musicEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
              <span className="font-mono text-xs sm:text-sm text-slate-200">Background Music</span>
            </div>
            <input
              type="checkbox"
              id="music-toggle-chk"
              checked={settings.musicEnabled}
              onChange={e => update({ musicEnabled: e.target.checked })}
              className="w-4 h-4 accent-cyan-400 cursor-pointer"
            />
          </div>

          {settings.musicEnabled && (
            <div className="flex items-center space-x-3 pl-6">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 w-16">VOLUME</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.musicVolume}
                onChange={e => update({ musicVolume: parseFloat(e.target.value) })}
                className="flex-1 accent-cyan-400 cursor-pointer"
              />
              <span className="text-xs font-mono text-cyan-400 w-8">
                {Math.round(settings.musicVolume * 100)}%
              </span>
            </div>
          )}

          {/* SFX Toggle & Volume */}
          <div className="flex items-center justify-between pt-2.5 border-t border-white/10">
            <div className="flex items-center space-x-2.5">
              {settings.sfxEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
              <span className="font-mono text-xs sm:text-sm text-slate-200">Sound Effects (SFX)</span>
            </div>
            <input
              type="checkbox"
              id="sfx-toggle-chk"
              checked={settings.sfxEnabled}
              onChange={e => update({ sfxEnabled: e.target.checked })}
              className="w-4 h-4 accent-cyan-400 cursor-pointer"
            />
          </div>

          {settings.sfxEnabled && (
            <div className="flex items-center space-x-3 pl-6">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 w-16">VOLUME</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.sfxVolume}
                onChange={e => update({ sfxVolume: parseFloat(e.target.value) })}
                className="flex-1 accent-cyan-400 cursor-pointer"
              />
              <span className="text-xs font-mono text-cyan-400 w-8">
                {Math.round(settings.sfxVolume * 100)}%
              </span>
            </div>
          )}
        </div>

        {/* Controls & Haptics */}
        <div className="bg-black/50 backdrop-blur-md rounded-sm border border-white/15 p-5 shadow-[0_0_20px_rgba(2,5,18,0.8)] space-y-3.5">
          <h3 className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-[0.2em]">
            CONTROLS & HAPTICS
          </h3>

          {/* Vibration */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Smartphone className="w-4 h-4 text-fuchsia-400" />
              <span className="font-mono text-xs sm:text-sm text-slate-200">Haptic Vibration</span>
            </div>
            <input
              type="checkbox"
              id="vibration-toggle-chk"
              checked={settings.vibrationEnabled}
              onChange={e => update({ vibrationEnabled: e.target.checked })}
              className="w-4 h-4 accent-fuchsia-400 cursor-pointer"
            />
          </div>

          {/* Touch Sensitivity */}
          <div className="flex items-center space-x-3 pt-2.5 border-t border-white/10">
            <div className="flex items-center space-x-2.5 w-36">
              <Zap className="w-4 h-4 text-amber-300" />
              <span className="font-mono text-xs sm:text-sm text-slate-200">Sensitivity</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={settings.touchSensitivity}
              onChange={e => update({ touchSensitivity: parseFloat(e.target.value) })}
              className="flex-1 accent-amber-400 cursor-pointer"
            />
            <span className="text-xs font-mono text-amber-300 w-10">
              {settings.touchSensitivity.toFixed(1)}x
            </span>
          </div>
        </div>

        {/* Visuals */}
        <div className="bg-black/50 backdrop-blur-md rounded-sm border border-white/15 p-5 shadow-[0_0_20px_rgba(2,5,18,0.8)] space-y-3.5">
          <h3 className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-[0.2em]">
            RETRO VISUALS
          </h3>

          {/* CRT Scanline Filter */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Monitor className="w-4 h-4 text-cyan-400" />
              <span className="font-mono text-xs sm:text-sm text-slate-200">CRT Scanline Overlay</span>
            </div>
            <input
              type="checkbox"
              id="crt-toggle-chk"
              checked={settings.crtFilter}
              onChange={e => update({ crtFilter: e.target.checked })}
              className="w-4 h-4 accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Screen Shake */}
          <div className="flex items-center justify-between pt-2.5 border-t border-white/10">
            <div className="flex items-center space-x-2.5">
              <Activity className="w-4 h-4 text-rose-400" />
              <span className="font-mono text-xs sm:text-sm text-slate-200">Explosion Screen Shake</span>
            </div>
            <input
              type="checkbox"
              id="screen-shake-chk"
              checked={settings.screenShake}
              onChange={e => update({ screenShake: e.target.checked })}
              className="w-4 h-4 accent-rose-400 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
