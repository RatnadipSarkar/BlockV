import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

export interface ParticleTrigger {
  emitPlacement: (x: number, y: number, color: string) => void;
  emitLineClear: (rows: number[], cols: number[], cellSize: number, boardRect: DOMRect) => void;
  emitBomb: (x: number, y: number) => void;
  emitLightning: (r: number, c: number, cellSize: number, boardRect: DOMRect) => void;
  emitCelebration: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  type: 'spark' | 'ring' | 'confetti' | 'beam';
  width?: number;
  height?: number;
  rotation?: number;
  vRot?: number;
}

export const ParticleCanvas = forwardRef<ParticleTrigger, { reducedMotion?: boolean }>(
  ({ reducedMotion = false }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const particlesRef = useRef<Particle[]>([]);
    const animFrameRef = useRef<number | null>(null);

    useImperativeHandle(ref, () => ({
      emitPlacement: (x: number, y: number, color: string) => {
        if (reducedMotion) return;
        const count = 14;
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 1.5 + Math.random() * 3.5;
          particlesRef.current.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 2.5 + Math.random() * 2.5,
            color,
            alpha: 1,
            decay: 0.025 + Math.random() * 0.02,
            type: 'spark',
          });
        }
      },

      emitLineClear: (rows: number[], cols: number[], cellSize: number, boardRect: DOMRect) => {
        if (reducedMotion) return;
        rows.forEach((r) => {
          const y = boardRect.top + r * cellSize + cellSize / 2;
          const startX = boardRect.left;
          const endX = boardRect.right;
          // Spawn horizontal beam and sparkles
          for (let i = 0; i < 28; i++) {
            const px = startX + Math.random() * (endX - startX);
            particlesRef.current.push({
              x: px,
              y: y + (Math.random() - 0.5) * 8,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 3,
              size: 2 + Math.random() * 3,
              color: '#00f3ff',
              alpha: 1,
              decay: 0.02 + Math.random() * 0.02,
              type: 'spark',
            });
          }
        });

        cols.forEach((c) => {
          const x = boardRect.left + c * cellSize + cellSize / 2;
          const startY = boardRect.top;
          const endY = boardRect.bottom;
          for (let i = 0; i < 28; i++) {
            const py = startY + Math.random() * (endY - startY);
            particlesRef.current.push({
              x: x + (Math.random() - 0.5) * 8,
              y: py,
              vx: (Math.random() - 0.5) * 3,
              vy: (Math.random() - 0.5) * 4,
              size: 2 + Math.random() * 3,
              color: '#ff0077',
              alpha: 1,
              decay: 0.02 + Math.random() * 0.02,
              type: 'spark',
            });
          }
        });
      },

      emitBomb: (x: number, y: number) => {
        if (reducedMotion) return;
        // Shockwave ring
        particlesRef.current.push({
          x,
          y,
          vx: 0,
          vy: 0,
          size: 6,
          color: '#ffaa00',
          alpha: 1,
          decay: 0.035,
          type: 'ring',
        });

        // 40 ember sparks
        for (let i = 0; i < 40; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 2 + Math.random() * 6;
          particlesRef.current.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 3 + Math.random() * 3.5,
            color: Math.random() > 0.5 ? '#ff3b30' : '#ffaa00',
            alpha: 1,
            decay: 0.02 + Math.random() * 0.025,
            type: 'spark',
          });
        }
      },

      emitLightning: (r: number, c: number, cellSize: number, boardRect: DOMRect) => {
        if (reducedMotion) return;
        const centerX = boardRect.left + c * cellSize + cellSize / 2;
        const centerY = boardRect.top + r * cellSize + cellSize / 2;

        for (let i = 0; i < 50; i++) {
          const isRow = Math.random() > 0.5;
          const px = isRow ? boardRect.left + Math.random() * boardRect.width : centerX;
          const py = !isRow ? boardRect.top + Math.random() * boardRect.height : centerY;
          particlesRef.current.push({
            x: px + (Math.random() - 0.5) * 12,
            y: py + (Math.random() - 0.5) * 12,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            size: 3 + Math.random() * 3,
            color: '#a855f7',
            alpha: 1,
            decay: 0.03,
            type: 'spark',
          });
        }
      },

      emitCelebration: () => {
        if (reducedMotion) return;
        const width = window.innerWidth;
        const height = window.innerHeight;
        const colors = ['#00f3ff', '#ff0077', '#00ff88', '#ffd700', '#a855f7'];

        for (let i = 0; i < 90; i++) {
          particlesRef.current.push({
            x: width * 0.5 + (Math.random() - 0.5) * 200,
            y: height * 0.5 + (Math.random() - 0.5) * 100,
            vx: (Math.random() - 0.5) * 12,
            vy: -4 - Math.random() * 8,
            size: 4 + Math.random() * 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 1,
            decay: 0.012 + Math.random() * 0.01,
            type: 'confetti',
            width: 8 + Math.random() * 6,
            height: 5 + Math.random() * 4,
            rotation: Math.random() * Math.PI,
            vRot: (Math.random() - 0.5) * 0.2,
          });
        }
      },
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      resize();
      window.addEventListener('resize', resize);

      let lastTime = performance.now();

      const loop = (currentTime: number) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update & draw particles
        const particles = particlesRef.current;
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.alpha -= p.decay;

          if (p.type === 'spark') {
            p.vx *= 0.94;
            p.vy *= 0.94;
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 8;
            ctx.shadowColor = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          } else if (p.type === 'ring') {
            p.size += 4.5;
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 3;
            ctx.shadowBlur = 12;
            ctx.shadowColor = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          } else if (p.type === 'confetti') {
            p.vy += 0.2; // gravity
            p.rotation = (p.rotation || 0) + (p.vRot || 0.05);
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.fillStyle = p.color;
            ctx.fillRect(-(p.width || 6) / 2, -(p.height || 4) / 2, p.width || 6, p.height || 4);
            ctx.restore();
          }

          if (p.alpha <= 0) {
            particles.splice(i, 1);
          }
        }

        animFrameRef.current = requestAnimationFrame(loop);
      };

      animFrameRef.current = requestAnimationFrame(loop);

      return () => {
        window.removeEventListener('resize', resize);
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      };
    }, []);

    return (
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-40"
        aria-hidden="true"
      />
    );
  }
);

ParticleCanvas.displayName = 'ParticleCanvas';
