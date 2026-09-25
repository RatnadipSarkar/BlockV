import React from 'react';
import { GameMode } from '../types/game';
import { X, Play, Clock, Sparkles, Flame, Calendar, ShieldAlert } from 'lucide-react';
import { sound } from '../audio/soundEngine';

interface Props {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  onClose: () => void;
}

export const ModeSelectorModal: React.FC<Props> = ({ currentMode, onSelectMode, onClose }) => {
  const modes: {
    id: GameMode;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    border: string;
  }[] = [
    {
      id: 'classic',
      title: 'Classic Mode',
      description: 'The pure neon block puzzle. Endless play until no legal placements remain.',
      icon: <Play size={20} />,
      color: 'text-cyan-400',
      border: 'border-cyan-400/30',
    },
    {
      id: 'zen',
      title: 'Zen Mode',
      description: 'Stress-free casual puzzle with unlimited undos and no game over risk.',
      icon: <Sparkles size={20} />,
      color: 'text-emerald-400',
      border: 'border-emerald-400/30',
    },
    {
      id: 'time_attack',
      title: 'Time Attack',
      description: '60-second adrenaline blast! Each cleared line awards +3 extra seconds.',
      icon: <Clock size={20} />,
      color: 'text-amber-400',
      border: 'border-amber-400/30',
    },
    {
      id: 'blitz',
      title: 'Blitz Mode',
      description: 'Accelerated gameplay with amplified point multipliers on combos.',
      icon: <Flame size={20} />,
      color: 'text-rose-400',
      border: 'border-rose-400/30',
    },
    {
      id: 'daily',
      title: 'Daily Challenge',
      description: "Today's seeded puzzle with pre-placed obstacles. Reach 3,500 pts in 25 moves!",
      icon: <Calendar size={20} />,
      color: 'text-fuchsia-400',
      border: 'border-fuchsia-400/30',
    },
    {
      id: 'boss',
      title: 'Boss Obstacle Board',
      description: 'Challenge board with Ice blocks, Stone barriers, and 2X multiplier tiles.',
      icon: <ShieldAlert size={20} />,
      color: 'text-purple-400',
      border: 'border-purple-400/30',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm glass-panel p-6 rounded-3xl border border-white/10 text-left shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div>
            <h2 className="text-xl font-bold font-display text-white uppercase tracking-wider">
              SELECT GAME MODE
            </h2>
            <p className="text-xs text-white/50">Choose your grid challenge</p>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            aria-label="Close Modes"
            className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2.5">
          {modes.map((m) => {
            const isSelected = currentMode === m.id;

            return (
              <div
                key={m.id}
                onClick={() => {
                  sound.playClick();
                  onSelectMode(m.id);
                  onClose();
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                  isSelected
                    ? 'bg-white/10 border-cyan-400 shadow-[0_0_15px_rgba(0,243,255,0.2)]'
                    : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center ${m.color}`}
                >
                  {m.icon}
                </div>

                <div className="flex-1">
                  <div className="text-sm font-bold text-white flex items-center justify-between">
                    <span>{m.title}</span>
                    {isSelected && (
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-white/50 leading-snug mt-0.5">{m.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
