import { Piece, ShapeMatrix, SpecialCellType } from '../types/game';

export const COLOR_PALETTE: Record<string, { hex: string; name: string; glow: string }> = {
  cyan: { hex: '#00f3ff', name: 'Electric Cyan', glow: 'rgba(0, 243, 255, 0.6)' },
  magenta: { hex: '#ff0077', name: 'Hot Magenta', glow: 'rgba(255, 0, 119, 0.6)' },
  green: { hex: '#00ff88', name: 'Neon Lime', glow: 'rgba(0, 255, 136, 0.6)' },
  amber: { hex: '#ffaa00', name: 'Solar Amber', glow: 'rgba(255, 170, 0, 0.6)' },
  purple: { hex: '#a855f7', name: 'Plasma Purple', glow: 'rgba(168, 85, 247, 0.6)' },
  blue: { hex: '#3b82f6', name: 'Cyber Blue', glow: 'rgba(59, 130, 246, 0.6)' },
  rose: { hex: '#f43f5e', name: 'Neon Rose', glow: 'rgba(244, 63, 94, 0.6)' },
  gold: { hex: '#ffd700', name: 'Arcade Gold', glow: 'rgba(255, 215, 0, 0.6)' },
};

export const COLOR_KEYS = Object.keys(COLOR_PALETTE);

export interface ShapeDefinition {
  name: string;
  shape: ShapeMatrix;
  weight: number; // relative frequency (higher = more frequent)
  minLevel: number;
}

export const SHAPE_DEFINITIONS: Record<string, ShapeDefinition> = {
  dot: {
    name: 'Dot',
    shape: [[1]],
    weight: 12,
    minLevel: 1,
  },
  line2: {
    name: 'Line 2',
    shape: [[1, 1]],
    weight: 16,
    minLevel: 1,
  },
  line3: {
    name: 'Line 3',
    shape: [[1, 1, 1]],
    weight: 14,
    minLevel: 1,
  },
  line4: {
    name: 'Line 4',
    shape: [[1, 1, 1, 1]],
    weight: 10,
    minLevel: 1,
  },
  line5: {
    name: 'Line 5',
    shape: [[1, 1, 1, 1, 1]],
    weight: 6,
    minLevel: 2,
  },
  square2: {
    name: 'Square 2x2',
    shape: [
      [1, 1],
      [1, 1],
    ],
    weight: 14,
    minLevel: 1,
  },
  square3: {
    name: 'Square 3x3',
    shape: [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ],
    weight: 4,
    minLevel: 3,
  },
  cornerSmall: {
    name: 'Mini Corner',
    shape: [
      [1, 1],
      [1, 0],
    ],
    weight: 15,
    minLevel: 1,
  },
  cornerBig: {
    name: 'Big Corner',
    shape: [
      [1, 1, 1],
      [1, 0, 0],
      [1, 0, 0],
    ],
    weight: 8,
    minLevel: 2,
  },
  lStandard: {
    name: 'L-Shape',
    shape: [
      [1, 0],
      [1, 0],
      [1, 1],
    ],
    weight: 13,
    minLevel: 1,
  },
  jStandard: {
    name: 'J-Shape',
    shape: [
      [0, 1],
      [0, 1],
      [1, 1],
    ],
    weight: 13,
    minLevel: 1,
  },
  tShape: {
    name: 'T-Shape',
    shape: [
      [1, 1, 1],
      [0, 1, 0],
    ],
    weight: 12,
    minLevel: 1,
  },
  sShape: {
    name: 'S-Shape',
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    weight: 10,
    minLevel: 2,
  },
  zShape: {
    name: 'Z-Shape',
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    weight: 10,
    minLevel: 2,
  },
  cross: {
    name: 'Cross',
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 1, 0],
    ],
    weight: 5,
    minLevel: 3,
  },
  rect2x3: {
    name: 'Rectangle 2x3',
    shape: [
      [1, 1, 1],
      [1, 1, 1],
    ],
    weight: 6,
    minLevel: 2,
  },
  uShape: {
    name: 'U-Shape',
    shape: [
      [1, 0, 1],
      [1, 1, 1],
    ],
    weight: 5,
    minLevel: 3,
  },
  diag2: {
    name: 'Diag 2',
    shape: [
      [1, 0],
      [0, 1],
    ],
    weight: 7,
    minLevel: 2,
  },
};

/**
 * Rotates a 2D matrix 90 degrees clockwise
 */
export function rotateMatrix(matrix: ShapeMatrix): ShapeMatrix {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const result: ShapeMatrix = Array.from({ length: cols }, () => Array(rows).fill(0));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      result[c][rows - 1 - r] = matrix[r][c];
    }
  }

  return result;
}

/**
 * Smart weighted piece generator:
 * - Avoids too many oversized shapes if board is crowded (>60% full)
 * - Introduces complex shapes gradually by player level
 * - Occasionally spawns special powerup blocks (bomb / lightning / rainbow)
 */
export function generatePiece(
  level: number = 1,
  occupancyRatio: number = 0.3,
  allowSpecials: boolean = true
): Piece {
  const eligibleKeys = Object.keys(SHAPE_DEFINITIONS).filter(
    (k) => SHAPE_DEFINITIONS[k].minLevel <= Math.max(1, level)
  );

  let pool: { key: string; weight: number }[] = [];

  eligibleKeys.forEach((key) => {
    let weight = SHAPE_DEFINITIONS[key].weight;
    const shapeSize = SHAPE_DEFINITIONS[key].shape.flat().filter(Boolean).length;

    // Smart balancing: if board is crowded (>60% full), boost small shapes and reduce 3x3/large shapes
    if (occupancyRatio > 0.6) {
      if (shapeSize <= 3) weight *= 2.5;
      else if (shapeSize >= 6) weight *= 0.2;
    } else if (occupancyRatio < 0.25) {
      // If board is very empty, give fun medium and larger shapes
      if (shapeSize >= 4) weight *= 1.3;
    }

    pool.push({ key, weight });
  });

  const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  let chosenKey = pool[0].key;

  for (const item of pool) {
    if (random < item.weight) {
      chosenKey = item.key;
      break;
    }
    random -= item.weight;
  }

  let matrix = SHAPE_DEFINITIONS[chosenKey].shape;

  // Random initial rotation (0, 90, 180, 270)
  const rotationCount = Math.floor(Math.random() * 4);
  for (let i = 0; i < rotationCount; i++) {
    matrix = rotateMatrix(matrix);
  }

  // Random color
  const colorKey = COLOR_KEYS[Math.floor(Math.random() * COLOR_KEYS.length)];
  const color = COLOR_PALETTE[colorKey].hex;

  // Special piece chance (~7% if allowed and player level >= 2)
  let specialType: SpecialCellType | undefined = undefined;
  if (allowSpecials && level >= 2 && Math.random() < 0.08) {
    const specialRoll = Math.random();
    if (specialRoll < 0.45) specialType = 'bomb';
    else if (specialRoll < 0.8) specialType = 'lightning';
    else specialType = 'rainbow';
  }

  return {
    id: `piece_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    shape: matrix,
    color,
    colorKey,
    specialType,
    rotation: rotationCount * 90,
  };
}

/**
 * Generate 3 pieces for the tray, ensuring at least one piece can fit under moderate occupancy
 */
export function generatePieceSet(
  level: number = 1,
  occupancyRatio: number = 0.3,
  allowSpecials: boolean = true
): Piece[] {
  return [
    generatePiece(level, occupancyRatio, allowSpecials),
    generatePiece(level, occupancyRatio, allowSpecials),
    generatePiece(level, occupancyRatio, allowSpecials),
  ];
}
