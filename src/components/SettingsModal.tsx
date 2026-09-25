import React, { useState } from 'react';
import { GameSettings } from '../types/game';
import { X, Volume2, VolumeX, Music, Smartphone, Sparkles, Eye, AlertTriangle } from 'lucide-react';
import { sound } from '../audio/soundEngine';

interface Props {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onClose: () => void;
  onResetProgress: () => void;
}

export const SettingsModal: React.FC<Props> = ({
  settings,
  onUpdateSettings,
  onClose,
  onResetProgress,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm glass-panel p-6 rounded-3xl border border-white/10 text-left shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <h2 className="text-xl font-bold font-display text-white uppercase tracking-wider">
            SETTINGS
          </h2>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            aria-label="Close Settings"
            className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Audio Controls */}
        <div className="space-y-4 mb-6">
          <div className="text-xs uppercase font-bold text-white/40 tracking-wider">Audio</div>

          {/* SFX Volume */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-white/90">
              <Volume2 size={16} className="text-cyan-400" />
              <span>Sound Effects</span>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled });
              }}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                settings.soundEnabled ? 'bg-cyan-500' : 'bg-white/10'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  settings.soundEnabled ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Music Volume */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-white/90">
              <Music size={16} className="text-fuchsia-400" />
              <span>Synth Soundtrack</span>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onUpdateSettings({ ...settings, musicEnabled: !settings.musicEnabled });
              }}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                settings.musicEnabled ? 'bg-fuchsia-500' : 'bg-white/10'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  settings.musicEnabled ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Gameplay & Accessibility */}
        <div className="space-y-4 mb-6">
          <div className="text-xs uppercase font-bold text-white/40 tracking-wider">
            Feel & Accessibility
          </div>

          {/* Haptics */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-white/90">
              <Smartphone size={16} className="text-amber-400" />
              <span>Haptic Feedback</span>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onUpdateSettings({ ...settings, hapticsEnabled: !settings.hapticsEnabled });
              }}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                settings.hapticsEnabled ? 'bg-amber-500' : 'bg-white/10'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  settings.hapticsEnabled ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Screen Shake */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-white/90">
              <Sparkles size={16} className="text-rose-400" />
              <span>Screen Shake</span>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onUpdateSettings({ ...settings, screenShake: !settings.screenShake });
              }}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                settings.screenShake ? 'bg-rose-500' : 'bg-white/10'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  settings.screenShake ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Color-Blind Mode */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col text-sm text-white/90">
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-emerald-400" />
                <span>Color-Blind Glyphs</span>
              </div>
              <span className="text-[10px] text-white/40">Shows geometric patterns in blocks</span>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onUpdateSettings({ ...settings, colorBlindMode: !settings.colorBlindMode });
              }}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                settings.colorBlindMode ? 'bg-emerald-500' : 'bg-white/10'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  settings.colorBlindMode ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-white/90">
              <span>Reduced Motion</span>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onUpdateSettings({ ...settings, reducedMotion: !settings.reducedMotion });
              }}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                settings.reducedMotion ? 'bg-blue-500' : 'bg-white/10'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  settings.reducedMotion ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Reset Progress Section */}
        <div className="pt-4 border-t border-white/10">
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="text-xs text-red-400 hover:text-red-300 font-semibold transition-colors flex items-center gap-1.5"
            >
              <AlertTriangle size={13} /> Reset Local Progress
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs">
              <p className="text-red-300 font-semibold mb-2">
                Erase high scores, level, and unlocked themes?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onResetProgress();
                    setShowResetConfirm(false);
                  }}
                  className="px-3 py-1 rounded-lg bg-red-600 text-white font-bold hover:bg-red-500"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3 py-1 rounded-lg bg-white/10 text-white/80 hover:bg-white/20"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
