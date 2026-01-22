import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { loadFont } from '@remotion/google-fonts/BlackOpsOne';
import { THEME } from '../theme';

const { fontFamily } = loadFont();

// Crown SVG component
const Crown: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg viewBox="0 0 100 70" width={size} height={size * 0.7}>
    <path
      d="M5 60 L5 25 L25 40 L50 10 L75 40 L95 25 L95 60 Z"
      fill={color}
      stroke="#8B6914"
      strokeWidth="3"
    />
    {/* Jewels */}
    <circle cx="25" cy="45" r="6" fill="#E74C3C" />
    <circle cx="50" cy="40" r="8" fill="#3498DB" />
    <circle cx="75" cy="45" r="6" fill="#2ECC71" />
    {/* Crown points */}
    <circle cx="50" cy="15" r="5" fill={color} stroke="#8B6914" strokeWidth="2" />
    <circle cx="25" cy="35" r="4" fill={color} stroke="#8B6914" strokeWidth="2" />
    <circle cx="75" cy="35" r="4" fill={color} stroke="#8B6914" strokeWidth="2" />
  </svg>
);

// Plan card component
const PlanCard: React.FC<{
  label: string;
  score: number;
  isWinner: boolean;
  scale: number;
  opacity: number;
  showScore: boolean;
  scoreProgress: number;
  glowIntensity: number;
  isScanning: boolean;
  scanProgress: number;
}> = ({ label, score, isWinner, scale, opacity, showScore, scoreProgress, glowIntensity, isScanning, scanProgress }) => (
  <div
    style={{
      width: 220,
      height: 280,
      backgroundColor: isWinner ? THEME.warmBg : THEME.panel,
      border: `4px solid ${isWinner ? THEME.accent : THEME.ink}`,
      boxShadow: isWinner
        ? `0 0 ${60 * glowIntensity}px ${THEME.accent}, 8px 8px 0 ${THEME.shadow}`
        : isScanning
        ? `0 0 ${30 * scanProgress}px ${THEME.accent2}, 6px 6px 0 ${THEME.shadow}`
        : `6px 6px 0 ${THEME.shadow}`,
      transform: `scale(${scale})`,
      opacity,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    {/* Scanning line effect */}
    {isScanning && scanProgress > 0 && scanProgress < 1 && (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          background: `linear-gradient(180deg,
            transparent ${scanProgress * 100 - 10}%,
            ${THEME.accent2}40 ${scanProgress * 100 - 5}%,
            ${THEME.accent2} ${scanProgress * 100}%,
            ${THEME.accent2}40 ${scanProgress * 100 + 5}%,
            transparent ${scanProgress * 100 + 10}%
          )`,
          pointerEvents: 'none',
          zIndex: 10,
        }}
      />
    )}

    {/* Document lines */}
    <div style={{ width: '70%', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[1, 0.8, 0.9, 0.6, 0.75].map((w, i) => (
        <div
          key={i}
          style={{
            height: 10,
            width: `${w * 100}%`,
            backgroundColor: THEME.ink,
            opacity: 0.2,
          }}
        />
      ))}
    </div>

    <div
      style={{
        fontFamily,
        fontSize: 28,
        letterSpacing: '0.04em',
        color: THEME.ink,
        marginTop: 10,
      }}
    >
      {label}
    </div>

    {showScore && (
      <div
        style={{
          fontFamily,
          fontSize: 56,
          color: isWinner ? THEME.accent : THEME.ink,
          textShadow: isWinner ? `0 0 20px ${THEME.accent}` : 'none',
          transform: `scale(${scoreProgress})`,
          opacity: scoreProgress,
        }}
      >
        {score}/10
      </div>
    )}
  </div>
);

export const Scene5_Judge: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Timeline phases - spread out more for scanning animation
  const CARDS_SETTLE = 25;
  const SCAN_START = 30;
  const SCAN_DURATION = 15; // frames per card scan
  const SCORE_DELAY = 8; // frames after scan finishes to show score
  const WINNER_HIGHLIGHT = 95;
  const WINNER_FLASH_DURATION = 60; // 3 flashes over 2 seconds
  const WINNER_ZOOM = WINNER_HIGHLIGHT + WINNER_FLASH_DURATION + 10; // 165
  const CROWN_DROP = WINNER_ZOOM + 20; // 185

  // Title animation
  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  // Per-card scanning and score reveal
  const getCardState = (cardIndex: number) => {
    const scanStart = SCAN_START + cardIndex * (SCAN_DURATION + 5);
    const scanEnd = scanStart + SCAN_DURATION;
    const scoreRevealStart = scanEnd + SCORE_DELAY;

    // Scan progress (0 to 1 as line moves down the card)
    const scanProgress = interpolate(
      frame,
      [scanStart, scanEnd],
      [0, 1],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    const isScanning = frame >= scanStart && frame <= scanEnd;

    // Score reveal with spring
    const scoreProgress = spring({
      frame: frame - scoreRevealStart,
      fps,
      config: { damping: 10, stiffness: 120 },
    });

    const showScore = frame >= scoreRevealStart;

    return { isScanning, scanProgress, showScore, scoreProgress };
  };

  // Winner highlight (after all scores revealed)
  const winnerGlow = interpolate(frame, [WINNER_HIGHLIGHT, WINNER_HIGHLIGHT + 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Winner zoom (stays centered)
  const winnerZoomProgress = spring({
    frame: frame - WINNER_ZOOM,
    fps,
    config: { damping: 12, stiffness: 60 },
  });

  const winnerScale = interpolate(winnerZoomProgress, [0, 1], [1, 1.8], {
    extrapolateRight: 'clamp',
  });

  // Crown drop animation
  const crownDropProgress = spring({
    frame: frame - CROWN_DROP,
    fps,
    config: { damping: 10, stiffness: 80 },
  });

  const crownY = interpolate(crownDropProgress, [0, 1], [-350, -45], {
    extrapolateRight: 'clamp',
  });

  const crownRotation = interpolate(
    crownDropProgress,
    [0, 0.6, 0.8, 1],
    [0, -10, 25, 18],
    { extrapolateRight: 'clamp' }
  );

  const crownX = interpolate(crownDropProgress, [0, 0.5, 1], [0, 40, 90], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Loser cards fade out
  const loserFade = interpolate(frame, [WINNER_ZOOM, WINNER_ZOOM + 30], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Sparkles around winner
  const sparkles = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2 + frame * 0.05;
    const distance = 250 + Math.sin(frame * 0.1 + i) * 30;
    const sparkleOpacity = winnerGlow * (0.5 + Math.sin(frame * 0.2 + i) * 0.3);
    return {
      x: Math.cos(angle) * distance * winnerZoomProgress,
      y: Math.sin(angle) * distance * winnerZoomProgress,
      opacity: sparkleOpacity,
      size: 8 + (i % 3) * 4,
    };
  });

  // Plans data
  const plans = [
    { label: 'PLAN A', score: 6 },
    { label: 'PLAN B', score: 9 }, // Winner
    { label: 'PLAN C', score: 7 },
  ];

  // Best plan text fade in
  const bestPlanTextOpacity = interpolate(crownDropProgress, [0.5, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // "Analyzing" text visibility
  const analyzingOpacity = interpolate(
    frame,
    [SCAN_START - 5, SCAN_START, SCAN_START + SCAN_DURATION * 3 + 10, SCAN_START + SCAN_DURATION * 3 + 20],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.bgDark,
        overflow: 'hidden',
      }}
    >
      {/* Dramatic radial background */}
      <AbsoluteFill
        style={{
          background: `
            radial-gradient(circle at 50% 40%, rgba(255,107,0,0.2) 0%, transparent 50%),
            radial-gradient(circle at 50% 100%, rgba(0,213,255,0.1) 0%, transparent 40%)
          `,
        }}
      />

      {/* Title */}
      <AbsoluteFill
        style={{
          justifyContent: 'flex-start',
          alignItems: 'center',
          paddingTop: 50,
        }}
      >
        <div
          style={{
            fontFamily,
            fontSize: 72,
            color: THEME.panel,
            letterSpacing: '0.08em',
            textShadow: `4px 4px 0 ${THEME.accent2}`,
            transform: `scale(${titleProgress})`,
            opacity: titleProgress * (1 - winnerZoomProgress * 0.3),
          }}
        >
          LLM AS JUDGE
        </div>
      </AbsoluteFill>

      {/* "ANALYZING..." text during scanning */}
      {analyzingOpacity > 0 && winnerZoomProgress < 0.1 && (
        <div
          style={{
            position: 'absolute',
            top: 240,
            left: '50%',
            transform: 'translateX(-50%)',
            fontFamily,
            fontSize: 42,
            color: THEME.accent2,
            opacity: analyzingOpacity,
            letterSpacing: '0.2em',
            textShadow: `0 0 30px ${THEME.accent2}, 0 0 60px ${THEME.accent2}50`,
          }}
        >
          ANALYZING{'.'.repeat(Math.floor((frame / 8) % 4))}
        </div>
      )}

      {/* Plan cards */}
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Sparkles around winner */}
        {sparkles.map((s, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: s.size,
              height: s.size,
              backgroundColor: i % 2 === 0 ? '#FFD700' : THEME.accent,
              transform: `translate(${s.x}px, ${s.y}px) rotate(45deg)`,
              opacity: s.opacity,
              boxShadow: `0 0 10px ${i % 2 === 0 ? '#FFD700' : THEME.accent}`,
              zIndex: 50,
            }}
          />
        ))}

        {/* Plan cards container */}
        <div
          style={{
            display: 'flex',
            gap: 40,
            alignItems: 'center',
            position: 'relative',
          }}
        >
          {plans.map((plan, i) => {
            const isWinner = i === 1;
            const cardProgress = spring({
              frame: frame - i * 8,
              fps,
              config: { damping: 12, stiffness: 80 },
            });

            const { isScanning, scanProgress, showScore, scoreProgress } = getCardState(i);

            // Loser cards move outward and fade
            const loserOffset = isWinner ? 0 : (i === 0 ? -100 : 100) * winnerZoomProgress;
            const finalScale = isWinner ? winnerScale : 1 - winnerZoomProgress * 0.3;
            const finalOpacity = isWinner ? 1 : loserFade;

            return (
              <div
                key={i}
                style={{
                  position: 'relative',
                  transform: `translateX(${loserOffset}px) scale(${finalScale})`,
                  zIndex: isWinner ? 100 : 1,
                  opacity: finalOpacity,
                }}
              >
                <PlanCard
                  label={plan.label}
                  score={plan.score}
                  isWinner={isWinner}
                  scale={cardProgress}
                  opacity={cardProgress}
                  showScore={showScore}
                  scoreProgress={scoreProgress}
                  glowIntensity={winnerGlow}
                  isScanning={isScanning}
                  scanProgress={scanProgress}
                />

                {/* Crown on winner - positioned at top-right corner */}
                {isWinner && crownDropProgress > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: crownY,
                      left: '50%',
                      transform: `translateX(-50%) translateX(${crownX}px) rotate(${crownRotation}deg)`,
                      zIndex: 150,
                    }}
                  >
                    <Crown size={100} color="#FFD700" />
                  </div>
                )}

                {/* Winner badge - flashes 3 times */}
                {isWinner && frame >= WINNER_HIGHLIGHT && winnerZoomProgress < 0.3 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -40,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontFamily,
                      fontSize: 24,
                      color: '#FFD700',
                      textShadow: '0 0 20px #FFD700',
                      // Flash 3 times: use sine wave for smooth in/out, 3 cycles over WINNER_FLASH_DURATION
                      opacity: Math.max(0, Math.sin(((frame - WINNER_HIGHLIGHT) / WINNER_FLASH_DURATION) * Math.PI * 3)),
                      whiteSpace: 'nowrap',
                    }}
                  >
                    ★ WINNER ★
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>

      {/* "BEST PLAN WINS" text - positioned at bottom with high z-index */}
      {crownDropProgress > 0.3 && (
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            zIndex: 200,
          }}
        >
          <div
            style={{
              fontFamily,
              fontSize: 52,
              color: '#FFD700',
              textShadow: `0 0 30px #FFD700, 4px 4px 0 ${THEME.shadow}, -2px -2px 20px rgba(0,0,0,0.8)`,
              opacity: bestPlanTextOpacity,
              letterSpacing: '0.1em',
              backgroundColor: 'rgba(0,0,0,0.6)',
              padding: '12px 40px',
            }}
          >
            THE BEST PLAN WINS
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
