import React from 'react';
import { THEMES } from '../data/themes';
import { X, Lock, Check } from 'lucide-react';
import { sound } from '../audio/soundEngine';

interface Props {
  currentThemeId: string;
  playerLevel: number;
  onSelectTheme: (themeId: string) => void;
  onClose: () => void;
}

export const ThemesModal: React.FC<Props> = ({
  currentThemeId,
  playerLevel,
  onSelectTheme,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm glass-panel p-6 rounded-3xl border border-white/10 text-left shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div>
            <h2 className="text-xl font-bold font-display text-white uppercase tracking-wider">
              THEMES & SKINS
            </h2>
            <p className="text-xs text-white/50">Level up to unlock neon palettes</p>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            aria-label="Close Themes"
            className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          {THEMES.map((theme) => {
            const isUnlocked = playerLevel >= theme.unlockLevel;
            const isSelected = currentThemeId === theme.id;

            return (
              <div
                key={theme.id}
                onClick={() => {
                  if (isUnlocked) {
                    sound.playClick();
                    onSelectTheme(theme.id);
                  } else {
                    sound.playInvalid();
                  }
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-white/10 border-cyan-400 shadow-[0_0_15px_rgba(0,243,255,0.25)]'
                    : isUnlocked
                    ? 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10'
                    : 'bg-white/[0.01] border-white/5 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Swatch */}
                  <div
                    className="w-10 h-10 rounded-xl border border-white/20 flex items-center justify-center shadow-inner"
                    style={{
                      background: `linear-gradient(135deg, ${theme.accent}, ${theme.secondary})`,
                    }}
                  >
                    {isSelected && <Check size={16} className="text-black font-black" />}
                  </div>

                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{theme.name}</span>
                      {!isUnlocked && (
                        <span className="flex items-center gap-0.5 text-[10px] text-white/40 font-semibold px-1.5 py-0.5 rounded bg-white/5">
                          <Lock size={10} /> LVL {theme.unlockLevel}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-white/50 max-w-[200px] truncate">
                      {theme.description}
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10">
                    Active
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
