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

// OpenAI Logo SVG (for Codex)
const OpenAILogo: React.FC<{ size: number }> = ({ size }) => (
  <svg viewBox="0 0 512 512" width={size} height={size} fill="currentColor">
    <path d="M474.123 209.81c11.525-34.577 7.569-72.423-10.838-103.904-27.696-48.168-83.433-72.94-137.794-61.414a127.14 127.14 0 00-95.475-42.49c-55.564 0-104.936 35.781-122.139 88.593-35.781 7.397-66.574 29.76-84.637 61.414-27.868 48.167-21.503 108.72 15.826 150.007-11.525 34.578-7.569 72.424 10.838 103.733 27.696 48.34 83.433 73.111 137.966 61.585 24.084 27.18 58.833 42.835 95.303 42.663 55.564 0 104.936-35.782 122.139-88.594 35.782-7.397 66.574-29.76 84.465-61.413 28.04-48.168 21.676-108.722-15.654-150.008v-.172zm-39.567-87.218c11.01 19.267 15.139 41.803 11.354 63.65-.688-.516-2.064-1.204-2.924-1.72l-101.152-58.49a16.965 16.965 0 00-16.687 0L206.621 194.5v-50.232l97.883-56.597c45.587-26.32 103.732-10.666 130.052 34.921zm-227.935 104.42l49.888-28.9 49.887 28.9v57.63l-49.887 28.9-49.888-28.9v-57.63zm23.223-191.81c22.364 0 43.867 7.742 61.07 22.02-.688.344-2.064 1.204-3.097 1.72L186.666 117.26c-5.161 2.925-8.258 8.43-8.258 14.45v136.934l-43.523-25.116V130.333c0-52.64 42.491-95.13 95.131-95.302l-.172.172zM52.14 168.697c11.182-19.268 28.557-34.062 49.544-41.803V247.14c0 6.02 3.097 11.354 8.258 14.45l118.354 68.295-43.695 25.288-97.711-56.425c-45.415-26.32-61.07-84.465-34.75-130.052zm26.665 220.71c-11.182-19.095-15.139-41.802-11.354-63.65.688.516 2.064 1.204 2.924 1.72l101.152 58.49a16.965 16.965 0 0016.687 0l118.354-68.467v50.232l-97.883 56.425c-45.587 26.148-103.732 10.665-130.052-34.75h.172zm204.54 87.39c-22.192 0-43.867-7.741-60.898-22.02a62.439 62.439 0 003.097-1.72l101.152-58.317c5.16-2.924 8.429-8.43 8.257-14.45V243.527l43.523 25.116v113.022c0 52.64-42.663 95.303-95.131 95.303v-.172zM461.22 343.303c-11.182 19.267-28.729 34.061-49.544 41.63V264.687c0-6.021-3.097-11.526-8.257-14.45L284.893 181.77l43.523-25.116 97.883 56.424c45.587 26.32 61.07 84.466 34.75 130.053l.172.172z" />
  </svg>
);

// Claude Logo SVG
const ClaudeLogo: React.FC<{ size: number }> = ({ size }) => (
  <svg viewBox="0 0 512 509.64" width={size} height={size}>
    <path fill="#D77655" d="M115.612 0h280.775C459.974 0 512 52.026 512 115.612v278.415c0 63.587-52.026 115.612-115.613 115.612H115.612C52.026 509.639 0 457.614 0 394.027V115.612C0 52.026 52.026 0 115.612 0z"/>
    <path fill="#FCF2EE" d="M142.27 316.619l73.655-41.326 1.238-3.589-1.238-1.996-3.589-.001-12.31-.759-42.084-1.138-36.498-1.516-35.361-1.896-8.897-1.895-8.34-10.995.859-5.484 7.482-5.03 10.717.935 23.683 1.617 35.537 2.452 25.782 1.517 38.193 3.968h6.064l.86-2.451-2.073-1.517-1.618-1.517-36.776-24.922-39.81-26.338-20.852-15.166-11.273-7.683-5.687-7.204-2.451-15.721 10.237-11.273 13.75.935 3.513.936 13.928 10.716 29.749 23.027 38.848 28.612 5.687 4.727 2.275-1.617.278-1.138-2.553-4.271-21.13-38.193-22.546-38.848-10.035-16.101-2.654-9.655c-.935-3.968-1.617-7.304-1.617-11.374l11.652-15.823 6.445-2.073 15.545 2.073 6.547 5.687 9.655 22.092 15.646 34.78 24.265 47.291 7.103 14.028 3.791 12.992 1.416 3.968 2.449-.001v-2.275l1.997-26.641 3.69-32.707 3.589-42.084 1.239-11.854 5.863-14.206 11.652-7.683 9.099 4.348 7.482 10.716-1.036 6.926-4.449 28.915-8.72 45.294-5.687 30.331h3.313l3.792-3.791 15.342-20.372 25.782-32.227 11.374-12.789 13.27-14.129 8.517-6.724 16.1-.001 11.854 17.617-5.307 18.199-16.581 21.029-13.75 17.819-19.716 26.54-12.309 21.231 1.138 1.694 2.932-.278 44.536-9.479 24.062-4.347 28.714-4.928 12.992 6.066 1.416 6.167-5.106 12.613-30.71 7.583-36.018 7.204-53.636 12.689-.657.48.758.935 24.164 2.275 10.337.556h25.301l47.114 3.514 12.309 8.139 7.381 9.959-1.238 7.583-18.957 9.655-25.579-6.066-59.702-14.205-20.474-5.106-2.83-.001v1.694l17.061 16.682 31.266 28.233 39.152 36.397 1.997 8.999-5.03 7.102-5.307-.758-34.401-25.883-13.27-11.651-30.053-25.302-1.996-.001v2.654l6.926 10.136 36.574 54.975 1.895 16.859-2.653 5.485-9.479 3.311-10.414-1.895-21.408-30.054-22.092-33.844-17.819-30.331-2.173 1.238-10.515 113.261-4.929 5.788-11.374 4.348-9.478-7.204-5.03-11.652 5.03-23.027 6.066-30.052 4.928-23.886 4.449-29.674 2.654-9.858-.177-.657-2.173.278-22.37 30.71-34.021 45.977-26.919 28.815-6.445 2.553-11.173-5.789 1.037-10.337 6.243-9.2 37.257-47.392 22.47-29.371 14.508-16.961-.101-2.451h-.859l-98.954 64.251-17.618 2.275-7.583-7.103.936-11.652 3.589-3.791 29.749-20.474z"/>
  </svg>
);

// Google Gemini Logo SVG
const GeminiLogo: React.FC<{ size: number }> = ({ size }) => (
  <svg viewBox="0 0 65 65" width={size} height={size}>
    <defs>
      <linearGradient id="geminiGrad" x1="18.447" y1="43.42" x2="52.153" y2="15.004" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4893FC"/>
        <stop offset=".27" stopColor="#4893FC"/>
        <stop offset=".777" stopColor="#969DFF"/>
        <stop offset="1" stopColor="#BD99FE"/>
      </linearGradient>
    </defs>
    <path fill="url(#geminiGrad)" d="M32.447 0c.68 0 1.273.465 1.439 1.125a38.904 38.904 0 001.999 5.905c2.152 5 5.105 9.376 8.854 13.125 3.751 3.75 8.126 6.703 13.125 8.855a38.98 38.98 0 005.906 1.999c.66.166 1.124.758 1.124 1.438 0 .68-.464 1.273-1.125 1.439a38.902 38.902 0 00-5.905 1.999c-5 2.152-9.375 5.105-13.125 8.854-3.749 3.751-6.702 8.126-8.854 13.125a38.973 38.973 0 00-2 5.906 1.485 1.485 0 01-1.438 1.124c-.68 0-1.272-.464-1.438-1.125a38.913 38.913 0 00-2-5.905c-2.151-5-5.103-9.375-8.854-13.125-3.75-3.749-8.125-6.702-13.125-8.854a38.973 38.973 0 00-5.905-2A1.485 1.485 0 010 32.448c0-.68.465-1.272 1.125-1.438a38.903 38.903 0 005.905-2c5-2.151 9.376-5.104 13.125-8.854 3.75-3.749 6.703-8.125 8.855-13.125a38.972 38.972 0 001.999-5.905A1.485 1.485 0 0132.447 0z"/>
  </svg>
);

// OpenCode Logo SVG
const OpenCodeLogo: React.FC<{ size: number }> = ({ size }) => (
  <svg viewBox="0 0 40 40" width={size} height={size}>
    <rect x="4" y="4" width="8" height="8" fill="#B7B1B1"/>
    <rect x="16" y="4" width="8" height="8" fill="#656363"/>
    <rect x="28" y="4" width="8" height="8" fill="#B7B1B1"/>
    <rect x="4" y="16" width="8" height="8" fill="#656363"/>
    <rect x="16" y="16" width="8" height="8" fill="#B7B1B1"/>
    <rect x="28" y="16" width="8" height="8" fill="#656363"/>
    <rect x="4" y="28" width="8" height="8" fill="#B7B1B1"/>
    <rect x="16" y="28" width="8" height="8" fill="#656363"/>
    <rect x="28" y="28" width="8" height="8" fill="#B7B1B1"/>
  </svg>
);

// Agent card component
const AgentCard: React.FC<{
  name: string;
  logo: React.ReactNode;
  color: string;
  isSpotlight: boolean;
  spotlightProgress: number;
}> = ({ name, logo, color, isSpotlight, spotlightProgress }) => {
  const glowIntensity = isSpotlight ? spotlightProgress : 0;

  return (
    <div
      style={{
        width: 180,
        height: 220,
        backgroundColor: THEME.panel,
        border: `4px solid ${isSpotlight ? color : THEME.ink}`,
        boxShadow: isSpotlight
          ? `0 0 ${40 * glowIntensity}px ${color}, 8px 8px 0 ${THEME.shadow}`
          : `8px 8px 0 ${THEME.shadow}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        transition: 'none',
      }}
    >
      <div style={{
        width: 72,
        height: 72,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {logo}
      </div>
      <div
        style={{
          fontFamily,
          fontSize: 18,
          letterSpacing: '0.06em',
          color: THEME.ink,
          textAlign: 'center',
          fontWeight: 'bold',
        }}
      >
        {name}
      </div>
      <div
        style={{
          width: 50,
          height: 6,
          backgroundColor: color,
        }}
      />
    </div>
  );
};

export const Scene4_MultiAgent: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Agents data
  const agents = [
    { name: 'CODEX', logo: <OpenAILogo size={64} />, color: '#10a37f' },
    { name: 'CLAUDE', logo: <ClaudeLogo size={64} />, color: '#D77655' },
    { name: 'GEMINI', logo: <GeminiLogo size={64} />, color: '#4893FC' },
    { name: 'OPENCODE', logo: <OpenCodeLogo size={64} />, color: '#656363' },
  ];

  // Title entrance
  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  // Carousel setup
  const CAROUSEL_RADIUS = 320;
  const INTRO_DURATION = 25;
  const SPOTLIGHT_DURATION = 30;
  const ROTATION_SPEED = 0.008; // radians per frame

  // Intro animation - cards fly in
  const introProgress = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 60 },
  });

  // Continuous rotation
  const baseRotation = frame * ROTATION_SPEED;

  // Spotlight timing - each agent gets a moment
  const getSpotlightInfo = (agentIndex: number) => {
    const spotlightStart = INTRO_DURATION + agentIndex * SPOTLIGHT_DURATION;
    const spotlightEnd = spotlightStart + SPOTLIGHT_DURATION;
    const isActive = frame >= spotlightStart && frame < spotlightEnd;
    const progress = isActive
      ? interpolate(
          frame,
          [spotlightStart, spotlightStart + 10, spotlightEnd - 10, spotlightEnd],
          [0, 1, 1, 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        )
      : 0;
    return { isActive, progress };
  };

  // Overall zoom - stays enlarged once spotlights start
  // Calculate when spotlight sequence ends (all 4 agents done)
  const SPOTLIGHT_SEQUENCE_END = INTRO_DURATION + 4 * (SPOTLIGHT_DURATION + 5);
  const spotlightsHaveStarted = frame >= INTRO_DURATION;

  const currentZoom = interpolate(
    frame,
    [0, INTRO_DURATION, INTRO_DURATION + 10],
    [0.5, 1, 1.15],
    { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) }
  );

  // Particles that orbit
  const particles = Array.from({ length: 24 }, (_, i) => {
    const baseAngle = (i / 24) * Math.PI * 2;
    const orbitRadius = 420 + (i % 3) * 40;
    const speed = 0.015 + (i % 4) * 0.003;
    const angle = baseAngle + frame * speed;
    return {
      x: Math.cos(angle) * orbitRadius,
      y: Math.sin(angle) * orbitRadius * 0.6,
      size: 4 + (i % 3) * 3,
      opacity: 0.4 + (i % 3) * 0.2,
      color: agents[i % 4].color,
    };
  });

  // Sparkle bursts during spotlight
  const sparkles = Array.from({ length: 16 }, (_, i) => {
    const activeAgent = agents.findIndex((_, idx) => getSpotlightInfo(idx).isActive);
    if (activeAgent === -1) return null;

    const { progress } = getSpotlightInfo(activeAgent);
    const burstAngle = (i / 16) * Math.PI * 2;
    const burstDistance = 100 + progress * 150;
    const agentAngle = (activeAgent / 4) * Math.PI * 2 + baseRotation;
    const centerX = Math.cos(agentAngle) * CAROUSEL_RADIUS;
    const centerY = Math.sin(agentAngle) * CAROUSEL_RADIUS * 0.6;

    return {
      x: centerX + Math.cos(burstAngle) * burstDistance * progress,
      y: centerY + Math.sin(burstAngle) * burstDistance * progress,
      size: 6,
      opacity: progress * (1 - progress) * 4,
      color: agents[activeAgent].color,
    };
  }).filter(Boolean);

  // Energy ring pulse
  const ringPulse = interpolate(
    Math.sin(frame * 0.15),
    [-1, 1],
    [0.9, 1.1]
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.bgDark,
        overflow: 'hidden',
      }}
    >
      {/* Radial gradient background */}
      <AbsoluteFill
        style={{
          background: `
            radial-gradient(circle at 50% 50%, rgba(255,107,0,0.15) 0%, transparent 40%),
            radial-gradient(circle at 30% 30%, rgba(72,147,252,0.1) 0%, transparent 30%),
            radial-gradient(circle at 70% 70%, rgba(215,118,85,0.1) 0%, transparent 30%)
          `,
        }}
      />

      {/* Title at top */}
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
            textShadow: `4px 4px 0 ${THEME.accent}, 0 0 40px ${THEME.accent}60`,
            transform: `scale(${titleProgress})`,
            opacity: titleProgress,
          }}
        >
          MULTI-AGENT PLANNING
        </div>
      </AbsoluteFill>

      {/* Main carousel container */}
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          transform: `scale(${currentZoom * introProgress})`,
        }}
      >
        {/* Orbiting particles */}
        {particles.map((p, i) => (
          <div
            key={`particle-${i}`}
            style={{
              position: 'absolute',
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: '50%',
              transform: `translate(${p.x}px, ${p.y}px)`,
              opacity: p.opacity * introProgress,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            }}
          />
        ))}

        {/* Energy rings */}
        {[1, 1.3, 1.6].map((scale, i) => (
          <div
            key={`ring-${i}`}
            style={{
              position: 'absolute',
              width: CAROUSEL_RADIUS * 2 + 100,
              height: (CAROUSEL_RADIUS * 2 + 100) * 0.6,
              border: `2px solid ${THEME.accent}`,
              borderRadius: '50%',
              opacity: 0.15 - i * 0.04,
              transform: `scale(${scale * ringPulse})`,
            }}
          />
        ))}

        {/* Spotlight sparkle bursts */}
        {sparkles.map((s, i) => s && (
          <div
            key={`sparkle-${i}`}
            style={{
              position: 'absolute',
              width: s.size,
              height: s.size,
              backgroundColor: s.color,
              transform: `translate(${s.x}px, ${s.y}px) rotate(45deg)`,
              opacity: s.opacity,
              boxShadow: `0 0 10px ${s.color}`,
            }}
          />
        ))}

        {/* Center glow */}
        <div
          style={{
            position: 'absolute',
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${THEME.accent}40 0%, transparent 70%)`,
            transform: `scale(${ringPulse})`,
          }}
        />

        {/* Carousel of agent cards */}
        {agents.map((agent, i) => {
          const angle = (i / 4) * Math.PI * 2 + baseRotation;
          const x = Math.cos(angle) * CAROUSEL_RADIUS;
          const y = Math.sin(angle) * CAROUSEL_RADIUS * 0.6; // Elliptical for 3D effect
          const zIndex = Math.round(Math.sin(angle) * 100) + 100;

          // Scale based on position (closer = bigger for 3D effect)
          const depthScale = interpolate(Math.sin(angle), [-1, 1], [0.7, 1.1]);

          // Spotlight effect
          const { isActive, progress } = getSpotlightInfo(i);
          const spotlightScale = isActive ? 1 + progress * 0.3 : 1;
          const spotlightY = isActive ? -progress * 30 : 0;

          // Intro fly-in
          const flyInDelay = i * 5;
          const flyInProgress = spring({
            frame: frame - flyInDelay,
            fps,
            config: { damping: 14, stiffness: 80 },
          });
          const flyInX = interpolate(flyInProgress, [0, 1], [(i - 1.5) * 400, 0]);
          const flyInY = interpolate(flyInProgress, [0, 1], [-300, 0]);

          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                transform: `
                  translate(${x + flyInX}px, ${y + spotlightY + flyInY}px)
                  scale(${depthScale * spotlightScale * flyInProgress})
                `,
                zIndex,
                filter: isActive ? `brightness(1.2)` : `brightness(${interpolate(depthScale, [0.7, 1.1], [0.7, 1])})`,
              }}
            >
              <AgentCard
                name={agent.name}
                logo={agent.logo}
                color={agent.color}
                isSpotlight={isActive}
                spotlightProgress={progress}
              />

              {/* Agent name callout during spotlight */}
              {isActive && progress > 0.3 && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: -50,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontFamily,
                    fontSize: 28,
                    color: agent.color,
                    textShadow: `0 0 20px ${agent.color}`,
                    opacity: progress,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {agent.name}
                </div>
              )}
            </div>
          );
        })}

      </AbsoluteFill>

      {/* Scan lines overlay for extra flair */}
      <AbsoluteFill
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent 0 2px,
            rgba(0,0,0,0.03) 2px 4px
          )`,
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
