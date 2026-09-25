import React from 'react';
import { PlayerStats } from '../types/game';
import { X, BarChart3, Trophy, Flame, Zap, Award, Layers } from 'lucide-react';
import { sound } from '../audio/soundEngine';

interface Props {
  stats: PlayerStats;
  level: number;
  onClose: () => void;
}

export const StatsModal: React.FC<Props> = ({ stats, level, onClose }) => {
  const statItems = [
    { label: 'Highest Score', value: stats.bestScore.toLocaleString(), icon: <Trophy size={16} className="text-yellow-400" /> },
    { label: 'Total Score', value: stats.totalScore.toLocaleString(), icon: <Zap size={16} className="text-cyan-400" /> },
    { label: 'Games Played', value: stats.gamesPlayed.toString(), icon: <BarChart3 size={16} className="text-fuchsia-400" /> },
    { label: 'Total Lines Cleared', value: stats.totalLinesCleared.toString(), icon: <Layers size={16} className="text-blue-400" /> },
    { label: 'Highest Combo', value: `x${stats.maxCombo}`, icon: <Flame size={16} className="text-orange-400" /> },
    { label: 'Current Level', value: level.toString(), icon: <Award size={16} className="text-emerald-400" /> },
    { label: 'Perfect Clears', value: stats.perfectClears.toString(), icon: <Award size={16} className="text-yellow-300" /> },
    { label: 'Blocks Placed', value: stats.blocksPlaced.toString(), icon: <Layers size={16} className="text-purple-400" /> },
    { label: 'Powerups Used', value: stats.powerupsUsed.toString(), icon: <Zap size={16} className="text-rose-400" /> },
    { label: 'Daily Streak', value: `${stats.currentStreak} Days`, icon: <Flame size={16} className="text-amber-400" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm glass-panel p-6 rounded-3xl border border-white/10 text-left shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div>
            <h2 className="text-xl font-bold font-display text-white uppercase tracking-wider">
              CAREER STATS
            </h2>
            <p className="text-xs text-white/50">Lifetime performance metrics</p>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            aria-label="Close Stats"
            className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {statItems.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between"
            >
              <div className="flex items-center gap-1.5 text-xs text-white/50 mb-1">
                {item.icon}
                <span className="truncate">{item.label}</span>
              </div>
              <div className="text-lg font-black font-mono-numbers text-white">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
