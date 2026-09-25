import React, { useState } from 'react';
import { LeaderboardEntry, GameMode } from '../types/game';
import { X, Trophy, Medal } from 'lucide-react';
import { sound } from '../audio/soundEngine';

interface Props {
  entries: LeaderboardEntry[];
  onClose: () => void;
}

export const LeaderboardModal: React.FC<Props> = ({ entries, onClose }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'daily' | 'weekly'>('all');

  const filteredEntries = entries.filter((e) => {
    if (activeTab === 'daily') return e.date === 'Today';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm glass-panel p-6 rounded-3xl border border-white/10 text-left shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
          <div>
            <h2 className="text-xl font-bold font-display text-white uppercase tracking-wider">
              LEADERBOARD
            </h2>
            <p className="text-[11px] text-white/50">Local high scores & personal records</p>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            aria-label="Close Leaderboard"
            className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex p-1 bg-white/5 rounded-xl gap-1 mb-4">
          {(['all', 'daily', 'weekly'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                sound.playClick();
                setActiveTab(tab);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                activeTab === tab
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {tab === 'all' ? 'All Time' : tab}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-2 mb-4">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-8 text-xs text-white/40">No entries recorded yet.</div>
          ) : (
            filteredEntries.map((item, idx) => {
              const isTop3 = idx < 3;
              const medalColors = ['text-yellow-400', 'text-slate-300', 'text-amber-600'];

              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    item.playerName === 'You'
                      ? 'bg-cyan-500/10 border-cyan-500/30'
                      : 'bg-white/[0.02] border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 text-center font-black font-mono-numbers text-sm">
                      {isTop3 ? (
                        <Medal size={18} className={medalColors[idx]} />
                      ) : (
                        <span className="text-white/40">{idx + 1}</span>
                      )}
                    </div>

                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>{item.playerName}</span>
                        <span className="text-[10px] text-white/40 uppercase font-mono-numbers">
                          · {item.mode}
                        </span>
                      </div>
                      <div className="text-[10px] text-white/40 font-mono-numbers">
                        {item.lines} lines · x{item.maxCombo} combo
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-black font-mono-numbers text-cyan-400">
                      {item.score.toLocaleString()}
                    </div>
                    <div className="text-[9px] text-white/30">{item.date}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Local indicator note */}
        <div className="text-[10px] text-white/30 text-center">
          ⚡ Stored locally on this browser. Backend cloud sync ready.
        </div>
      </div>
    </div>
  );
};
