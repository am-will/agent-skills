import React from 'react';
import { AbsoluteFill, staticFile, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { slide } from '@remotion/transitions/slide';
import { fade } from '@remotion/transitions/fade';
import { wipe } from '@remotion/transitions/wipe';

import { Scene1_YourPlanSucks } from './scenes/Scene1_YourPlanSucks';
import { Scene2_Problem } from './scenes/Scene2_Problem';
import { Scene3_BrandReveal } from './scenes/Scene3_BrandReveal';
import { Scene4_MultiAgent } from './scenes/Scene4_MultiAgent';
import { Scene5_Judge } from './scenes/Scene5_Judge';
import { Scene7_Closing } from './scenes/Scene7_Closing';

/*
 * LLM Council Promotional Video
 * 20 seconds @ 30fps = 600 frames
 *
 * Scene breakdown:
 * 1. "YOUR PLAN SUCKS" shock opener (0-2s, 60 frames)
 * 2. Problem - fragmented brain (2-5s, 90 frames)
 * 3. Brand reveal - LLM COUNCIL (5-8s, 90 frames)
 * 4. Multi-Agent Planning (8-11s, 90 frames)
 * 5. LLM as Judge (11-14s, 90 frames)
 * 6. Build Better Plans (14-17s, 90 frames)
 * 7. Closing with tagline (17-20s, 90 frames)
 *
 * Total with transitions overlapping: ~600 frames
 */

export const LLMCouncilPromo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Transition timing - fast and punchy
  const quickTransition = linearTiming({ durationInFrames: 12 });
  const mediumTransition = linearTiming({ durationInFrames: 18 });

  // Audio volume with fade in/out
  const audioVolume = (f: number) => {
    const fadeInDuration = fps * 1; // 1 second fade in
    const fadeOutDuration = fps * 2; // 2 second fade out
    const fadeOutStart = durationInFrames - fadeOutDuration;

    // Fade in
    if (f < fadeInDuration) {
      return interpolate(f, [0, fadeInDuration], [0, 0.7], { extrapolateRight: 'clamp' });
    }
    // Fade out
    if (f > fadeOutStart) {
      return interpolate(f, [fadeOutStart, durationInFrames], [0.7, 0], { extrapolateLeft: 'clamp' });
    }
    // Full volume
    return 0.7;
  };

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a' }}>
      {/* Background music - trim first 15 frames of silence */}
      <Audio
        src={staticFile('background-music.mp3')}
        volume={audioVolume}
        trimBefore={15}
      />

      <TransitionSeries>
        {/* Scene 1: YOUR PLAN SUCKS - shock opener */}
        <TransitionSeries.Sequence durationInFrames={60}>
          <Scene1_YourPlanSucks />
        </TransitionSeries.Sequence>

        {/* Transition: Hard wipe - aggressive */}
        <TransitionSeries.Transition
          presentation={wipe({ direction: 'from-right' })}
          timing={quickTransition}
        />

        {/* Scene 2: The Problem - typing animation */}
        <TransitionSeries.Sequence durationInFrames={195}>
          <Scene2_Problem />
        </TransitionSeries.Sequence>

        {/* Transition: Fade - moment of realization */}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={mediumTransition}
        />

        {/* Scene 3: Brand Reveal - LLM COUNCIL */}
        <TransitionSeries.Sequence durationInFrames={100}>
          <Scene3_BrandReveal />
        </TransitionSeries.Sequence>

        {/* Transition: Slide from bottom - building up */}
        <TransitionSeries.Transition
          presentation={slide({ direction: 'from-bottom' })}
          timing={quickTransition}
        />

        {/* Scene 4: Multi-Agent Planning - carousel with spotlights */}
        <TransitionSeries.Sequence durationInFrames={190}>
          <Scene4_MultiAgent />
        </TransitionSeries.Sequence>

        {/* Transition: Wipe - clean cut */}
        <TransitionSeries.Transition
          presentation={wipe({ direction: 'from-left' })}
          timing={quickTransition}
        />

        {/* Scene 5: LLM as Judge */}
        <TransitionSeries.Sequence durationInFrames={250}>
          <Scene5_Judge />
        </TransitionSeries.Sequence>

        {/* Transition: Fade to closing */}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={mediumTransition}
        />

        {/* Scene 7: Closing */}
        <TransitionSeries.Sequence durationInFrames={100}>
          <Scene7_Closing />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
