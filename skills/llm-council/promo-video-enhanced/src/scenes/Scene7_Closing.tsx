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

export const Scene7_Closing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo entrance with epic zoom
  const logoProgress = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 80, mass: 1.5 },
  });

  const logoScale = interpolate(logoProgress, [0, 1], [3, 1], {
    extrapolateRight: 'clamp',
  });

  const logoRotation = interpolate(logoProgress, [0, 1], [5, -1], {
    extrapolateRight: 'clamp',
  });

  // Tagline appears
  const taglineProgress = spring({
    frame: frame - 25,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  // CTA button
  const ctaProgress = spring({
    frame: frame - 45,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  // CTA pulse/breathe effect - continuous after appearance
  const ctaPulse = frame > 45
    ? interpolate(Math.sin((frame - 45) * 0.08), [-1, 1], [0.98, 1.05])
    : 1;

  // Background pulse
  const bgPulse = interpolate(
    Math.sin(frame * 0.08),
    [-1, 1],
    [0.15, 0.25]
  );

  // Accent lines sweep
  const lineSweep = interpolate(frame, [10, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Particle field
  const particles = Array.from({ length: 20 }, (_, i) => {
    const speed = 0.5 + (i % 3) * 0.3;
    const startY = ((i * 123) % 100) - 50;
    const x = ((i * 97) % 100) - 50;
    const y = startY + frame * speed * 0.5;
    const opacity = interpolate(
      y,
      [-50, 0, 50],
      [0, 0.6, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    return { x: x * 15, y: (y % 100 - 50) * 8, opacity, size: 4 + (i % 3) * 2 };
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.bgDark,
        overflow: 'hidden',
      }}
    >
      {/* Sound Effect: Confident boom for CTA */}
      <Audio
        src={staticFile(AUDIO_PATHS.sfx.confidence)}
        volume={SFX_TIMING.scene7.confidence.volume}
        startFrom={SFX_TIMING.scene7.confidence.startFrom}
      />

      {/* Animated gradient background */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 50%, ${THEME.accent}${Math.round(bgPulse * 255).toString(16).padStart(2, '0')} 0%, transparent 60%)`,
        }}
      />

      {/* Diagonal pattern */}
      <AbsoluteFill
        style={{
          backgroundImage: `repeating-linear-gradient(
            135deg,
            rgba(255,107,0,0.06) 0 3px,
            transparent 3px 25px
          )`,
        }}
      />

      {/* Floating particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: p.size,
            height: p.size,
            backgroundColor: i % 2 === 0 ? THEME.accent : THEME.accent2,
            transform: `translate(${p.x}px, ${p.y}px)`,
            opacity: p.opacity,
          }}
        />
      ))}

      {/* Accent sweep lines */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: 0,
          width: `${lineSweep * 100}%`,
          height: 4,
          backgroundColor: THEME.accent,
          opacity: 0.8,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '20%',
          right: 0,
          width: `${lineSweep * 100}%`,
          height: 4,
          backgroundColor: THEME.accent2,
          opacity: 0.8,
        }}
      />

      {/* Main content */}
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          gap: 40,
        }}
      >
        {/* Logo panel */}
        <div
          style={{
            padding: '50px 100px',
            backgroundColor: THEME.warmBg,
            border: `5px solid ${THEME.ink}`,
            boxShadow: `${14 * logoProgress}px ${14 * logoProgress}px 0 ${THEME.shadow}`,
            transform: `scale(${logoScale}) rotate(${logoRotation}deg)`,
          }}
        >
          <div
            style={{
              fontFamily,
              fontSize: 140,
              fontWeight: 900,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              lineHeight: 1.1,
              color: THEME.ink,
              textShadow: `
                6px 6px 0 ${THEME.accent},
                12px 12px 0 rgba(0,0,0,0.2)
              `,
            }}
          >
            LLM COUNCIL
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontFamily,
            fontSize: 48,
            color: THEME.panel,
            letterSpacing: '0.1em',
            textShadow: `3px 3px 0 ${THEME.accent}`,
            opacity: taglineProgress,
            transform: `translateY(${interpolate(taglineProgress, [0, 1], [30, 0])}px)`,
          }}
        >
          BETTER PLANS. BETTER OUTCOMES.
        </div>

        {/* CTA with pulse/breathe effect */}
        <div
          style={{
            fontFamily,
            fontSize: 32,
            color: THEME.bgDark,
            backgroundColor: THEME.accent,
            padding: '16px 48px',
            border: `4px solid ${THEME.ink}`,
            boxShadow: `6px 6px 0 ${THEME.shadow}`,
            letterSpacing: '0.08em',
            opacity: ctaProgress,
            transform: `scale(${ctaProgress * ctaPulse})`,
            transition: 'transform 0.3s ease-out',
          }}
        >
          COUNCIL YOUR PLANS
        </div>
      </AbsoluteFill>

      {/* Corner accent marks */}
      <div
        style={{
          position: 'absolute',
          top: 40,
          left: 40,
          width: 60,
          height: 60,
          borderTop: `6px solid ${THEME.accent}`,
          borderLeft: `6px solid ${THEME.accent}`,
          opacity: lineSweep,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          right: 40,
          width: 60,
          height: 60,
          borderBottom: `6px solid ${THEME.accent2}`,
          borderRight: `6px solid ${THEME.accent2}`,
          opacity: lineSweep,
        }}
      />
    </AbsoluteFill>
  );
};
