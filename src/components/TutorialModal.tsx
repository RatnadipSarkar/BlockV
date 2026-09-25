import React, { useState } from 'react';
import { ArrowRight, Check, X, Sparkles, Layers, Flame, Zap } from 'lucide-react';
import { sound } from '../audio/soundEngine';

interface Props {
  onClose: () => void;
}

export const TutorialModal: React.FC<Props> = ({ onClose }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Drag & Place Blocks',
      description: 'Pick up neon pieces from your bottom dock and place them onto the 10x10 board. You can also tap a piece to rotate it!',
      icon: <Layers size={28} className="text-cyan-400" />,
      highlight: 'Pieces snap magnetically into valid empty spaces.',
    },
    {
      title: 'Vaporize Lines',
      description: 'Fill any entire row horizontally or column vertically to trigger a Neon Blast! Multiple simultaneous line clears award huge point bonuses.',
      icon: <Sparkles size={28} className="text-fuchsia-400" />,
      highlight: 'Clear 3 or more lines at once for a Triple/Mega Blast!',
    },
    {
      title: 'Build Combo Multipliers',
      description: 'Keep clearing lines on consecutive moves to multiply your score by x2, x3, x4, and beyond! High combos trigger electric arcade sounds.',
      icon: <Flame size={28} className="text-amber-400" />,
      highlight: 'An empty board triggers a triumphant PERFECT CLEAR (+5,000 pts)!',
    },
    {
      title: 'Unleash Powerups',
      description: 'When the grid gets tight, use your Bomb (3x3 blast), Lightning (crosshair blast), Hammer (destroy 1 cell), or Shuffle tools to break through!',
      icon: <Zap size={28} className="text-emerald-400" />,
      highlight: 'Level up and complete daily missions to earn more powerups.',
    },
  ];

  const current = steps[step];

  const handleNext = () => {
    sound.playClick();
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      try {
        localStorage.setItem('blockverse_neon_ftux_completed_v1', 'true');
      } catch {}
      onClose();
    }
  };

  const handleSkip = () => {
    sound.playClick();
    try {
      localStorage.setItem('blockverse_neon_ftux_completed_v1', 'true');
    } catch {}
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm glass-panel p-6 rounded-3xl border border-white/10 text-center shadow-2xl animate-float">
        <div className="flex justify-end mb-1">
          <button
            onClick={handleSkip}
            className="text-xs text-white/40 hover:text-white transition-colors"
          >
            Skip Tutorial
          </button>
        </div>

        {/* Step Icon */}
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mx-auto flex items-center justify-center mb-4 shadow-inner">
          {current.icon}
        </div>

        <h3 className="text-xl font-bold font-display text-white mb-2">{current.title}</h3>
        <p className="text-xs text-white/60 leading-relaxed mb-4">{current.description}</p>

        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-[11px] text-cyan-300 font-semibold mb-6">
          💡 {current.highlight}
        </div>

        {/* Step Dots & Next Button */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? 'w-6 bg-cyan-400' : 'w-2 bg-white/20'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-black transition-all flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
          >
            <span>{step === steps.length - 1 ? 'Start Playing' : 'Next'}</span>
            {step === steps.length - 1 ? <Check size={14} /> : <ArrowRight size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
};
