import { BoardCell, GameMode, Piece, ShapeMatrix } from '../types/game';

export const BOARD_SIZE = 10;

/**
 * Creates a clean 10x10 empty board
 */
export function createEmptyBoard(size = BOARD_SIZE): BoardCell[][] {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({
      filled: false,
      type: 'normal',
    }))
  );
}

/**
 * Creates obstacle boards for Boss Board and Daily Challenge modes
 */
export function createSpecialBoard(mode: GameMode, dateSeed?: string): BoardCell[][] {
  const board = createEmptyBoard(BOARD_SIZE);

  if (mode === 'boss') {
    // Place Ice cells in corners and center (Ice takes 2 clears to shatter)
    const iceCoords = [
      { r: 2, c: 2 },
      { r: 2, c: 7 },
      { r: 7, c: 2 },
      { r: 7, c: 7 },
      { r: 4, c: 4 },
      { r: 4, c: 5 },
      { r: 5, c: 4 },
      { r: 5, c: 5 },
    ];
    iceCoords.forEach(({ r, c }) => {
      board[r][c] = {
        filled: true,
        type: 'ice',
        hitsNeeded: 2,
        color: '#67e8f9', // icy cyan
      };
    });

    // Multiplier cells (x2 and x3 score!)
    const multCoords = [
      { r: 0, c: 5 },
      { r: 9, c: 4 },
      { r: 4, c: 0 },
      { r: 5, c: 9 },
    ];
    multCoords.forEach(({ r, c }) => {
      board[r][c] = {
        filled: false,
        type: 'multiplier',
        multiplier: 2,
      };
    });
  } else if (mode === 'daily') {
    // Generate deterministic puzzle layout based on date string (e.g. "2026-09-25")
    const seed = (dateSeed || new Date().toISOString().slice(0, 10))
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);

    const patternCount = 6 + (seed % 6);
    for (let i = 0; i < patternCount; i++) {
      const r = (seed * (i + 1) * 7) % BOARD_SIZE;
      const c = (seed * (i + 2) * 11) % BOARD_SIZE;
      if (!board[r][c].filled) {
        board[r][c] = {
          filled: true,
          type: i % 2 === 0 ? 'ice' : 'stone',
          hitsNeeded: i % 2 === 0 ? 2 : 1,
          color: i % 2 === 0 ? '#67e8f9' : '#94a3b8',
        };
      }
    }
  }

  return board;
}

/**
 * Checks if a shape matrix can be placed at board[row][col]
 */
export function canPlacePiece(
  shape: ShapeMatrix,
  row: number,
  col: number,
  board: BoardCell[][]
): boolean {
  const shapeRows = shape.length;
  const shapeCols = shape[0].length;

  // Boundary check
  if (row < 0 || col < 0 || row + shapeRows > BOARD_SIZE || col + shapeCols > BOARD_SIZE) {
    return false;
  }

  for (let r = 0; r < shapeRows; r++) {
    for (let c = 0; c < shapeCols; c++) {
      if (shape[r][c] === 1) {
        const targetCell = board[row + r][col + c];
        if (targetCell.filled) {
          return false;
        }
      }
    }
  }

  return true;
}

/**
 * Checks if a given piece can fit ANYWHERE on the board
 */
export function canFitAnywhere(shape: ShapeMatrix, board: BoardCell[][]): boolean {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (canPlacePiece(shape, r, c, board)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Checks if ANY piece in the tray can fit on the current board
 */
export function hasAnyLegalMove(pieces: Piece[], board: BoardCell[][]): boolean {
  return pieces.some((p) => canFitAnywhere(p.shape, board));
}

/**
 * Scans board for completely filled rows and columns
 */
export function detectCompletedLines(board: BoardCell[][]): {
  rows: number[];
  cols: number[];
  cellsToClear: { r: number; c: number }[];
} {
  const rows: number[] = [];
  const cols: number[] = [];
  const cellMap = new Set<string>();

  // Check rows
  for (let r = 0; r < BOARD_SIZE; r++) {
    let complete = true;
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (!board[r][c].filled) {
        complete = false;
        break;
      }
    }
    if (complete) {
      rows.push(r);
      for (let c = 0; c < BOARD_SIZE; c++) {
        cellMap.add(`${r},${c}`);
      }
    }
  }

  // Check columns
  for (let c = 0; c < BOARD_SIZE; c++) {
    let complete = true;
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (!board[r][c].filled) {
        complete = false;
        break;
      }
    }
    if (complete) {
      cols.push(c);
      for (let r = 0; r < BOARD_SIZE; r++) {
        cellMap.add(`${r},${c}`);
      }
    }
  }

  const cellsToClear: { r: number; c: number }[] = [];
  cellMap.forEach((key) => {
    const [r, c] = key.split(',').map(Number);
    cellsToClear.push({ r, c });
  });

  return { rows, cols, cellsToClear };
}

/**
 * Calculates current board occupancy ratio (0.0 to 1.0)
 */
export function getOccupancyRatio(board: BoardCell[][]): number {
  let filledCount = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c].filled) filledCount++;
    }
  }
  return filledCount / (BOARD_SIZE * BOARD_SIZE);
}

/**
 * Scoring Formula:
 * - base placement points: 10 pts per cell
 * - line clear points: 100 pts per line
 * - simultaneous line multiplier: 1 line = 1x, 2 = 2.5x, 3 = 4x, 4 = 6x, 5+ = 8x
 * - combo multiplier: x1, x2, x3, x4...
 * - perfect clear bonus: +5,000 pts!
 */
export function calculateScore(params: {
  cellsPlaced: number;
  linesCleared: number;
  comboCount: number;
  isPerfectClear: boolean;
  specialCellsHit?: number;
  multiplierBoost?: number;
}): { totalEarned: number; breakdown: { placement: number; lines: number; comboBonus: number; perfectBonus: number } } {
  const { cellsPlaced, linesCleared, comboCount, isPerfectClear, multiplierBoost = 1 } = params;

  const placement = cellsPlaced * 10;
  let lineBase = 0;

  if (linesCleared > 0) {
    const multiFactor =
      linesCleared === 1 ? 1 : linesCleared === 2 ? 2.5 : linesCleared === 3 ? 4.5 : linesCleared === 4 ? 7 : 10;
    lineBase = Math.round(linesCleared * 100 * multiFactor);
  }

  const comboBonus = linesCleared > 0 && comboCount > 1 ? Math.round(lineBase * (comboCount - 1) * 0.5) : 0;
  const perfectBonus = isPerfectClear ? 5000 : 0;

  const totalEarned = Math.round((placement + lineBase + comboBonus + perfectBonus) * multiplierBoost);

  return {
    totalEarned,
    breakdown: {
      placement,
      lines: lineBase,
      comboBonus,
      perfectBonus,
    },
  };
}

/**
 * Clears a 3x3 area around (centerR, centerC)
 */
export function applyBombEffect(
  centerR: number,
  centerC: number,
  board: BoardCell[][]
): { newBoard: BoardCell[][]; clearedCoords: { r: number; c: number }[] } {
  const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));
  const clearedCoords: { r: number; c: number }[] = [];

  for (let r = Math.max(0, centerR - 1); r <= Math.min(BOARD_SIZE - 1, centerR + 1); r++) {
    for (let c = Math.max(0, centerC - 1); c <= Math.min(BOARD_SIZE - 1, centerC + 1); c++) {
      if (newBoard[r][c].filled) {
        newBoard[r][c] = { filled: false, type: 'normal' };
        clearedCoords.push({ r, c });
      }
    }
  }

  return { newBoard, clearedCoords };
}

/**
 * Clears entire row and column at (targetR, targetC)
 */
export function applyLightningEffect(
  targetR: number,
  targetC: number,
  board: BoardCell[][]
): { newBoard: BoardCell[][]; clearedCoords: { r: number; c: number }[] } {
  const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));
  const clearedCoords: { r: number; c: number }[] = [];

  // Row
  for (let c = 0; c < BOARD_SIZE; c++) {
    if (newBoard[targetR][c].filled) {
      newBoard[targetR][c] = { filled: false, type: 'normal' };
      clearedCoords.push({ r: targetR, c });
    }
  }

  // Col
  for (let r = 0; r < BOARD_SIZE; r++) {
    if (newBoard[r][targetC].filled) {
      newBoard[r][targetC] = { filled: false, type: 'normal' };
      clearedCoords.push({ r, c: targetC });
    }
  }

  return { newBoard, clearedCoords };
}

/**
 * Hammer powerup: Destroys single targeted cell
 */
export function applyHammerEffect(
  r: number,
  c: number,
  board: BoardCell[][]
): { newBoard: BoardCell[][]; clearedCoords: { r: number; c: number }[] } {
  const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));
  const clearedCoords: { r: number; c: number }[] = [];

  if (newBoard[r][c].filled) {
    newBoard[r][c] = { filled: false, type: 'normal' };
    clearedCoords.push({ r, c });
  }

  return { newBoard, clearedCoords };
}
