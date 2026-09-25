import React from 'react';
import { GameMode, PlayerStats } from '../types/game';
import {
  Play,
  Trophy,
  Flame,
  Award,
  Palette,
  Settings as SettingsIcon,
  HelpCircle,
  Calendar,
  Layers,
  BarChart2,
} from 'lucide-react';
import { sound } from '../audio/soundEngine';

interface Props {
  stats: PlayerStats;
  level: number;
  mode: GameMode;
  onStartGame: () => void;
  onOpenModes: () => void;
  onOpenMissions: () => void;
  onOpenAchievements: () => void;
  onOpenLeaderboard: () => void;
  onOpenThemes: () => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
  onOpenTutorial: () => void;
}

export const StartScreen: React.FC<Props> = ({
  stats,
  level,
  mode,
  onStartGame,
  onOpenModes,
  onOpenMissions,
  onOpenAchievements,
  onOpenLeaderboard,
  onOpenThemes,
  onOpenStats,
  onOpenSettings,
  onOpenTutorial,
}) => {
  return (
    <div className="relative w-full max-w-md mx-auto min-h-screen flex flex-col justify-between p-6 z-20 text-center select-none">
      {/* Top Bar with Profile / Streak / Settings */}
      <div className="flex items-center justify-between text-xs text-white/70 pt-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 font-bold">
            <span className="text-cyan-400">LVL {level}</span>
          </div>
          <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold">
            <Flame size={14} className="fill-amber-400/20" />
            <span>{stats.currentStreak}D STREAK</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              onOpenTutorial();
            }}
            aria-label="How to play"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-colors"
          >
            <HelpCircle size={18} />
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onOpenSettings();
            }}
            aria-label="Settings"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-colors"
          >
            <SettingsIcon size={18} />
          </button>
        </div>
      </div>

      {/* Hero Wordmark & Title */}
      <div className="my-auto py-6 flex flex-col items-center">
        {/* Floating Decorative Neon Block Cluster */}
        <div className="flex gap-1.5 mb-6 animate-float">
          <div className="w-6 h-6 rounded-md bg-cyan-400 shadow-[0_0_15px_#00f3ff] neon-block-bevel" />
          <div className="w-6 h-6 rounded-md bg-fuchsia-500 shadow-[0_0_15px_#ff0077] neon-block-bevel" />
          <div className="w-6 h-6 rounded-md bg-amber-400 shadow-[0_0_15px_#ffaa00] neon-block-bevel" />
        </div>

        <h1 className="text-5xl sm:text-6xl font-black font-display tracking-tight text-white uppercase italic leading-none drop-shadow-[0_0_30px_rgba(0,243,255,0.4)]">
          BLOCKVERSE
        </h1>
        <div className="text-xl sm:text-2xl font-black font-display tracking-[0.4em] text-cyan-400 uppercase mt-1">
          NEON BLAST
        </div>
        <p className="text-xs text-white/40 max-w-[260px] mt-3">
          Tactile 10x10 neon puzzle with continuous combos & powers
        </p>

        {/* Quick Best Score Display */}
        <div className="mt-6 px-4 py-2 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-3">
          <Trophy size={16} className="text-yellow-400" />
          <div className="text-left">
            <div className="text-[10px] text-white/40 uppercase font-bold">Personal Best</div>
            <div className="text-base font-black font-mono-numbers text-white">
              {stats.bestScore.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Big Play Button */}
        <div className="w-full max-w-xs mt-8">
          <button
            onClick={() => {
              sound.playClick();
              onStartGame();
            }}
            className="w-full py-4 px-6 rounded-2xl font-black font-display text-lg tracking-wider bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 text-black uppercase shadow-[0_0_30px_rgba(0,243,255,0.35)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <Play size={22} fill="currentColor" /> PLAY NOW
          </button>
        </div>

        {/* Mode Selector Pill */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenModes();
          }}
          className="mt-3 text-xs font-semibold text-white/60 hover:text-cyan-300 transition-colors flex items-center gap-1.5"
        >
          <Layers size={13} /> Mode: <span className="text-white capitalize">{mode}</span> (Change)
        </button>
      </div>

      {/* Bottom Nav Cards Grid */}
      <div className="grid grid-cols-4 gap-2 pt-4 border-t border-white/10">
        <button
          onClick={() => {
            sound.playClick();
            onOpenMissions();
          }}
          className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 flex flex-col items-center gap-1 transition-all"
        >
          <Award size={18} className="text-purple-400" />
          <span className="text-[10px] font-bold text-white/70">Missions</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onOpenLeaderboard();
          }}
          className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 flex flex-col items-center gap-1 transition-all"
        >
          <Trophy size={18} className="text-yellow-400" />
          <span className="text-[10px] font-bold text-white/70">Ranks</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onOpenThemes();
          }}
          className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 flex flex-col items-center gap-1 transition-all"
        >
          <Palette size={18} className="text-cyan-400" />
          <span className="text-[10px] font-bold text-white/70">Themes</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onOpenStats();
          }}
          className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 flex flex-col items-center gap-1 transition-all"
        >
          <BarChart2 size={18} className="text-emerald-400" />
          <span className="text-[10px] font-bold text-white/70">Stats</span>
        </button>
      </div>
    </div>
  );
};
