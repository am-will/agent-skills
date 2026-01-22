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

export const Scene1_YourPlanSucks: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Dramatic zoom in with overshoot
  const zoomProgress = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 150, mass: 0.8 },
  });

  // Scale from massive to fit, with aggressive zoom
  const scale = interpolate(zoomProgress, [0, 1], [8, 1], {
    extrapolateRight: 'clamp',
  });

  // Rotation shake that settles
  const rotationShake = interpolate(
    frame,
    [0, 5, 10, 15, 20, 25, 30],
    [0, -3, 2, -1.5, 1, -0.5, 0],
    { extrapolateRight: 'clamp' }
  );

  // Glitch offset effect
  const glitchX = frame < 15
    ? interpolate(frame % 3, [0, 1, 2], [0, -8, 5])
    : 0;

  const glitchY = frame < 15
    ? interpolate(frame % 4, [0, 1, 2, 3], [0, 4, -3, 2])
    : 0;

  // Flash effect at start
  const flashOpacity = interpolate(frame, [0, 3, 8], [1, 0.8, 0], {
    extrapolateRight: 'clamp',
  });

  // Split color glitch
  const showGlitch = frame > 2 && frame < 20;
  const glitchOffset = showGlitch ? Math.sin(frame * 2) * 4 : 0;

  // Enhanced screen shake - powerful impact that settles
  const screenShakeX = frame < 20
    ? interpolate(frame, [0, 2, 5, 8, 12, 20], [0, -12, 8, -4, 2, 0])
    : 0;
  const screenShakeY = frame < 20
    ? interpolate(frame, [0, 3, 6, 10, 15, 20], [0, 8, -6, 3, -1, 0])
    : 0;

  // White flash frames for intense impact (frames 2-4)
  const whiteFlash = interpolate(frame, [1, 2, 3, 4, 5], [0, 1, 0.8, 0.3, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Enhanced chromatic aberration - stronger separation
  const chromaticOffset = showGlitch ? Math.sin(frame * 2) * 8 : 0;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.bgDark,
        overflow: 'hidden',
        transform: `translate(${screenShakeX}px, ${screenShakeY}px)`,
      }}
    >
      {/* Sound Effect: Boom impact */}
      <Audio
        src={staticFile(AUDIO_PATHS.sfx.boom)}
        volume={SFX_TIMING.scene1.boom.volume}
        startFrom={SFX_TIMING.scene1.boom.startFrom}
      />

      {/* Background flash */}
      <AbsoluteFill
        style={{
          backgroundColor: THEME.accent,
          opacity: flashOpacity,
        }}
      />

      {/* White flash impact frames */}
      <AbsoluteFill
        style={{
          backgroundColor: '#ffffff',
          opacity: whiteFlash,
          pointerEvents: 'none',
        }}
      />

      {/* Diagonal lines pattern */}
      <AbsoluteFill
        style={{
          backgroundImage: `repeating-linear-gradient(
            135deg,
            rgba(255,107,0,0.08) 0 3px,
            transparent 3px 20px
          )`,
          opacity: 0.6,
        }}
      />

      {/* Main text container - offset 1/3 from left */}
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'flex-start',
          paddingLeft: '12%',
        }}
      >
        {/* Cyan glitch layer (behind) - Enhanced chromatic aberration */}
        {showGlitch && (
          <div
            style={{
              position: 'absolute',
              fontFamily,
              fontSize: 180,
              fontWeight: 900,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: THEME.accent2,
              transform: `scale(${scale}) rotate(${rotationShake}deg) translate(${chromaticOffset + 6}px, ${-3}px)`,
              opacity: 0.8,
              mixBlendMode: 'screen',
            }}
          >
            YOUR PLAN SUCKS
          </div>
        )}

        {/* Main text */}
        <div
          style={{
            fontFamily,
            fontSize: 180,
            fontWeight: 900,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: THEME.panel,
            transform: `scale(${scale}) rotate(${rotationShake}deg) translate(${glitchX}px, ${glitchY}px)`,
            textShadow: `
              6px 6px 0 ${THEME.accent},
              12px 12px 0 rgba(0,0,0,0.4)
            `,
            position: 'relative',
          }}
        >
          YOUR PLAN SUCKS
        </div>

        {/* Red glitch layer (in front) - Enhanced chromatic aberration */}
        {showGlitch && (
          <div
            style={{
              position: 'absolute',
              fontFamily,
              fontSize: 180,
              fontWeight: 900,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#ff0040',
              transform: `scale(${scale}) rotate(${rotationShake}deg) translate(${-chromaticOffset - 5}px, ${4}px)`,
              opacity: 0.6,
              mixBlendMode: 'multiply',
            }}
          >
            YOUR PLAN SUCKS
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
