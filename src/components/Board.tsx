import React, { useRef, useState, useCallback, useEffect } from 'react';
import { BoardCell, Piece, PowerupType, ThemeConfig } from '../types/game';
import { BOARD_SIZE, canPlacePiece } from '../game/boardLogic';
import { Bomb, Zap, Sparkles, ShieldAlert } from 'lucide-react';

interface Props {
  board: BoardCell[][];
  selectedPiece: Piece | null;
  draggedPiece: Piece | null;
  dragOffset: { x: number; y: number } | null;
  activePowerup: PowerupType | null;
  theme: ThemeConfig;
  colorBlindMode: boolean;
  onCellClick: (row: number, col: number) => void;
  onPlacePiece: (pieceId: string, row: number, col: number, boardRect: DOMRect) => boolean;
  onHoverCellChange?: (pos: { r: number; c: number } | null) => void;
}

export const Board: React.FC<Props> = ({
  board,
  selectedPiece,
  draggedPiece,
  activePowerup,
  theme,
  colorBlindMode,
  onCellClick,
  onPlacePiece,
  onHoverCellChange,
}) => {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const [hoverPos, setHoverPos] = useState<{ r: number; c: number } | null>(null);

  const activePiece = draggedPiece || selectedPiece;

  // Calculate grid cell from pointer coordinates
  const getCellFromCoords = useCallback((clientX: number, clientY: number) => {
    if (!boardRef.current) return null;
    const rect = boardRef.current.getBoundingClientRect();
    if (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    ) {
      return null;
    }

    const cellSize = rect.width / BOARD_SIZE;
    const col = Math.floor((clientX - rect.left) / cellSize);
    const row = Math.floor((clientY - rect.top) / cellSize);

    if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE) {
      return { r: row, c: col };
    }
    return null;
  }, []);

  // Pointer move tracking for previews
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activePiece && !activePowerup) {
      if (hoverPos) {
        setHoverPos(null);
        if (onHoverCellChange) onHoverCellChange(null);
      }
      return;
    }

    const cell = getCellFromCoords(e.clientX, e.clientY);
    if (!cell && hoverPos) {
      setHoverPos(null);
      if (onHoverCellChange) onHoverCellChange(null);
    } else if (cell && (!hoverPos || hoverPos.r !== cell.r || hoverPos.c !== cell.c)) {
      setHoverPos(cell);
      if (onHoverCellChange) onHoverCellChange(cell);
    }
  };

  const handlePointerLeave = () => {
    setHoverPos(null);
    if (onHoverCellChange) onHoverCellChange(null);
  };

  const handleCellPointerUp = (r: number, c: number) => {
    if (activePowerup) {
      onCellClick(r, c);
      return;
    }

    if (activePiece && boardRef.current) {
      const rect = boardRef.current.getBoundingClientRect();
      onPlacePiece(activePiece.id, r, c, rect);
    }
  };

  // Check if cell is part of current placement preview
  const isPreviewCell = (r: number, c: number) => {
    if (!activePiece || !hoverPos) return { isPreview: false, isValid: false };

    const shape = activePiece.shape;
    const pR = r - hoverPos.r;
    const pC = c - hoverPos.c;

    if (pR >= 0 && pR < shape.length && pC >= 0 && pC < shape[0].length && shape[pR][pC] === 1) {
      const isValid = canPlacePiece(shape, hoverPos.r, hoverPos.c, board);
      return { isPreview: true, isValid };
    }

    return { isPreview: false, isValid: false };
  };

  // Color-blind glyph mapping
  const getColorBlindGlyph = (color?: string, type?: string) => {
    if (type === 'ice') return '❄';
    if (type === 'stone') return '■';
    if (!color) return null;
    if (color.includes('243') || color.includes('cyan')) return '▲';
    if (color.includes('255, 0') || color.includes('magenta')) return '◆';
    if (color.includes('255, 136') || color.includes('00ff88')) return '★';
    if (color.includes('255, 170') || color.includes('amber')) return '●';
    if (color.includes('168') || color.includes('purple')) return '✚';
    return '■';
  };

  return (
    <div className="w-full max-w-[420px] sm:max-w-[460px] mx-auto px-3 py-1 flex items-center justify-center select-none">
      <div
        ref={boardRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="relative w-full aspect-square p-2.5 rounded-2xl glass-panel shadow-2xl transition-all duration-300 touch-none select-none"
        style={{
          backgroundColor: theme.boardBg,
          boxShadow: `0 12px 40px rgba(0, 0, 0, 0.6), 0 0 30px ${theme.accentGlow}`,
          borderColor: theme.gridLine,
        }}
      >
        {/* 10x10 Grid */}
        <div
          className="grid gap-1 sm:gap-1.5 w-full h-full"
          style={{
            gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
          }}
        >
          {board.map((row, r) =>
            row.map((cell, c) => {
              const { isPreview, isValid } = isPreviewCell(r, c);
              const glyph = colorBlindMode ? getColorBlindGlyph(cell.color, cell.type) : null;

              // Cell Background & Shadows
              let bg = 'rgba(255, 255, 255, 0.03)';
              let border = '1px solid rgba(255, 255, 255, 0.04)';
              let boxShadow = 'none';

              if (cell.filled) {
                bg = cell.color || theme.accent;
                boxShadow = `0 0 12px ${cell.color || theme.accent}66, inset 0 1.5px 1px rgba(255,255,255,0.4), inset 0 -1.5px 2px rgba(0,0,0,0.5)`;
                border = 'none';
              } else if (cell.type === 'multiplier') {
                bg = 'rgba(234, 179, 8, 0.12)';
                border = '1px dashed rgba(234, 179, 8, 0.4)';
              }

              if (isPreview) {
                if (isValid) {
                  bg = activePiece ? `${activePiece.color}99` : 'rgba(0, 243, 255, 0.5)';
                  boxShadow = `0 0 16px ${activePiece?.color || '#00f3ff'}, inset 0 0 8px rgba(255,255,255,0.6)`;
                  border = '1px solid rgba(255, 255, 255, 0.8)';
                } else {
                  bg = 'rgba(239, 68, 68, 0.45)';
                  border = '1px solid rgba(239, 68, 68, 0.8)';
                  boxShadow = '0 0 10px rgba(239, 68, 68, 0.4)';
                }
              }

              // Powerup targeting hover
              const isTargetedByPowerup =
                hoverPos &&
                hoverPos.r === r &&
                hoverPos.c === c &&
                activePowerup !== null;

              return (
                <div
                  key={`${r}-${c}`}
                  onPointerUp={() => handleCellPointerUp(r, c)}
                  className={`relative rounded-[5px] sm:rounded-md flex items-center justify-center cursor-pointer transition-transform duration-100 ${
                    cell.filled ? 'neon-block-bevel scale-[0.98]' : 'hover:bg-white/[0.06]'
                  } ${isTargetedByPowerup ? 'ring-2 ring-yellow-400 animate-pulse' : ''}`}
                  style={{
                    backgroundColor: bg,
                    border,
                    boxShadow,
                  }}
                >
                  {/* Color-blind Glyph */}
                  {glyph && cell.filled && (
                    <span className="text-[10px] sm:text-xs font-bold text-black/75 drop-shadow-sm select-none">
                      {glyph}
                    </span>
                  )}

                  {/* Special Cell Icons */}
                  {cell.type === 'bomb' && (
                    <Bomb size={14} className="text-black drop-shadow animate-pulse" />
                  )}
                  {cell.type === 'lightning' && (
                    <Zap size={14} className="text-black drop-shadow animate-pulse" />
                  )}
                  {cell.type === 'rainbow' && (
                    <Sparkles size={14} className="text-white drop-shadow animate-spin" />
                  )}
                  {cell.type === 'ice' && (
                    <span className="text-[10px] font-black text-cyan-900 select-none">
                      {cell.hitsNeeded === 2 ? '❄❄' : '❄'}
                    </span>
                  )}
                  {cell.type === 'multiplier' && !cell.filled && (
                    <span className="text-[9px] font-black text-yellow-400 select-none">
                      {cell.multiplier}X
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
