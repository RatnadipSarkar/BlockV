import React from 'react';
import { Play, RotateCcw, Settings, Home } from 'lucide-react';
import { sound } from '../audio/soundEngine';

interface Props {
  onResume: () => void;
  onRestart: () => void;
  onOpenSettings: () => void;
  onQuitToMenu: () => void;
}

export const PauseModal: React.FC<Props> = ({
  onResume,
  onRestart,
  onOpenSettings,
  onQuitToMenu,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xs glass-panel p-6 rounded-3xl border border-white/10 text-center shadow-2xl">
        <h2 className="text-2xl font-black font-display tracking-tight text-white mb-6 uppercase">
          GAME PAUSED
        </h2>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onResume();
            }}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-cyan-500 hover:bg-cyan-400 text-black transition-all flex items-center justify-center gap-2"
          >
            <Play size={16} fill="currentColor" /> RESUME
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onRestart();
            }}
            className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-white/10 hover:bg-white/15 text-white transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw size={16} /> RESTART
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenSettings();
            }}
            className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-white/10 hover:bg-white/15 text-white transition-all flex items-center justify-center gap-2"
          >
            <Settings size={16} /> SETTINGS
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onQuitToMenu();
            }}
            className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-white/5 hover:bg-white/10 text-white/70 transition-all flex items-center justify-center gap-2"
          >
            <Home size={16} /> QUIT TO MENU
          </button>
        </div>
      </div>
    </div>
  );
};
