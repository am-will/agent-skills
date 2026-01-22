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

// Chaotic document
const ChaoticDoc: React.FC<{ opacity: number; scale: number }> = ({ opacity, scale }) => (
  <div
    style={{
      position: 'absolute',
      width: 300,
      height: 400,
      backgroundColor: '#fff',
      border: `3px solid ${THEME.ink}`,
      boxShadow: `6px 6px 0 ${THEME.shadow}`,
      opacity,
      transform: `scale(${scale})`,
      overflow: 'hidden',
      padding: 20,
    }}
  >
    {/* Messy lines representing bad plan */}
    {Array.from({ length: 12 }, (_, i) => (
      <div
        key={i}
        style={{
          height: 12,
          marginBottom: 10,
          backgroundColor: THEME.ink,
          opacity: 0.2 + Math.random() * 0.3,
          width: `${40 + Math.random() * 50}%`,
          transform: `rotate(${(Math.random() - 0.5) * 8}deg)`,
        }}
      />
    ))}
    {/* X marks */}
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: 120,
        color: '#ff3333',
        opacity: 0.5,
      }}
    >
      ✗
    </div>
  </div>
);

// Clean, organized document
const CleanDoc: React.FC<{ opacity: number; scale: number }> = ({ opacity, scale }) => (
  <div
    style={{
      position: 'absolute',
      width: 300,
      height: 400,
      backgroundColor: THEME.warmBg,
      border: `4px solid ${THEME.ink}`,
      boxShadow: `8px 8px 0 ${THEME.accent}`,
      opacity,
      transform: `scale(${scale})`,
      padding: 24,
    }}
  >
    {/* Clean header */}
    <div
      style={{
        height: 20,
        width: '80%',
        backgroundColor: THEME.ink,
        marginBottom: 20,
      }}
    />
    {/* Organized bullet points */}
    {Array.from({ length: 6 }, (_, i) => (
      <div
        key={i}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 16,
            height: 16,
            backgroundColor: i < 4 ? THEME.accent : THEME.ink,
            opacity: i < 4 ? 1 : 0.3,
          }}
        />
        <div
          style={{
            height: 10,
            flex: 1,
            backgroundColor: THEME.ink,
            opacity: 0.7,
          }}
        />
      </div>
    ))}
    {/* Check mark */}
    <div
      style={{
        position: 'absolute',
        bottom: 20,
        right: 20,
        fontSize: 48,
        color: THEME.accent,
      }}
    >
      ✓
    </div>
  </div>
);

export const Scene6_BetterPlans: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Transformation progress
  const transformProgress = interpolate(frame, [20, 50], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });

  // Chaotic doc fades/shrinks
  const chaoticOpacity = interpolate(transformProgress, [0, 0.5], [1, 0], {
    extrapolateRight: 'clamp',
  });
  const chaoticScale = interpolate(transformProgress, [0, 0.5], [1, 0.8], {
    extrapolateRight: 'clamp',
  });

  // Clean doc appears/grows
  const cleanOpacity = interpolate(transformProgress, [0.4, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const cleanScale = spring({
    frame: frame - 35,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  // Title zoom
  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  // Sparkle particles
  const sparkles = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    const distance = 180 + Math.sin(frame * 0.1 + i) * 20;
    const sparkleOpacity = interpolate(frame, [40, 55, 60], [0, 1, 0.7], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    return {
      x: Math.cos(angle + frame * 0.02) * distance,
      y: Math.sin(angle + frame * 0.02) * distance,
      opacity: sparkleOpacity,
      size: 6 + (i % 3) * 4,
    };
  });

  // Arrow animation
  const arrowProgress = interpolate(frame, [15, 35], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.bg,
        overflow: 'hidden',
      }}
    >
      {/* Background pattern */}
      <AbsoluteFill
        style={{
          backgroundImage: `repeating-linear-gradient(
            135deg,
            rgba(0,0,0,0.04) 0 2px,
            transparent 2px 10px
          )`,
        }}
      />

      {/* Radial glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 50%, ${THEME.accent}20 0%, transparent 50%)`,
          opacity: cleanOpacity,
        }}
      />

      {/* Title */}
      <AbsoluteFill
        style={{
          justifyContent: 'flex-start',
          alignItems: 'center',
          paddingTop: 60,
        }}
      >
        <div
          style={{
            fontFamily,
            fontSize: 80,
            color: THEME.ink,
            letterSpacing: '0.08em',
            textShadow: `4px 4px 0 ${THEME.accent}`,
            transform: `scale(${titleProgress})`,
          }}
        >
          BUILD BETTER PLANS
        </div>
      </AbsoluteFill>

      {/* Document transformation area */}
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Transformation arrow */}
        <div
          style={{
            position: 'absolute',
            fontSize: 80,
            color: THEME.accent,
            opacity: arrowProgress,
            transform: `translateX(${interpolate(arrowProgress, [0, 1], [-50, 0])}px)`,
          }}
        >
          →
        </div>

        {/* Chaotic document (left) */}
        <div style={{ transform: 'translateX(-200px)' }}>
          <ChaoticDoc opacity={chaoticOpacity} scale={chaoticScale} />
        </div>

        {/* Clean document (right) */}
        <div style={{ transform: 'translateX(200px)' }}>
          <CleanDoc
            opacity={cleanOpacity}
            scale={Math.max(0, cleanScale)}
          />
        </div>

        {/* Sparkles around clean doc */}
        {sparkles.map((s, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: s.size,
              height: s.size,
              backgroundColor: i % 2 === 0 ? THEME.accent : THEME.accent2,
              transform: `translate(${200 + s.x}px, ${s.y}px) rotate(45deg)`,
              opacity: s.opacity,
            }}
          />
        ))}
      </AbsoluteFill>

      {/* Bottom tagline */}
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
            fontSize: 36,
            color: THEME.ink,
            letterSpacing: '0.04em',
            opacity: cleanOpacity,
          }}
        >
          FROM CHAOS TO CLARITY
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
