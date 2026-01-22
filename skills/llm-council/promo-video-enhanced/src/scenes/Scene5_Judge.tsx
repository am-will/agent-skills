import React from 'react';
import {
  AbsoluteFill,
  Audio,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';
import { loadFont } from '@remotion/google-fonts/BlackOpsOne';
import { THEME } from '../theme';
import { AUDIO_PATHS, SFX_TIMING } from '../utils/soundEffects';

const { fontFamily } = loadFont();

// Plan card that gets evaluated
const PlanCard: React.FC<{
  label: string;
  score?: number;
  x: number;
  y: number;
  scale: number;
  opacity: number;
  highlight: boolean;
}> = ({ label, score, x, y, scale, opacity, highlight }) => (
  <div
    style={{
      position: 'absolute',
      width: 200,
      height: 140,
      backgroundColor: highlight ? THEME.warmBg : THEME.panel,
      border: `4px solid ${highlight ? THEME.accent : THEME.ink}`,
      boxShadow: highlight
        ? `0 0 30px ${THEME.accent}80`
        : `6px 6px 0 ${THEME.shadow}`,
      transform: `translate(${x}px, ${y}px) scale(${scale})`,
      opacity,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      transition: 'none',
    }}
  >
    <div
      style={{
        fontFamily,
        fontSize: 24,
        letterSpacing: '0.04em',
        color: THEME.ink,
      }}
    >
      {label}
    </div>
    {score !== undefined && (
      <div
        style={{
          fontFamily,
          fontSize: 48,
          color: highlight ? THEME.accent : THEME.ink,
          textShadow: highlight ? `2px 2px 0 ${THEME.shadow}` : 'none',
        }}
      >
        {score}
      </div>
    )}
    {/* Progress bar */}
    <div
      style={{
        width: '70%',
        height: 8,
        backgroundColor: THEME.soft || '#e0e0e0',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: score !== undefined ? `${score * 10}%` : '0%',
          height: '100%',
          backgroundColor: highlight ? THEME.accent : THEME.accent2,
        }}
      />
    </div>
  </div>
);

export const Scene5_Judge: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Plans data
  const plans = [
    { label: 'PLAN A', score: 7 },
    { label: 'PLAN B', score: 9 },
    { label: 'PLAN C', score: 6 },
  ];

  // Gavel slam animation
  const gavelSwing = spring({
    frame: frame - 20,
    fps,
    config: { damping: 8, stiffness: 300 },
  });

  const gavelRotation = interpolate(gavelSwing, [0, 1], [-45, 0], {
    extrapolateRight: 'clamp',
  });

  // Score reveal sequence
  const getScoreReveal = (index: number) => {
    const startFrame = 30 + index * 15;
    return interpolate(frame, [startFrame, startFrame + 10], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.quad),
    });
  };

  // Winner highlight
  const winnerHighlight = interpolate(frame, [75, 85], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Title animation
  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  // Checkmark for winner
  const checkProgress = interpolate(frame, [80, 90], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.bgDark,
        overflow: 'hidden',
      }}
    >
      {/* Sound Effect: Gavel slam */}
      <Audio
        src={staticFile(AUDIO_PATHS.sfx.gavel)}
        volume={SFX_TIMING.scene5.gavel.volume}
        startFrom={SFX_TIMING.scene5.gavel.startFrom}
      />

      {/* Subtle pattern */}
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(circle at 50% 30%, rgba(0,213,255,0.1) 0%, transparent 40%)`,
        }}
      />

      {/* Title */}
      <AbsoluteFill
        style={{
          justifyContent: 'flex-start',
          alignItems: 'center',
          paddingTop: 80,
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
            opacity: titleProgress,
          }}
        >
          LLM AS JUDGE
        </div>
      </AbsoluteFill>

      {/* Plan cards */}
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {plans.map((plan, i) => {
          const cardProgress = spring({
            frame: frame - i * 5,
            fps,
            config: { damping: 12, stiffness: 80 },
          });

          const scoreReveal = getScoreReveal(i);
          const isWinner = i === 1; // Plan B wins
          const highlight = isWinner && winnerHighlight > 0.5;

          const xOffset = (i - 1) * 280;
          const yOffset = isWinner ? -20 * winnerHighlight : 20 * winnerHighlight;

          return (
            <PlanCard
              key={i}
              label={plan.label}
              score={scoreReveal > 0 ? plan.score : undefined}
              x={xOffset}
              y={50 + yOffset}
              scale={cardProgress * (isWinner ? 1 + winnerHighlight * 0.1 : 1)}
              opacity={cardProgress}
              highlight={highlight}
            />
          );
        })}

        {/* Winner badge */}
        {checkProgress > 0 && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(0px, -80px) scale(${checkProgress})`,
              backgroundColor: THEME.accent,
              color: THEME.panel,
              padding: '12px 24px',
              fontFamily,
              fontSize: 28,
              letterSpacing: '0.06em',
              boxShadow: `4px 4px 0 ${THEME.shadow}`,
              border: `3px solid ${THEME.ink}`,
            }}
          >
            BEST PLAN
          </div>
        )}

        {/* Gavel */}
        <div
          style={{
            position: 'absolute',
            top: 200,
            right: 200,
            fontSize: 100,
            transform: `rotate(${gavelRotation}deg)`,
            transformOrigin: 'bottom right',
            opacity: gavelSwing,
          }}
        >
          ⚖️
        </div>
      </AbsoluteFill>

      {/* Score summary at bottom */}
      <AbsoluteFill
        style={{
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingBottom: 60,
        }}
      >
        <div
          style={{
            fontFamily,
            fontSize: 32,
            color: THEME.accent2,
            letterSpacing: '0.06em',
            opacity: winnerHighlight,
          }}
        >
          OBJECTIVE • UNBIASED • DECISIVE
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
