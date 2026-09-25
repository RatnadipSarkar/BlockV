import React from 'react';
import { Mission } from '../types/game';
import { X, Award, Check, Coins, Zap } from 'lucide-react';
import { sound } from '../audio/soundEngine';

interface Props {
  missions: Mission[];
  onClaimReward: (missionId: string) => void;
  onClose: () => void;
}

export const MissionsModal: React.FC<Props> = ({ missions, onClaimReward, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm glass-panel p-6 rounded-3xl border border-white/10 text-left shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div>
            <h2 className="text-xl font-bold font-display text-white uppercase tracking-wider">
              DAILY MISSIONS
            </h2>
            <p className="text-xs text-white/50">Complete challenges to earn XP & Coins</p>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            aria-label="Close Missions"
            className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          {missions.map((m) => {
            const percent = Math.min(100, Math.round((m.progress / m.target) * 100));

            return (
              <div
                key={m.id}
                className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col gap-2.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">{m.title}</div>
                    <div className="text-xs text-white/50">{m.description}</div>
                  </div>

                  {m.claimed ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      <Check size={11} /> Done
                    </span>
                  ) : m.completed ? (
                    <button
                      onClick={() => onClaimReward(m.id)}
                      className="px-3 py-1 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-black text-xs hover:brightness-110 active:scale-95 shadow-md shadow-yellow-500/20"
                    >
                      CLAIM
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <span className="flex items-center gap-0.5 text-cyan-300">
                        <Zap size={11} /> +{m.rewardXp}
                      </span>
                      <span className="flex items-center gap-0.5 text-yellow-300">
                        <Coins size={11} /> +{m.rewardCoins}
                      </span>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="w-full">
                  <div className="flex justify-between text-[10px] text-white/40 mb-1">
                    <span>Progress</span>
                    <span className="font-mono-numbers">
                      {m.progress} / {m.target}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
