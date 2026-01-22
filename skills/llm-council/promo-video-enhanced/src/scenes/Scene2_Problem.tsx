import React from 'react';
import {
  AbsoluteFill,
  Audio,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { loadFont } from '@remotion/google-fonts/BlackOpsOne';
import { THEME } from '../theme';
import { AUDIO_PATHS, SFX_TIMING } from '../utils/soundEffects';

const { fontFamily } = loadFont();

// Brain icon made with CSS shapes
const Brain: React.FC<{ opacity: number; scale: number; rotation: number; x: number; y: number }> = ({
  opacity, scale, rotation, x, y
}) => (
  <div
    style={{
      position: 'absolute',
      width: 120,
      height: 100,
      opacity,
      transform: `translate(${x}px, ${y}px) scale(${scale}) rotate(${rotation}deg)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {/* Brain emoji as placeholder - bold and visible */}
    <span style={{ fontSize: 80 }}>🧠</span>
  </div>
);

export const Scene2_Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Single brain appears
  const brainEnter = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  // Brain fragments/scatters
  const fragmentProgress = spring({
    frame: frame - 30,
    fps,
    config: { damping: 8, stiffness: 80 },
  });

  // Text fade in
  const textOpacity = interpolate(frame, [40, 55], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const textScale = spring({
    frame: frame - 40,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  // Brain pieces scatter effect
  const scatter = Math.min(1, fragmentProgress);
  const pieces = [
    { x: -150 * scatter, y: -80 * scatter, rot: -25 * scatter, opacity: 1 - scatter * 0.3 },
    { x: 120 * scatter, y: -60 * scatter, rot: 15 * scatter, opacity: 1 - scatter * 0.4 },
    { x: -80 * scatter, y: 100 * scatter, rot: -10 * scatter, opacity: 1 - scatter * 0.5 },
    { x: 140 * scatter, y: 90 * scatter, rot: 30 * scatter, opacity: 1 - scatter * 0.3 },
  ];

  // Question marks floating
  const questionMarks = [
    { x: -300, y: -150, delay: 0 },
    { x: 320, y: -100, delay: 10 },
    { x: -250, y: 180, delay: 20 },
    { x: 280, y: 120, delay: 15 },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.bgDark,
        overflow: 'hidden',
      }}
    >
      {/* Sound Effect: Glass shatter when brain fragments */}
      <Audio
        src={staticFile(AUDIO_PATHS.sfx.shatter)}
        volume={SFX_TIMING.scene2.shatter.volume}
        startFrom={SFX_TIMING.scene2.shatter.startFrom}
      />

      {/* Subtle grid pattern */}
      <AbsoluteFill
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,107,0,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,107,0,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Central brain area */}
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Main brain that fragments */}
        <div
          style={{
            position: 'relative',
            transform: `scale(${brainEnter})`,
          }}
        >
          {/* Original brain (fades as it scatters) */}
          <Brain
            opacity={1 - scatter}
            scale={1.5}
            rotation={0}
            x={0}
            y={-50}
          />

          {/* Scattered pieces */}
          {pieces.map((piece, i) => (
            <Brain
              key={i}
              opacity={piece.opacity * scatter}
              scale={0.8}
              rotation={piece.rot}
              x={piece.x}
              y={piece.y - 50}
            />
          ))}
        </div>

        {/* Floating question marks */}
        {questionMarks.map((qm, i) => {
          const qmProgress = spring({
            frame: frame - qm.delay,
            fps,
            config: { damping: 10, stiffness: 60 },
          });
          const floatY = Math.sin((frame + qm.delay) * 0.1) * 10;

          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                fontSize: 72,
                fontFamily,
                color: THEME.accent,
                opacity: qmProgress * 0.8,
                transform: `translate(${qm.x}px, ${qm.y + floatY}px) scale(${qmProgress})`,
                textShadow: `3px 3px 0 ${THEME.shadow}`,
              }}
            >
              ?
            </div>
          );
        })}
      </AbsoluteFill>

      {/* Bottom text */}
      <AbsoluteFill
        style={{
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingBottom: 120,
        }}
      >
        <div
          style={{
            fontFamily,
            fontSize: 64,
            color: THEME.panel,
            opacity: textOpacity,
            transform: `scale(${Math.max(0.5, textScale)})`,
            textShadow: `4px 4px 0 ${THEME.accent}`,
            letterSpacing: '0.04em',
          }}
        >
          ONE BRAIN. LIMITED PERSPECTIVE.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
