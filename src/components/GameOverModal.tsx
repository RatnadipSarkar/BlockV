import React, { useState } from 'react';
import { RotateCcw, Share2, Home, Sparkles, Trophy, Check } from 'lucide-react';
import { sound } from '../audio/soundEngine';

interface Props {
  score: number;
  bestScore: number;
  lines: number;
  maxCombo: number;
  perfectClears: number;
  blocksPlaced: number;
  xpEarned: number;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export const GameOverModal: React.FC<Props> = ({
  score,
  bestScore,
  lines,
  maxCombo,
  perfectClears,
  blocksPlaced,
  xpEarned,
  onPlayAgain,
  onGoHome,
}) => {
  const isNewBest = score >= bestScore && score > 0;
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    sound.playClick();
    const shareText = `🕹️ BLOCKVERSE: NEON BLAST\nScore: ${score.toLocaleString()}\nLines: ${lines} | Combo: x${maxCombo}\n🔥 Can you beat me in the Neon Grid?`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Blockverse: Neon Blast Result',
          text: shareText,
        });
        return;
      } catch {
        // User cancelled or unsupported
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm glass-panel p-6 rounded-3xl border border-white/10 text-center shadow-2xl animate-float">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-3xl font-black font-display tracking-tight text-white uppercase">
            GAME OVER
          </h2>
          {isNewBest ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-300 font-bold text-xs mt-2 border border-yellow-400/30 animate-pulse">
              <Sparkles size={14} /> NEW PERSONAL BEST!
            </div>
          ) : (
            <p className="text-xs text-white/50 uppercase tracking-widest mt-1">Session Summary</p>
          )}
        </div>

        {/* Primary Score Box */}
        <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 mb-4">
          <div className="text-[11px] uppercase tracking-wider text-white/40 font-bold">Final Score</div>
          <div className="text-4xl font-black font-mono-numbers text-cyan-400 my-1">
            {score.toLocaleString()}
          </div>
          <div className="flex items-center justify-center gap-1.5 text-xs text-white/60 font-medium">
            <Trophy size={13} className="text-yellow-400" />
            <span>Best: {bestScore.toLocaleString()}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 text-left mb-6">
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="text-[10px] uppercase text-white/40 font-bold">Lines</div>
            <div className="text-lg font-bold font-mono-numbers text-white">{lines}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="text-[10px] uppercase text-white/40 font-bold">Max Combo</div>
            <div className="text-lg font-bold font-mono-numbers text-amber-400">x{maxCombo}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="text-[10px] uppercase text-white/40 font-bold">XP Gained</div>
            <div className="text-lg font-bold font-mono-numbers text-emerald-400">+{xpEarned}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => {
              sound.playClick();
              onPlayAgain();
            }}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw size={16} /> PLAY AGAIN
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleShare}
              className="py-2.5 px-3 rounded-xl font-semibold text-xs bg-white/10 hover:bg-white/15 text-white transition-all flex items-center justify-center gap-1.5"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
              <span>{copied ? 'Copied Link!' : 'Share Score'}</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onGoHome();
              }}
              className="py-2.5 px-3 rounded-xl font-semibold text-xs bg-white/5 hover:bg-white/10 text-white/80 transition-all flex items-center justify-center gap-1.5"
            >
              <Home size={14} /> Main Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
