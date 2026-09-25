import { useState, useEffect, useCallback, useRef } from 'react';
import {
  BoardCell,
  GameMode,
  Piece,
  PlayerStats,
  PowerupInventory,
  PowerupType,
  FloatingNotification,
  GameSettings,
  SpecialCellType,
  LeaderboardEntry,
  Achievement,
  Mission,
} from '../types/game';
import {
  createEmptyBoard,
  createSpecialBoard,
  canPlacePiece,
  detectCompletedLines,
  calculateScore,
  applyBombEffect,
  applyLightningEffect,
  applyHammerEffect,
  getOccupancyRatio,
  hasAnyLegalMove,
  BOARD_SIZE,
} from '../game/boardLogic';
import { generatePieceSet, rotateMatrix } from '../game/shapes';
import { sound } from '../audio/soundEngine';
import { INITIAL_ACHIEVEMENTS } from '../data/achievements';
import { INITIAL_MISSIONS } from '../data/missions';
import { THEMES } from '../data/themes';

const STORAGE_KEYS = {
  STATS: 'blockverse_neon_stats_v1',
  SETTINGS: 'blockverse_neon_settings_v1',
  ACHIEVEMENTS: 'blockverse_neon_achievements_v1',
  MISSIONS: 'blockverse_neon_missions_v1',
  COINS: 'blockverse_neon_coins_v1',
  LEVEL: 'blockverse_neon_level_v1',
  XP: 'blockverse_neon_xp_v1',
  LEADERBOARD: 'blockverse_neon_leaderboard_v1',
  FTUX: 'blockverse_neon_ftux_completed_v1',
};

interface UndoSnapshot {
  board: BoardCell[][];
  pieces: Piece[];
  score: number;
  combo: number;
  lines: number;
}

export function useGameState() {
  // Game settings
  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      soundVolume: 0.8,
      musicVolume: 0.5,
      soundEnabled: true,
      musicEnabled: true,
      hapticsEnabled: true,
      screenShake: true,
      reducedMotion: false,
      colorBlindMode: false,
      highContrast: false,
      themeId: 'cyber_neon',
    };
  });

  // Game mode
  const [mode, setMode] = useState<GameMode>('classic');

  // Core gameplay state
  const [board, setBoard] = useState<BoardCell[][]>(() => createEmptyBoard());
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [linesCleared, setLinesCleared] = useState<number>(0);
  const [highestComboThisRun, setHighestComboThisRun] = useState<number>(0);
  const [blocksPlacedThisRun, setBlocksPlacedThisRun] = useState<number>(0);
  const [perfectClearsThisRun, setPerfectClearsThisRun] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [screenShakeActive, setScreenShakeActive] = useState<boolean>(false);

  // Undo stack (3 undo tokens per run)
  const [undoTokens, setUndoTokens] = useState<number>(3);
  const undoStackRef = useRef<UndoSnapshot[]>([]);

  // Time Attack / Blitz timer state
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [movesLeft, setMovesLeft] = useState<number>(25); // For Daily Challenge

  // Powerup inventory & active targeting state
  const [powerups, setPowerups] = useState<PowerupInventory>({
    hammer: 2,
    bomb: 2,
    lightning: 1,
    shuffle: 3,
  });
  const [activePowerup, setActivePowerup] = useState<PowerupType | null>(null);

  // Progression: Level, XP, Coins
  const [level, setLevel] = useState<number>(() => {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.LEVEL);
      if (val) return Math.max(1, parseInt(val, 10));
    } catch {}
    return 1;
  });
  const [xp, setXp] = useState<number>(() => {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.XP);
      if (val) return Math.max(0, parseInt(val, 10));
    } catch {}
    return 0;
  });
  const [coins, setCoins] = useState<number>(() => {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.COINS);
      if (val) return parseInt(val, 10);
    } catch {}
    return 150;
  });

  // Stats & Streaks
  const [stats, setStats] = useState<PlayerStats>(() => {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.STATS);
      if (val) return JSON.parse(val);
    } catch {}
    return {
      gamesPlayed: 0,
      totalScore: 0,
      bestScore: 0,
      bestScoreByMode: {
        classic: 0,
        zen: 0,
        time_attack: 0,
        blitz: 0,
        daily: 0,
        boss: 0,
      },
      totalLinesCleared: 0,
      maxCombo: 0,
      perfectClears: 0,
      blocksPlaced: 0,
      powerupsUsed: 0,
      currentStreak: 1,
      lastPlayedDate: new Date().toISOString().slice(0, 10),
    };
  });

  // Achievements & Missions
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      if (val) return JSON.parse(val);
    } catch {}
    return INITIAL_ACHIEVEMENTS;
  });

  const [missions, setMissions] = useState<Mission[]>(() => {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.MISSIONS);
      if (val) return JSON.parse(val);
    } catch {}
    return INITIAL_MISSIONS;
  });

  // Local Leaderboard
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
      if (val) return JSON.parse(val);
    } catch {}
    return [
      { id: '1', playerName: 'NeonRacer', score: 18450, mode: 'classic', lines: 48, maxCombo: 5, date: 'Today' },
      { id: '2', playerName: 'CyberGhost', score: 14200, mode: 'classic', lines: 36, maxCombo: 4, date: 'Yesterday' },
      { id: '3', playerName: 'MatrixPilot', score: 9800, mode: 'blitz', lines: 28, maxCombo: 3, date: '3 days ago' },
    ];
  });

  // Floating notifications
  const [floatingTexts, setFloatingTexts] = useState<FloatingNotification[]>([]);

  // First time user experience check
  const [showTutorial, setShowTutorial] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.FTUX) !== 'true';
    } catch {
      return false;
    }
  });

  // Sync settings with SoundEngine
  useEffect(() => {
    sound.updateSettings(
      settings.soundVolume,
      settings.musicVolume,
      settings.soundEnabled,
      settings.musicEnabled,
      settings.hapticsEnabled
    );
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  // Persist Progression
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LEVEL, level.toString());
      localStorage.setItem(STORAGE_KEYS.XP, xp.toString());
      localStorage.setItem(STORAGE_KEYS.COINS, coins.toString());
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
      localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
      localStorage.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(missions));
      localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(leaderboard));
    } catch {}
  }, [level, xp, coins, stats, achievements, missions, leaderboard]);

  // Check play streak on mount
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    if (stats.lastPlayedDate !== today) {
      const last = new Date(stats.lastPlayedDate);
      const now = new Date(today);
      const diffDays = Math.round((now.getTime() - last.getTime()) / (1000 * 3600 * 24));

      setStats((prev) => ({
        ...prev,
        currentStreak: diffDays === 1 ? prev.currentStreak + 1 : 1,
        lastPlayedDate: today,
      }));
    }
  }, []);

  // Timer loop for Time Attack and Blitz
  useEffect(() => {
    if (gameOver || isPaused || (mode !== 'time_attack' && mode !== 'blitz')) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          triggerGameOver();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameOver, isPaused, mode]);

  // Helper to add floating texts
  const addFloatingText = useCallback(
    (text: string, type: FloatingNotification['type'] = 'score', subtext?: string, x?: number, y?: number, color?: string) => {
      const id = `${Date.now()}_${Math.random()}`;
      setFloatingTexts((prev) => [...prev, { id, text, type, subtext, x, y, color }]);
      setTimeout(() => {
        setFloatingTexts((prev) => prev.filter((item) => item.id !== id));
      }, 1600);
    },
    []
  );

  // Trigger screen shake
  const triggerShake = useCallback((mega = false) => {
    if (!settings.screenShake || settings.reducedMotion) return;
    setScreenShakeActive(true);
    setTimeout(() => setScreenShakeActive(false), mega ? 450 : 280);
  }, [settings.screenShake, settings.reducedMotion]);

  // Award XP & Level Up check
  const addXp = useCallback(
    (amount: number) => {
      setXp((prevXp) => {
        const xpForNextLevel = level * 600;
        const total = prevXp + amount;
        if (total >= xpForNextLevel) {
          setLevel((l) => {
            const nextL = l + 1;
            sound.playLevelUp();
            addFloatingText(`LEVEL UP! LVL ${nextL}`, 'level', 'Themes & Bonuses Unlocked!');
            setCoins((c) => c + 100);
            return nextL;
          });
          return total - xpForNextLevel;
        }
        return total;
      });
    },
    [level, addFloatingText]
  );

  // Update Achievement Progress
  const updateAchievement = useCallback((id: string, amount: number, isAbsolute = false) => {
    setAchievements((prev) =>
      prev.map((ach) => {
        if (ach.id !== id || ach.unlocked) return ach;
        const newProgress = isAbsolute ? Math.max(ach.progress, amount) : ach.progress + amount;
        if (newProgress >= ach.maxProgress) {
          sound.playAchievement();
          return { ...ach, progress: ach.maxProgress, unlocked: true };
        }
        return { ...ach, progress: newProgress };
      })
    );
  }, []);

  // Update Mission Progress
  const updateMission = useCallback((id: string, amount: number) => {
    setMissions((prev) =>
      prev.map((m) => {
        if (m.id !== id || m.completed) return m;
        const newProgress = m.progress + amount;
        const completed = newProgress >= m.target;
        return { ...m, progress: Math.min(m.target, newProgress), completed };
      })
    );
  }, []);

  // Claim Mission Reward
  const claimMissionReward = useCallback((missionId: string) => {
    setMissions((prev) =>
      prev.map((m) => {
        if (m.id === missionId && m.completed && !m.claimed) {
          addXp(m.rewardXp);
          setCoins((c) => c + m.rewardCoins);
          sound.playSnap();
          return { ...m, claimed: true };
        }
        return m;
      })
    );
  }, [addXp]);

  // Start new game
  const startNewGame = useCallback(
    (newMode: GameMode = mode) => {
      setMode(newMode);
      const occupancy = 0.1;
      const initialBoard =
        newMode === 'boss' || newMode === 'daily'
          ? createSpecialBoard(newMode)
          : createEmptyBoard();

      setBoard(initialBoard);
      const newPieces = generatePieceSet(level, occupancy, newMode !== 'zen');
      setPieces(newPieces);
      setSelectedPieceId(null);
      setScore(0);
      setCombo(0);
      setLinesCleared(0);
      setHighestComboThisRun(0);
      setBlocksPlacedThisRun(0);
      setPerfectClearsThisRun(0);
      setGameOver(false);
      setIsPaused(false);
      setActivePowerup(null);
      setUndoTokens(newMode === 'zen' ? 99 : 3);
      undoStackRef.current = [];

      if (newMode === 'time_attack' || newMode === 'blitz') {
        setTimeLeft(60);
      }
      if (newMode === 'daily') {
        setMovesLeft(25);
      }

      setStats((prev) => ({ ...prev, gamesPlayed: prev.gamesPlayed + 1 }));
      sound.playClick();
    },
    [mode, level]
  );

  // Trigger Game Over
  const triggerGameOver = useCallback(() => {
    setGameOver(true);
    sound.playGameOver();

    // Check if new best
    const isNewBest = score > (stats.bestScoreByMode[mode] || 0);

    setStats((prev) => {
      const modeBest = Math.max(prev.bestScoreByMode[mode] || 0, score);
      return {
        ...prev,
        totalScore: prev.totalScore + score,
        bestScore: Math.max(prev.bestScore, score),
        bestScoreByMode: {
          ...prev.bestScoreByMode,
          [mode]: modeBest,
        },
      };
    });

    if (isNewBest && score > 0) {
      addFloatingText('NEW PERSONAL BEST!', 'perfect');
    }

    // Add to local leaderboard
    if (score > 500) {
      const newEntry: LeaderboardEntry = {
        id: Date.now().toString(),
        playerName: 'You',
        score,
        mode,
        lines: linesCleared,
        maxCombo: highestComboThisRun,
        date: 'Today',
      };
      setLeaderboard((prev) => [newEntry, ...prev].sort((a, b) => b.score - a.score).slice(0, 20));
    }

    // Award XP based on run score
    const runXp = Math.floor(score / 25) + linesCleared * 15;
    addXp(runXp);
  }, [score, stats.bestScoreByMode, mode, linesCleared, highestComboThisRun, addFloatingText, addXp]);

  // Undo last move
  const triggerUndo = useCallback(() => {
    if (undoTokens <= 0 || undoStackRef.current.length === 0 || gameOver) {
      sound.playInvalid();
      return;
    }

    const last = undoStackRef.current.pop();
    if (!last) return;

    setBoard(last.board);
    setPieces(last.pieces);
    setScore(last.score);
    setCombo(last.combo);
    setLinesCleared(last.lines);
    setUndoTokens((prev) => prev - 1);
    setSelectedPieceId(null);

    sound.playPickup();
    addFloatingText('MOVE UNDONE', 'score');
  }, [undoTokens, gameOver, addFloatingText]);

  // Rotate piece in tray
  const rotatePieceInTray = useCallback(
    (pieceId: string) => {
      setPieces((prev) =>
        prev.map((p) => {
          if (p.id === pieceId) {
            sound.playRotate();
            return {
              ...p,
              shape: rotateMatrix(p.shape),
              rotation: (p.rotation + 90) % 360,
            };
          }
          return p;
        })
      );
    },
    []
  );

  // Powerup Activation: Hammer, Bomb, Lightning, Shuffle
  const usePowerup = useCallback(
    (type: PowerupType) => {
      if (powerups[type] <= 0 || gameOver) {
        sound.playInvalid();
        return;
      }

      if (type === 'shuffle') {
        const occ = getOccupancyRatio(board);
        setPieces(generatePieceSet(level, occ, true));
        setPowerups((prev) => ({ ...prev, shuffle: prev.shuffle - 1 }));
        setStats((prev) => ({ ...prev, powerupsUsed: prev.powerupsUsed + 1 }));
        sound.playSnap();
        addFloatingText('PIECES SHUFFLED!', 'score');
        updateAchievement('power_surge', 1);
        return;
      }

      // Targeting powerup
      if (activePowerup === type) {
        setActivePowerup(null);
      } else {
        setActivePowerup(type);
        sound.playPickup();
      }
    },
    [powerups, gameOver, board, level, activePowerup, addFloatingText, updateAchievement]
  );

  // Apply powerup on a clicked cell (Hammer or Bomb)
  const applyPowerupOnCell = useCallback(
    (r: number, c: number, boardRect?: DOMRect) => {
      if (!activePowerup) return false;

      let newBoard = board;
      let clearedCount = 0;

      if (activePowerup === 'hammer') {
        const res = applyHammerEffect(r, c, board);
        newBoard = res.newBoard;
        clearedCount = res.clearedCoords.length;
        sound.playHammer();
        addFloatingText('CELL SMASHED!', 'score');
      } else if (activePowerup === 'bomb') {
        const res = applyBombEffect(r, c, board);
        newBoard = res.newBoard;
        clearedCount = res.clearedCoords.length;
        sound.playBomb();
        triggerShake(true);
        addFloatingText('BOMB DETONATED!', 'mega');
      } else if (activePowerup === 'lightning') {
        const res = applyLightningEffect(r, c, board);
        newBoard = res.newBoard;
        clearedCount = res.clearedCoords.length;
        sound.playLightning();
        triggerShake(true);
        addFloatingText('LIGHTNING STRIKE!', 'mega');
      }

      if (clearedCount > 0) {
        setBoard(newBoard);
        setPowerups((prev) => ({ ...prev, [activePowerup]: prev[activePowerup] - 1 }));
        setStats((prev) => ({ ...prev, powerupsUsed: prev.powerupsUsed + 1 }));
        updateAchievement('power_surge', 1);
        setActivePowerup(null);
        return true;
      }

      return false;
    },
    [activePowerup, board, triggerShake, addFloatingText, updateAchievement]
  );

  // Core Move Logic: Place piece on board at row, col
  const placePiece = useCallback(
    (
      pieceId: string,
      targetRow: number,
      targetCol: number,
      boardRect?: DOMRect,
      particleTrigger?: {
        emitPlacement: (x: number, y: number, color: string) => void;
        emitLineClear: (rows: number[], cols: number[], cellSize: number, boardRect: DOMRect) => void;
        emitBomb: (x: number, y: number) => void;
        emitLightning: (r: number, c: number, cellSize: number, boardRect: DOMRect) => void;
        emitCelebration: () => void;
      }
    ) => {
      const piece = pieces.find((p) => p.id === pieceId);
      if (!piece) return false;

      if (!canPlacePiece(piece.shape, targetRow, targetCol, board)) {
        sound.playInvalid();
        return false;
      }

      // Save snapshot for Undo
      undoStackRef.current.push({
        board: board.map((row) => row.map((cell) => ({ ...cell }))),
        pieces: [...pieces],
        score,
        combo,
        lines: linesCleared,
      });
      if (undoStackRef.current.length > 5) undoStackRef.current.shift();

      // Stamp piece onto new board
      const newBoard: BoardCell[][] = board.map((row) => row.map((cell) => ({ ...cell })));
      const shapeRows = piece.shape.length;
      const shapeCols = piece.shape[0].length;
      let cellsPlacedCount = 0;

      for (let r = 0; r < shapeRows; r++) {
        for (let c = 0; c < shapeCols; c++) {
          if (piece.shape[r][c] === 1) {
            const bR = targetRow + r;
            const bC = targetCol + c;
            newBoard[bR][bC] = {
              filled: true,
              color: piece.color,
              type: piece.specialType || 'normal',
            };
            cellsPlacedCount++;

            if (boardRect && particleTrigger) {
              const cellSize = boardRect.width / BOARD_SIZE;
              const px = boardRect.left + bC * cellSize + cellSize / 2;
              const py = boardRect.top + bR * cellSize + cellSize / 2;
              particleTrigger.emitPlacement(px, py, piece.color);
            }
          }
        }
      }

      sound.playSnap();

      // Handle special block triggers
      if (piece.specialType === 'bomb') {
        const bombResult = applyBombEffect(targetRow, targetCol, newBoard);
        newBoard.splice(0, newBoard.length, ...bombResult.newBoard);
        sound.playBomb();
        triggerShake(true);
        if (boardRect && particleTrigger) {
          const cellSize = boardRect.width / BOARD_SIZE;
          const px = boardRect.left + targetCol * cellSize + cellSize / 2;
          const py = boardRect.top + targetRow * cellSize + cellSize / 2;
          particleTrigger.emitBomb(px, py);
        }
      } else if (piece.specialType === 'lightning') {
        const lightResult = applyLightningEffect(targetRow, targetCol, newBoard);
        newBoard.splice(0, newBoard.length, ...lightResult.newBoard);
        sound.playLightning();
        triggerShake(true);
        if (boardRect && particleTrigger) {
          const cellSize = boardRect.width / BOARD_SIZE;
          particleTrigger.emitLightning(targetRow, targetCol, cellSize, boardRect);
        }
      }

      // Detect completed lines
      const { rows, cols, cellsToClear } = detectCompletedLines(newBoard);
      const totalLinesCleared = rows.length + cols.length;

      let nextCombo = combo;
      let isPerfectClear = false;

      if (totalLinesCleared > 0) {
        nextCombo = combo + 1;
        setCombo(nextCombo);
        setHighestComboThisRun((prev) => Math.max(prev, nextCombo));
        sound.playLineClear(totalLinesCleared, nextCombo);
        triggerShake(totalLinesCleared >= 3);

        // Clear detected cells
        cellsToClear.forEach(({ r, c }) => {
          const target = newBoard[r][c];
          if (target.type === 'ice' && target.hitsNeeded && target.hitsNeeded > 1) {
            // Ice cracks on 1st clear, shatters on 2nd
            target.hitsNeeded -= 1;
            target.color = '#a5f3fc';
          } else {
            newBoard[r][c] = { filled: false, type: 'normal' };
          }
        });

        // Trigger line clear particles
        if (boardRect && particleTrigger) {
          const cellSize = boardRect.width / BOARD_SIZE;
          particleTrigger.emitLineClear(rows, cols, cellSize, boardRect);
        }

        // Check Perfect Clear (is board completely empty?)
        isPerfectClear = newBoard.every((row) => row.every((c) => !c.filled));
        if (isPerfectClear) {
          sound.playPerfectClear();
          if (particleTrigger) particleTrigger.emitCelebration();
          addFloatingText('PERFECT CLEAR!', 'perfect', '+5,000 Bonus Pts!');
          setPerfectClearsThisRun((p) => p + 1);
          setStats((prev) => ({ ...prev, perfectClears: prev.perfectClears + 1 }));
          updateAchievement('perfect_cleanse', 1, true);
        } else if (totalLinesCleared >= 4) {
          addFloatingText('LEGENDARY BLAST!', 'mega', `x${nextCombo} COMBO!`);
        } else if (totalLinesCleared === 3) {
          addFloatingText('TRIPLE CLEAR!', 'mega', `x${nextCombo} COMBO!`);
        } else if (totalLinesCleared === 2) {
          addFloatingText('DOUBLE CLEAR!', 'combo', `x${nextCombo} COMBO!`);
        } else if (nextCombo > 1) {
          addFloatingText(`COMBO x${nextCombo}!`, 'combo');
        }

        // Mode specific bonuses: Time Attack adds +3s per line
        if (mode === 'time_attack') {
          setTimeLeft((t) => Math.min(99, t + totalLinesCleared * 3));
        }

        // Update missions & achievements
        updateMission('m_clear_lines', totalLinesCleared);
        if (nextCombo >= 3) updateMission('m_reach_combo', nextCombo);
        if (totalLinesCleared >= 2) updateMission('m_double_clear', 1);
        updateAchievement('first_blast', 1);
        if (nextCombo >= 4) updateAchievement('combo_master', nextCombo, true);
        if (totalLinesCleared >= 3) updateAchievement('triple_threat', totalLinesCleared, true);
        updateAchievement('century_club', totalLinesCleared);
      } else {
        // Reset combo on non-clearing move
        setCombo(0);
      }

      // Calculate earned score
      const { totalEarned } = calculateScore({
        cellsPlaced: cellsPlacedCount,
        linesCleared: totalLinesCleared,
        comboCount: nextCombo,
        isPerfectClear,
      });

      const updatedScore = score + totalEarned;
      setScore(updatedScore);
      setLinesCleared((l) => l + totalLinesCleared);
      setBlocksPlacedThisRun((b) => b + 1);

      // Score notification popup
      addFloatingText(`+${totalEarned}`, 'score');

      // Update missions & achievements with score
      updateMission('m_score_run', updatedScore);
      updateMission('m_place_pieces', 1);
      updateAchievement('block_architect', 1);
      if (updatedScore >= 10000) updateAchievement('high_roller', updatedScore, true);

      // Daily Challenge move decrement
      if (mode === 'daily') {
        setMovesLeft((m) => {
          const nextMoves = m - 1;
          if (nextMoves <= 0 && updatedScore < 3500) {
            triggerGameOver();
          } else if (updatedScore >= 3500) {
            addFloatingText('DAILY CHALLENGE WON!', 'perfect');
            updateAchievement('daily_champion', 1);
          }
          return nextMoves;
        });
      }

      // Remove placed piece from tray
      const remainingPieces = pieces.filter((p) => p.id !== pieceId);
      setSelectedPieceId(null);

      // If tray is empty, generate 3 fresh pieces
      let currentTray = remainingPieces;
      if (remainingPieces.length === 0) {
        const occ = getOccupancyRatio(newBoard);
        currentTray = generatePieceSet(level, occ, mode !== 'zen');
        setPieces(currentTray);
      } else {
        setPieces(remainingPieces);
      }

      setBoard(newBoard);

      // Check for Game Over: if NO piece in tray can fit anywhere
      const canMakeAnyMove = hasAnyLegalMove(currentTray, newBoard);
      if (!canMakeAnyMove && mode !== 'zen') {
        // Give a brief moment for player to see board settling
        setTimeout(() => {
          triggerGameOver();
        }, 500);
      }

      return true;
    },
    [
      pieces,
      board,
      score,
      combo,
      linesCleared,
      level,
      mode,
      triggerShake,
      addFloatingText,
      updateMission,
      updateAchievement,
      triggerGameOver,
    ]
  );

  return {
    mode,
    setMode,
    board,
    pieces,
    selectedPieceId,
    setSelectedPieceId,
    score,
    combo,
    linesCleared,
    highestComboThisRun,
    blocksPlacedThisRun,
    perfectClearsThisRun,
    gameOver,
    isPaused,
    setIsPaused,
    screenShakeActive,
    undoTokens,
    timeLeft,
    movesLeft,
    powerups,
    activePowerup,
    level,
    xp,
    coins,
    stats,
    achievements,
    missions,
    leaderboard,
    settings,
    setSettings,
    floatingTexts,
    showTutorial,
    setShowTutorial,
    startNewGame,
    placePiece,
    rotatePieceInTray,
    triggerUndo,
    usePowerup,
    applyPowerupOnCell,
    claimMissionReward,
  };
}
