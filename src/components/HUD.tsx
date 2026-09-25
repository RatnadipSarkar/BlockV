import React from 'react';
import { GameMode } from '../types/game';
import { Flame, Undo2, Pause, Volume2, VolumeX, Trophy, Coins } from 'lucide-react';
import { sound } from '../audio/soundEngine';

interface Props {
  score: number;
  bestScore: number;
  combo: number;
  level: number;
  xp: number;
  coins: number;
  streak: number;
  mode: GameMode;
  undoTokens: number;
  timeLeft?: number;
  movesLeft?: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onPause: () => void;
  onUndo: () => void;
}

export const HUD: React.FC<Props> = ({
  score,
  bestScore,
  combo,
  level,
  xp,
  coins,
  streak,
  mode,
  undoTokens,
  timeLeft,
  movesLeft,
  soundEnabled,
  onToggleSound,
  onPause,
  onUndo,
}) => {
  const xpNeeded = level * 600;
  const xpPercent = Math.min(100, Math.round((xp / xpNeeded) * 100));
  const ghostPercent = bestScore > 0 ? Math.min(100, Math.round((score / bestScore) * 100)) : 0;

  const modeLabels: Record<GameMode, string> = {
    classic: 'Classic',
    zen: 'Zen Mode',
    time_attack: 'Time Attack',
    blitz: 'Blitz Run',
    daily: 'Daily Challenge',
    boss: 'Boss Board',
  };

  return (
    <header className="w-full max-w-xl mx-auto px-4 pt-3 pb-2 flex flex-col gap-2 z-20">
      {/* Top Status Row */}
      <div className="flex items-center justify-between text-xs text-white/70">
        {/* Profile & Level Bar */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 font-bold">
            <span className="text-cyan-400">LVL {level}</span>
            <div className="w-14 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 transition-all duration-300"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-white/50">{xpPercent}%</span>
          </div>

          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10 font-medium">
            <Coins size={13} className="text-yellow-400" />
            <span className="text-white font-mono-numbers">{coins}</span>
          </div>
        </div>

        {/* Streak & Sound & Pause Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-semibold">
            <Flame size={14} className="fill-amber-400/20" />
            <span>{streak}D</span>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onToggleSound();
            }}
            aria-label="Toggle Sound"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-colors"
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} className="text-red-400" />}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onPause();
            }}
            aria-label="Pause Game"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-colors"
          >
            <Pause size={16} />
          </button>
        </div>
      </div>

      {/* Main Score & Timers Section */}
      <div className="flex items-end justify-between px-1">
        {/* Current Score */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-white/50 font-bold">
              {modeLabels[mode]}
            </span>
            {combo > 1 && (
              <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-orange-500 to-amber-500 text-black font-black text-xs tracking-wider animate-pulse">
                x{combo} COMBO
              </span>
            )}
          </div>
          <div className="text-3xl sm:text-4xl font-black font-display tracking-tight text-white flex items-baseline gap-2">
            <span className="font-mono-numbers">{score.toLocaleString()}</span>
          </div>
        </div>

        {/* Mode Specific: Timer / Moves */}
        {mode === 'time_attack' && (
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Time</span>
            <span
              className={`text-2xl font-black font-mono-numbers ${
                timeLeft && timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-cyan-400'
              }`}
            >
              {timeLeft}s
            </span>
          </div>
        )}

        {mode === 'daily' && (
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Moves</span>
            <span className="text-2xl font-black font-mono-numbers text-amber-400">{movesLeft}</span>
          </div>
        )}

        {/* Best Score & Undo Button */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 text-[11px] text-white/40 uppercase font-medium">
              <Trophy size={11} className="text-yellow-400" />
              <span>Best</span>
            </div>
            <div className="text-sm sm:text-base font-bold font-mono-numbers text-white/80">
              {bestScore.toLocaleString()}
            </div>
          </div>

          <button
            onClick={() => {
              onUndo();
            }}
            disabled={undoTokens <= 0}
            aria-label="Undo Move"
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-all ${
              undoTokens > 0
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20'
                : 'bg-white/5 border-white/5 text-white/20 cursor-not-allowed'
            }`}
          >
            <Undo2 size={14} />
            <span className="text-xs font-bold font-mono-numbers">{undoTokens}</span>
          </button>
        </div>
      </div>

      {/* Ghost Benchmark Bar (Distance to Personal Best) */}
      {bestScore > 0 && (
        <div className="w-full mt-1">
          <div className="flex justify-between text-[10px] text-white/40 mb-0.5">
            <span>Progress to Best</span>
            <span className="font-mono-numbers">{ghostPercent}%</span>
          </div>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                score >= bestScore
                  ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500'
              }`}
              style={{ width: `${Math.min(100, ghostPercent)}%` }}
            />
          </div>
        </div>
      )}
    </header>
  );
};
