import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';
import { loadFont } from '@remotion/google-fonts/BlackOpsOne';
import { THEME } from '../theme';

const { fontFamily } = loadFont();

export const Scene3_BrandReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Epic zoom from far away
  const zoomProgress = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 80, mass: 1.2 },
  });

  // Scale from tiny and far to perfect fit
  const scale = interpolate(zoomProgress, [0, 1], [0.1, 1], {
    extrapolateRight: 'clamp',
  });

  // Slight rotation that settles
  const rotation = interpolate(zoomProgress, [0, 1], [-8, -1], {
    extrapolateRight: 'clamp',
  });

  // Background panel slam
  const panelProgress = spring({
    frame: frame - 5,
    fps,
    config: { damping: 18, stiffness: 200 },
  });

  // Shadow offset animates in
  const shadowOffset = interpolate(zoomProgress, [0, 1], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Accent line wipes
  const lineWipe = interpolate(frame, [20, 45], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });

  // "Introducing" text animation - appears first
  const introducingProgress = spring({
    frame: frame - 10,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  const introducingOpacity = interpolate(introducingProgress, [0, 1], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const introducingY = interpolate(introducingProgress, [0, 1], [-20, 0], {
    extrapolateRight: 'clamp',
  });

  // Particles burst effect
  const particles = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    const distance = interpolate(frame, [0, 15, 40], [0, 400, 600], {
      extrapolateRight: 'clamp',
    });
    const particleOpacity = interpolate(frame, [0, 10, 35], [0, 1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      opacity: particleOpacity,
      size: 8 + (i % 3) * 6,
    };
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.bg,
        overflow: 'hidden',
      }}
    >
      {/* Diagonal pattern from UI */}
      <AbsoluteFill
        style={{
          backgroundImage: `repeating-linear-gradient(
            135deg,
            rgba(0,0,0,0.04) 0 2px,
            transparent 2px 10px
          )`,
        }}
      />

      {/* Radial gradient like UI */}
      <AbsoluteFill
        style={{
          background: 'radial-gradient(circle at 30% 30%, #fff4d6 0%, transparent 60%)',
          opacity: 0.8,
        }}
      />

      {/* Burst particles */}
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {particles.map((p, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: p.size,
              height: p.size,
              backgroundColor: i % 2 === 0 ? THEME.accent : THEME.accent2,
              transform: `translate(${p.x}px, ${p.y}px)`,
              opacity: p.opacity,
            }}
          />
        ))}
      </AbsoluteFill>

      {/* Main brand container */}
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Background panel (brutalist style) */}
        <div
          style={{
            position: 'absolute',
            padding: '40px 80px',
            backgroundColor: THEME.warmBg,
            border: `4px solid ${THEME.ink}`,
            boxShadow: `${12 * panelProgress}px ${12 * panelProgress}px 0 ${THEME.shadow}`,
            transform: `scale(${panelProgress})`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {/* "Introducing" text */}
          <div
            style={{
              fontFamily,
              fontSize: 48,
              fontWeight: 900,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: THEME.accent,
              opacity: introducingOpacity,
              transform: `translateY(${introducingY}px)`,
            }}
          >
            INTRODUCING
          </div>

          {/* Brand text with signature shadow */}
          <div
            style={{
              fontFamily,
              fontSize: 160,
              fontWeight: 900,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              lineHeight: 1.1,
              color: THEME.ink,
              textShadow: `
                ${6 * shadowOffset}px ${6 * shadowOffset}px 0 ${THEME.accent},
                ${12 * shadowOffset}px ${12 * shadowOffset}px 0 rgba(0,0,0,0.2)
              `,
              transform: `scale(${scale}) rotate(${rotation}deg)`,
            }}
          >
            LLM COUNCIL
          </div>
        </div>

        {/* Accent lines */}
        <div
          style={{
            position: 'absolute',
            top: '25%',
            left: 0,
            width: `${lineWipe * 30}%`,
            height: 6,
            backgroundColor: THEME.accent,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '25%',
            right: 0,
            width: `${lineWipe * 30}%`,
            height: 6,
            backgroundColor: THEME.accent2,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
