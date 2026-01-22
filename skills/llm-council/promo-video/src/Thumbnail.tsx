import React from 'react';
import { AbsoluteFill } from 'remotion';
import { loadFont } from '@remotion/google-fonts/BlackOpsOne';
import { THEME } from './theme';

const { fontFamily } = loadFont();

export const Thumbnail: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.bgDark,
        overflow: 'hidden',
      }}
    >
      {/* Diagonal lines background */}
      <AbsoluteFill
        style={{
          backgroundImage: `repeating-linear-gradient(
            135deg,
            rgba(255,107,0,0.08) 0 2px,
            transparent 2px 20px
          )`,
        }}
      />

      {/* Main text - positioned left like Scene 1 */}
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'flex-start',
          paddingLeft: '12%',
        }}
      >
        <div
          style={{
            fontFamily,
            fontSize: 160,
            fontWeight: 900,
            letterSpacing: '0.06em',
            lineHeight: 1.1,
            color: THEME.panel,
            textShadow: `
              8px 8px 0 ${THEME.accent},
              16px 16px 0 rgba(0,0,0,0.3)
            `,
          }}
        >
          YOUR PLAN
          <br />
          SUCKS
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
