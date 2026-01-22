import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';
import { loadFont as loadDisplayFont } from '@remotion/google-fonts/BlackOpsOne';
import { loadFont as loadMonoFont } from '@remotion/google-fonts/JetBrainsMono';
import { THEME } from '../theme';

const { fontFamily: displayFont } = loadDisplayFont();
const { fontFamily: monoFont } = loadMonoFont();

// Simulated Claude Code plan content
const PLAN_CONTENT = `## Implementation Plan

### Phase 1: Database Schema
- Add user_preferences table
- Create migration scripts
- Update ORM models

### Phase 2: API Endpoints
- POST /api/preferences
- GET /api/preferences/:id
- Implement validation

### Phase 3: Frontend
- Build settings panel
- Add form components
- Wire up API calls`;

const USER_RESPONSE = 'No, this is terrible!!!!!';

export const Scene2_Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Zoom in effect
  const zoomProgress = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 60 },
  });

  const scale = interpolate(zoomProgress, [0, 1], [0.85, 1], {
    extrapolateRight: 'clamp',
  });

  // Terminal appears
  const terminalOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Typewriter effect for user response
  const typingStartFrame = 50;
  const charsPerFrame = 0.4;
  const typedChars = Math.max(
    0,
    Math.min(
      USER_RESPONSE.length,
      Math.floor((frame - typingStartFrame) * charsPerFrame)
    )
  );
  const typedText = USER_RESPONSE.slice(0, typedChars);

  // Cursor blink
  const cursorVisible = frame > typingStartFrame && Math.floor(frame / 8) % 2 === 0;

  // Red flash when typing starts
  const angryFlash = interpolate(
    frame,
    [typingStartFrame, typingStartFrame + 5, typingStartFrame + 15],
    [0, 0.3, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#1a1a2e',
        overflow: 'hidden',
      }}
    >
      {/* Angry red flash overlay */}
      <AbsoluteFill
        style={{
          backgroundColor: '#ff3333',
          opacity: angryFlash,
          pointerEvents: 'none',
        }}
      />

      {/* Subtle scan lines */}
      <AbsoluteFill
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent 0 2px,
            rgba(0,0,0,0.1) 2px 4px
          )`,
          pointerEvents: 'none',
        }}
      />

      {/* Terminal container with zoom */}
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          transform: `scale(${scale})`,
          opacity: terminalOpacity,
        }}
      >
        {/* Terminal window */}
        <div
          style={{
            width: 1400,
            height: 800,
            backgroundColor: '#0d1117',
            borderRadius: 12,
            border: '2px solid #30363d',
            boxShadow: '0 25px 80px rgba(0,0,0,0.6)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Terminal title bar */}
          <div
            style={{
              height: 40,
              backgroundColor: '#161b22',
              borderBottom: '1px solid #30363d',
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
              gap: 8,
            }}
          >
            {/* Traffic lights */}
            <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ff5f56' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#27ca40' }} />
            <div
              style={{
                flex: 1,
                textAlign: 'center',
                fontFamily: monoFont,
                fontSize: 13,
                color: '#8b949e',
              }}
            >
              claude — plan mode
            </div>
          </div>

          {/* Terminal content */}
          <div
            style={{
              flex: 1,
              padding: 24,
              fontFamily: monoFont,
              fontSize: 16,
              lineHeight: 1.6,
              color: '#c9d1d9',
              overflow: 'hidden',
            }}
          >
            {/* Claude's plan header */}
            <div style={{ color: '#a371f7', marginBottom: 8 }}>
              ╭─ Claude is planning...
            </div>
            <div style={{ color: '#8b949e', marginBottom: 16 }}>
              │
            </div>

            {/* Plan content */}
            <div
              style={{
                backgroundColor: '#161b22',
                border: '1px solid #30363d',
                borderRadius: 8,
                padding: 16,
                marginBottom: 20,
                whiteSpace: 'pre-wrap',
              }}
            >
              <div style={{ color: '#7ee787', marginBottom: 12 }}>
                📋 Plan Preview
              </div>
              <div style={{ color: '#8b949e', fontSize: 14 }}>
                {PLAN_CONTENT}
              </div>
            </div>

            {/* Divider */}
            <div style={{ color: '#30363d', marginBottom: 16 }}>
              ────────────────────────────────────────
            </div>

            {/* User input area */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <span style={{ color: '#f78166' }}>❯</span>
              <span style={{ color: '#58a6ff' }}>Reply:</span>
              <span style={{ color: '#ff7b72', fontWeight: 'bold' }}>
                {typedText}
                {cursorVisible && (
                  <span
                    style={{
                      backgroundColor: '#ff7b72',
                      color: '#0d1117',
                      padding: '0 2px',
                    }}
                  >
                    {' '}
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      </AbsoluteFill>

      {/* Vignette */}
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)',
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
