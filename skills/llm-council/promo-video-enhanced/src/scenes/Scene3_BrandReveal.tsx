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

  // Enhanced particles burst effect - more particles for impact
  const particles = Array.from({ length: 24 }, (_, i) => {
    const angle = (i / 24) * Math.PI * 2;
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
      size: 6 + (i % 4) * 5, // Varied sizes
    };
  });

  // Light rays emanating from logo
  const lightRayOpacity = interpolate(frame, [10, 25, 45], [0, 0.6, 0], {
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
      {/* Sound Effect: Whoosh on brand reveal */}
      <Audio
        src={staticFile(AUDIO_PATHS.sfx.whoosh)}
        volume={SFX_TIMING.scene3.whoosh.volume}
        startFrom={SFX_TIMING.scene3.whoosh.startFrom}
      />

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

      {/* Light rays emanating from center */}
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        {Array.from({ length: 8 }).map((_, i) => {
          const rayAngle = (i / 8) * 360;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: 4,
                height: '120%',
                background: `linear-gradient(to bottom, transparent 40%, ${THEME.accent}${Math.floor(lightRayOpacity * 255).toString(16).padStart(2, '0')}, transparent 60%)`,
                transform: `rotate(${rayAngle}deg)`,
                transformOrigin: 'center center',
              }}
            />
          );
        })}
      </AbsoluteFill>

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
          }}
        >
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
