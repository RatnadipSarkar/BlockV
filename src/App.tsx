import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useGameState } from './hooks/useGameState';
import { ParticleCanvas, ParticleTrigger } from './effects/ParticleCanvas';
import { FloatingTextOverlay } from './effects/FloatingText';
import { HUD } from './components/HUD';
import { Board } from './components/Board';
import { PieceTray } from './components/PieceTray';
import { PowerupBar } from './components/PowerupBar';
import { StartScreen } from './components/StartScreen';
import { GameOverModal } from './components/GameOverModal';
import { PauseModal } from './components/PauseModal';
import { SettingsModal } from './components/SettingsModal';
import { ThemesModal } from './components/ThemesModal';
import { MissionsModal } from './components/MissionsModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { StatsModal } from './components/StatsModal';
import { TutorialModal } from './components/TutorialModal';
import { ModeSelectorModal } from './components/ModeSelectorModal';
import { THEMES } from './data/themes';
import { Piece } from './types/game';
import { sound } from './audio/soundEngine';

export default function App() {
  const {
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
  } = useGameState();

  // Navigation View: 'menu' | 'playing'
  const [currentView, setCurrentView] = useState<'menu' | 'playing'>('menu');

  // Active Modals
  const [modalOpen, setModalOpen] = useState<
    'settings' | 'themes' | 'missions' | 'leaderboard' | 'stats' | 'modes' | null
  >(null);

  // Particle System Ref
  const particleTriggerRef = useRef<ParticleTrigger | null>(null);

  // Active theme lookup
  const currentTheme =
    THEMES.find((t) => t.id === settings.themeId) || THEMES[0];

  // Drag-and-drop state
  const [draggedPiece, setDraggedPiece] = useState<Piece | null>(null);
  const [dragPointerPos, setDragPointerPos] = useState<{ x: number; y: number } | null>(null);
  const boardRectRef = useRef<DOMRect | null>(null);

  // Selected piece object lookup
  const selectedPiece = pieces.find((p) => p.id === selectedPieceId) || null;

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape
      if (e.key === 'Escape') {
        if (modalOpen) {
          setModalOpen(null);
        } else if (currentView === 'playing') {
          setIsPaused((p) => !p);
        }
        return;
      }

      // If in menu or paused, skip play shortcuts
      if (currentView !== 'playing' || isPaused || gameOver) return;

      // Rotate shortcut: R
      if (e.key.toLowerCase() === 'r') {
        const pieceToRotate = selectedPieceId || (pieces.length > 0 ? pieces[0].id : null);
        if (pieceToRotate) {
          rotatePieceInTray(pieceToRotate);
        }
      }

      // Undo shortcut: Z
      if (e.key.toLowerCase() === 'z') {
        triggerUndo();
      }

      // Space = Pause
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPaused(true);
      }

      // 1, 2, 3 = select piece
      if (e.key === '1' && pieces[0]) setSelectedPieceId(pieces[0].id);
      if (e.key === '2' && pieces[1]) setSelectedPieceId(pieces[1].id);
      if (e.key === '3' && pieces[2]) setSelectedPieceId(pieces[2].id);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    currentView,
    modalOpen,
    isPaused,
    gameOver,
    selectedPieceId,
    pieces,
    rotatePieceInTray,
    triggerUndo,
    setIsPaused,
    setSelectedPieceId,
  ]);

  // Handle Drag Start
  const handleDragStart = (piece: Piece, clientX: number, clientY: number) => {
    setDraggedPiece(piece);
    setDragPointerPos({ x: clientX, y: clientY });
    setSelectedPieceId(piece.id);
  };

  // Handle Drag Move
  const handleDragMove = (clientX: number, clientY: number) => {
    setDragPointerPos({ x: clientX, y: clientY });
  };

  // Handle Drag End: attempt drop on board if hovering valid cell
  const handleDragEnd = (clientX: number, clientY: number) => {
    if (draggedPiece) {
      // Check if dropped within board
      const boardEl = document.querySelector('.aspect-square');
      if (boardEl) {
        const rect = boardEl.getBoundingClientRect();
        boardRectRef.current = rect;

        // Offset pointer so top-left anchor aligns with piece shape center
        const cellSize = rect.width / 10;
        const liftedY = clientY - 45; // Lifted finger offset

        if (
          clientX >= rect.left &&
          clientX <= rect.right &&
          liftedY >= rect.top &&
          liftedY <= rect.bottom
        ) {
          const col = Math.floor((clientX - rect.left) / cellSize);
          const row = Math.floor((liftedY - rect.top) / cellSize);

          placePiece(
            draggedPiece.id,
            row,
            col,
            rect,
            particleTriggerRef.current || undefined
          );
        }
      }
    }

    setDraggedPiece(null);
    setDragPointerPos(null);
  };

  // Cell click handler (for tap-to-place and targeting powerups)
  const handleCellClick = (row: number, col: number) => {
    if (activePowerup) {
      const boardEl = document.querySelector('.aspect-square');
      const rect = boardEl?.getBoundingClientRect();
      applyPowerupOnCell(row, col, rect);
      return;
    }

    if (selectedPiece) {
      const boardEl = document.querySelector('.aspect-square');
      const rect = boardEl?.getBoundingClientRect();
      if (rect) {
        placePiece(
          selectedPiece.id,
          row,
          col,
          rect,
          particleTriggerRef.current || undefined
        );
      }
    }
  };

  return (
    <div
      className={`relative w-full min-h-screen text-white overflow-hidden select-none flex flex-col items-center justify-between transition-colors duration-500 ${
        screenShakeActive ? 'animate-shake' : ''
      }`}
      style={{
        background: currentTheme.bgGradient,
      }}
    >
      {/* Background Ambient Glow Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-[140px] opacity-30 animate-pulse-glow"
          style={{ backgroundColor: currentTheme.accent }}
        />
        <div
          className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full blur-[140px] opacity-25 animate-pulse-glow"
          style={{ backgroundColor: currentTheme.secondary }}
        />
      </div>

      {/* Performant Particle System Canvas */}
      <ParticleCanvas
        ref={particleTriggerRef}
        reducedMotion={settings.reducedMotion}
      />

      {/* Floating Announcements & Popups */}
      <FloatingTextOverlay notifications={floatingTexts} />

      {/* VIEW: Start Screen / Menu */}
      {currentView === 'menu' && (
        <StartScreen
          stats={stats}
          level={level}
          mode={mode}
          onStartGame={() => {
            startNewGame(mode);
            setCurrentView('playing');
          }}
          onOpenModes={() => setModalOpen('modes')}
          onOpenMissions={() => setModalOpen('missions')}
          onOpenAchievements={() => setModalOpen('stats')}
          onOpenLeaderboard={() => setModalOpen('leaderboard')}
          onOpenThemes={() => setModalOpen('themes')}
          onOpenStats={() => setModalOpen('stats')}
          onOpenSettings={() => setModalOpen('settings')}
          onOpenTutorial={() => setShowTutorial(true)}
        />
      )}

      {/* VIEW: Playing Game */}
      {currentView === 'playing' && (
        <div className="w-full flex-1 flex flex-col justify-between max-w-lg mx-auto z-10 py-1">
          {/* Top HUD */}
          <HUD
            score={score}
            bestScore={stats.bestScoreByMode[mode] || 0}
            combo={combo}
            level={level}
            xp={xp}
            coins={coins}
            streak={stats.currentStreak}
            mode={mode}
            undoTokens={undoTokens}
            timeLeft={timeLeft}
            movesLeft={movesLeft}
            soundEnabled={settings.soundEnabled}
            onToggleSound={() =>
              setSettings((prev) => ({
                ...prev,
                soundEnabled: !prev.soundEnabled,
                musicEnabled: !prev.soundEnabled,
              }))
            }
            onPause={() => setIsPaused(true)}
            onUndo={triggerUndo}
          />

          {/* 10x10 Board */}
          <div className="flex-1 flex items-center justify-center my-auto">
            <Board
              board={board}
              selectedPiece={selectedPiece}
              draggedPiece={draggedPiece}
              dragOffset={null}
              activePowerup={activePowerup}
              theme={currentTheme}
              colorBlindMode={settings.colorBlindMode}
              onCellClick={handleCellClick}
              onPlacePiece={(pId, r, c, rect) =>
                placePiece(
                  pId,
                  r,
                  c,
                  rect,
                  particleTriggerRef.current || undefined
                )
              }
            />
          </div>

          {/* Bottom Piece Tray */}
          <PieceTray
            pieces={pieces}
            selectedPieceId={selectedPieceId}
            onSelectPiece={setSelectedPieceId}
            onRotatePiece={rotatePieceInTray}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
          />

          {/* Powerups Dock */}
          <PowerupBar
            powerups={powerups}
            activePowerup={activePowerup}
            onUsePowerup={usePowerup}
          />
        </div>
      )}

      {/* Floating Drag Proxy: Follows Finger/Cursor with Lift Elevation */}
      {draggedPiece && dragPointerPos && (
        <div
          className="fixed pointer-events-none z-50 transition-transform duration-75 scale-110 drop-shadow-2xl"
          style={{
            left: `${dragPointerPos.x}px`,
            top: `${dragPointerPos.y - 50}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div
            className="grid gap-1 p-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/20 shadow-[0_0_20px_rgba(0,243,255,0.4)]"
            style={{
              gridTemplateColumns: `repeat(${draggedPiece.shape[0].length}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${draggedPiece.shape.length}, minmax(0, 1fr))`,
            }}
          >
            {draggedPiece.shape.map((row, r) =>
              row.map((cell, c) => (
                <div
                  key={`${r}-${c}`}
                  className={`w-7 h-7 rounded-md ${
                    cell === 1 ? 'neon-block-bevel' : 'opacity-0'
                  }`}
                  style={{
                    backgroundColor: cell === 1 ? draggedPiece.color : 'transparent',
                    boxShadow:
                      cell === 1
                        ? `0 0 12px ${draggedPiece.color}, inset 0 1.5px 1px rgba(255,255,255,0.5)`
                        : 'none',
                  }}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {gameOver && (
        <GameOverModal
          score={score}
          bestScore={stats.bestScoreByMode[mode] || 0}
          lines={linesCleared}
          maxCombo={highestComboThisRun}
          perfectClears={perfectClearsThisRun}
          blocksPlaced={blocksPlacedThisRun}
          xpEarned={Math.floor(score / 25) + linesCleared * 15}
          onPlayAgain={() => startNewGame(mode)}
          onGoHome={() => setCurrentView('menu')}
        />
      )}

      {/* Pause Modal */}
      {isPaused && !gameOver && (
        <PauseModal
          onResume={() => setIsPaused(false)}
          onRestart={() => startNewGame(mode)}
          onOpenSettings={() => setModalOpen('settings')}
          onQuitToMenu={() => {
            setIsPaused(false);
            setCurrentView('menu');
          }}
        />
      )}

      {/* Settings Modal */}
      {modalOpen === 'settings' && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={setSettings}
          onClose={() => setModalOpen(null)}
          onResetProgress={() => {
            try {
              localStorage.clear();
              window.location.reload();
            } catch {}
          }}
        />
      )}

      {/* Themes Modal */}
      {modalOpen === 'themes' && (
        <ThemesModal
          currentThemeId={settings.themeId}
          playerLevel={level}
          onSelectTheme={(themeId) => {
            setSettings((prev) => ({ ...prev, themeId }));
            sound.playSnap();
          }}
          onClose={() => setModalOpen(null)}
        />
      )}

      {/* Missions Modal */}
      {modalOpen === 'missions' && (
        <MissionsModal
          missions={missions}
          onClaimReward={claimMissionReward}
          onClose={() => setModalOpen(null)}
        />
      )}

      {/* Leaderboard Modal */}
      {modalOpen === 'leaderboard' && (
        <LeaderboardModal
          entries={leaderboard}
          onClose={() => setModalOpen(null)}
        />
      )}

      {/* Stats Modal */}
      {modalOpen === 'stats' && (
        <StatsModal
          stats={stats}
          level={level}
          onClose={() => setModalOpen(null)}
        />
      )}

      {/* Mode Selector Modal */}
      {modalOpen === 'modes' && (
        <ModeSelectorModal
          currentMode={mode}
          onSelectMode={(newMode) => {
            setMode(newMode);
            if (currentView === 'playing') {
              startNewGame(newMode);
            }
          }}
          onClose={() => setModalOpen(null)}
        />
      )}

      {/* Interactive FTUX Tutorial Modal */}
      {showTutorial && (
        <TutorialModal onClose={() => setShowTutorial(false)} />
      )}
    </div>
  );
}
