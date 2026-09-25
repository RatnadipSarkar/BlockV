import React, { useRef, useState, useEffect } from 'react';
import { Piece } from '../types/game';
import { RotateCw, Sparkles, Zap, Bomb } from 'lucide-react';
import { sound } from '../audio/soundEngine';

interface Props {
  pieces: Piece[];
  selectedPieceId: string | null;
  onSelectPiece: (pieceId: string | null) => void;
  onRotatePiece: (pieceId: string) => void;
  onDragStart: (piece: Piece, clientX: number, clientY: number) => void;
  onDragMove: (clientX: number, clientY: number) => void;
  onDragEnd: (clientX: number, clientY: number) => void;
}

export const PieceTray: React.FC<Props> = ({
  pieces,
  selectedPieceId,
  onSelectPiece,
  onRotatePiece,
  onDragStart,
  onDragMove,
  onDragEnd,
}) => {
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const dragPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Handle pointer down on piece
  const handlePointerDown = (e: React.PointerEvent, piece: Piece) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setActiveDragId(piece.id);
    dragPosRef.current = { x: e.clientX, y: e.clientY };
    sound.playPickup();
    onDragStart(piece, e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeDragId) return;
    dragPosRef.current = { x: e.clientX, y: e.clientY };
    onDragMove(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!activeDragId) return;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    setActiveDragId(null);
    onDragEnd(e.clientX, e.clientY);
  };

  return (
    <div className="w-full max-w-[460px] mx-auto px-4 py-2 z-20">
      <div className="grid grid-cols-3 gap-2 sm:gap-3 h-28 sm:h-32">
        {pieces.map((piece, idx) => {
          const isSelected = selectedPieceId === piece.id;
          const isDragging = activeDragId === piece.id;
          const rows = piece.shape.length;
          const cols = piece.shape[0].length;

          return (
            <div
              key={piece.id}
              onPointerDown={(e) => handlePointerDown(e, piece)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onClick={() => {
                if (!isDragging) {
                  onSelectPiece(isSelected ? null : piece.id);
                  sound.playPickup();
                }
              }}
              className={`relative rounded-xl p-2 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing transition-all select-none touch-none ${
                isSelected
                  ? 'bg-cyan-500/15 border-2 border-cyan-400 shadow-[0_0_15px_rgba(0,243,255,0.3)]'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] border border-white/10'
              } ${isDragging ? 'opacity-30 scale-95' : 'hover:scale-[1.02]'}`}
            >
              {/* Rotate Button (Hover/Touch) */}
              <button
                type="button"
                aria-label={`Rotate piece ${idx + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onRotatePiece(piece.id);
                }}
                className="absolute top-1.5 right-1.5 p-1 rounded-md bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all z-10"
              >
                <RotateCw size={12} />
              </button>

              {/* Special Badge Indicator */}
              {piece.specialType && (
                <div className="absolute top-1.5 left-1.5 flex items-center gap-0.5 text-[9px] font-bold px-1 py-0.5 rounded bg-black/40 text-amber-300">
                  {piece.specialType === 'bomb' && <Bomb size={10} />}
                  {piece.specialType === 'lightning' && <Zap size={10} />}
                  {piece.specialType === 'rainbow' && <Sparkles size={10} />}
                </div>
              )}

              {/* Shape Render Matrix */}
              <div
                className="grid gap-0.5 sm:gap-1 pointer-events-none"
                style={{
                  gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
                }}
              >
                {piece.shape.map((row, r) =>
                  row.map((cell, c) => (
                    <div
                      key={`${r}-${c}`}
                      className={`w-4 h-4 sm:w-5 sm:h-5 rounded-[3px] sm:rounded transition-colors ${
                        cell === 1 ? 'neon-block-bevel' : 'opacity-0'
                      }`}
                      style={{
                        backgroundColor: cell === 1 ? piece.color : 'transparent',
                        boxShadow:
                          cell === 1
                            ? `0 0 8px ${piece.color}66, inset 0 1px 1px rgba(255,255,255,0.4)`
                            : 'none',
                      }}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
