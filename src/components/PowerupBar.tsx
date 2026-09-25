import React from 'react';
import { PowerupInventory, PowerupType } from '../types/game';
import { Hammer, Bomb, Zap, RefreshCw } from 'lucide-react';
import { sound } from '../audio/soundEngine';

interface Props {
  powerups: PowerupInventory;
  activePowerup: PowerupType | null;
  onUsePowerup: (type: PowerupType) => void;
}

export const PowerupBar: React.FC<Props> = ({ powerups, activePowerup, onUsePowerup }) => {
  const items: {
    type: PowerupType;
    label: string;
    icon: React.ReactNode;
    color: string;
    activeBorder: string;
    description: string;
  }[] = [
    {
      type: 'hammer',
      label: 'Hammer',
      icon: <Hammer size={16} />,
      color: 'text-amber-400',
      activeBorder: 'border-amber-400 bg-amber-500/20 text-amber-300',
      description: 'Tap cell to smash it',
    },
    {
      type: 'bomb',
      label: 'Bomb',
      icon: <Bomb size={16} />,
      color: 'text-rose-400',
      activeBorder: 'border-rose-400 bg-rose-500/20 text-rose-300',
      description: 'Tap cell to detonate 3x3',
    },
    {
      type: 'lightning',
      label: 'Lightning',
      icon: <Zap size={16} />,
      color: 'text-cyan-400',
      activeBorder: 'border-cyan-400 bg-cyan-500/20 text-cyan-300',
      description: 'Tap cell to clear crosshair',
    },
    {
      type: 'shuffle',
      label: 'Shuffle',
      icon: <RefreshCw size={16} />,
      color: 'text-fuchsia-400',
      activeBorder: 'border-fuchsia-400 bg-fuchsia-500/20 text-fuchsia-300',
      description: 'Rerolls all 3 pieces',
    },
  ];

  return (
    <div className="w-full max-w-[460px] mx-auto px-4 pb-2 z-20 flex flex-col gap-1.5 items-center">
      {/* Active guidance note */}
      {activePowerup && (
        <div className="text-xs font-semibold tracking-wide text-yellow-300 animate-pulse">
          🎯 {items.find((i) => i.type === activePowerup)?.description} (Click cell)
        </div>
      )}

      {/* Buttons row */}
      <div className="grid grid-cols-4 gap-2 w-full">
        {items.map((item) => {
          const count = powerups[item.type];
          const isActive = activePowerup === item.type;
          const isDisabled = count <= 0;

          return (
            <button
              key={item.type}
              type="button"
              disabled={isDisabled}
              onClick={() => {
                sound.playClick();
                onUsePowerup(item.type);
              }}
              className={`relative flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl font-medium text-xs border transition-all ${
                isActive
                  ? `${item.activeBorder} shadow-lg ring-2 ring-white/40`
                  : isDisabled
                  ? 'bg-white/[0.02] border-white/5 text-white/20 cursor-not-allowed'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-white/80 hover:text-white'
              }`}
            >
              <span className={item.color}>{item.icon}</span>
              <span className="hidden sm:inline text-[11px] font-semibold">{item.label}</span>
              <span
                className={`ml-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono-numbers ${
                  count > 0 ? 'bg-white/10 text-white' : 'bg-transparent text-white/20'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
