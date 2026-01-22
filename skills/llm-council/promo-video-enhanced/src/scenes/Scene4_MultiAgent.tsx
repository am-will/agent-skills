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

// Agent card component
const AgentCard: React.FC<{
  name: string;
  icon: string;
  color: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
}> = ({ name, icon, color, x, y, scale, rotation, opacity }) => (
  <div
    style={{
      position: 'absolute',
      width: 180,
      height: 220,
      backgroundColor: THEME.panel,
      border: `4px solid ${THEME.ink}`,
      boxShadow: `8px 8px 0 ${THEME.shadow}`,
      transform: `translate(${x}px, ${y}px) scale(${scale}) rotate(${rotation}deg)`,
      opacity,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
    }}
  >
    <div
      style={{
        fontSize: 64,
        lineHeight: 1,
      }}
    >
      {icon}
    </div>
    <div
      style={{
        fontFamily,
        fontSize: 18,
        letterSpacing: '0.06em',
        color: THEME.ink,
        textAlign: 'center',
        padding: '0 8px',
      }}
    >
      {name}
    </div>
    <div
      style={{
        width: 40,
        height: 6,
        backgroundColor: color,
      }}
    />
  </div>
);

export const Scene4_MultiAgent: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Agents data
  const agents = [
    { name: 'CODEX', icon: '🔮', color: '#8b5cf6', startX: -600, startY: -200 },
    { name: 'CLAUDE', icon: '🧠', color: THEME.accent, startX: 0, startY: -400 },
    { name: 'GEMINI', icon: '💎', color: THEME.accent2, startX: 600, startY: -200 },
  ];

  // Final positions (converging triangle)
  const finalPositions = [
    { x: -250, y: 50 },
    { x: 0, y: -120 },
    { x: 250, y: 50 },
  ];

  // Connection lines progress
  const lineProgress = interpolate(frame, [50, 75], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Title entrance
  const titleProgress = spring({
    frame: frame - 10,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  // Center glow
  const glowOpacity = interpolate(frame, [60, 80], [0, 0.6], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const glowScale = interpolate(frame, [60, 90], [0.5, 1.2], {
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
      {/* Sound Effect: Connection beep when agents link */}
      <Audio
        src={staticFile(AUDIO_PATHS.sfx.beep)}
        volume={SFX_TIMING.scene4.beep.volume}
        startFrom={SFX_TIMING.scene4.beep.startFrom}
      />

      {/* Subtle radial grid */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(255,107,0,0.1) 0%, transparent 50%)`,
        }}
      />

      {/* Title at top */}
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
            textShadow: `4px 4px 0 ${THEME.accent}`,
            transform: `scale(${titleProgress})`,
            opacity: titleProgress,
          }}
        >
          MULTI-AGENT PLANNING
        </div>
      </AbsoluteFill>

      {/* Agent cards container */}
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Center convergence glow */}
        <div
          style={{
            position: 'absolute',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${THEME.accent}40 0%, transparent 70%)`,
            opacity: glowOpacity,
            transform: `scale(${glowScale})`,
          }}
        />

        {/* Connection lines */}
        <svg
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
          viewBox="-960 -540 1920 1080"
        >
          {/* Lines between agents */}
          {[
            [finalPositions[0], finalPositions[1]],
            [finalPositions[1], finalPositions[2]],
            [finalPositions[2], finalPositions[0]],
          ].map(([from, to], i) => {
            const length = Math.sqrt(
              Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2)
            );
            return (
              <line
                key={i}
                x1={from.x}
                y1={from.y}
                x2={from.x + (to.x - from.x) * lineProgress}
                y2={from.y + (to.y - from.y) * lineProgress}
                stroke={THEME.accent}
                strokeWidth={4}
                strokeDasharray={`${length * lineProgress} ${length}`}
                opacity={0.8}
              />
            );
          })}
        </svg>

        {/* Agent cards */}
        {agents.map((agent, i) => {
          // Enhanced stagger - 12 frames between each agent instead of 8
          const agentProgress = spring({
            frame: frame - i * 12,
            fps,
            config: { damping: 12, stiffness: 80 },
          });

          const x = interpolate(
            agentProgress,
            [0, 1],
            [agent.startX, finalPositions[i].x]
          );
          const y = interpolate(
            agentProgress,
            [0, 1],
            [agent.startY, finalPositions[i].y]
          );
          const rotation = interpolate(agentProgress, [0, 1], [15 * (i - 1), 0]);

          return (
            <AgentCard
              key={i}
              name={agent.name}
              icon={agent.icon}
              color={agent.color}
              x={x}
              y={y}
              scale={agentProgress}
              rotation={rotation}
              opacity={agentProgress}
            />
          );
        })}

        {/* Enhanced center pulse with multi-layer glow */}
        {lineProgress > 0.8 && (
          <>
            {/* Outer glow ring */}
            <div
              style={{
                position: 'absolute',
                width: 120,
                height: 120,
                borderRadius: '50%',
                border: `3px solid ${THEME.accent}`,
                transform: `scale(${interpolate(frame % 45, [0, 22, 45], [0.9, 1.3, 0.9])})`,
                opacity: 0.4,
              }}
            />
            {/* Middle glow */}
            <div
              style={{
                position: 'absolute',
                width: 100,
                height: 100,
                borderRadius: '50%',
                backgroundColor: THEME.accent,
                transform: `scale(${interpolate(frame % 35, [0, 17, 35], [0.85, 1.15, 0.85])})`,
                opacity: 0.5,
                boxShadow: `0 0 50px ${THEME.accent}, 0 0 80px ${THEME.accent}80`,
              }}
            />
            {/* Core pulse */}
            <div
              style={{
                position: 'absolute',
                width: 60,
                height: 60,
                borderRadius: '50%',
                backgroundColor: THEME.panel,
                transform: `scale(${interpolate(frame % 30, [0, 15, 30], [0.9, 1.1, 0.9])})`,
                opacity: 1,
                boxShadow: `0 0 30px ${THEME.accent}`,
                border: `2px solid ${THEME.accent}`,
              }}
            />
          </>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
