import React from 'react';
import { AbsoluteFill, Audio, staticFile } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { slide } from '@remotion/transitions/slide';
import { fade } from '@remotion/transitions/fade';
import { wipe } from '@remotion/transitions/wipe';

import { Scene1_YourPlanSucks } from './scenes/Scene1_YourPlanSucks';
import { Scene2_Problem } from './scenes/Scene2_Problem';
import { Scene3_BrandReveal } from './scenes/Scene3_BrandReveal';
import { Scene4_MultiAgent } from './scenes/Scene4_MultiAgent';
import { Scene5_Judge } from './scenes/Scene5_Judge';
import { Scene6_BetterPlans } from './scenes/Scene6_BetterPlans';
import { Scene7_Closing } from './scenes/Scene7_Closing';
import { AUDIO_PATHS, BG_MUSIC } from './utils/soundEffects';

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
  // Transition timing - fast and punchy
  const quickTransition = linearTiming({ durationInFrames: 12 });
  const mediumTransition = linearTiming({ durationInFrames: 18 });

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a' }}>
      {/* Background Music - plays throughout entire video */}
      <Audio
        src={staticFile(AUDIO_PATHS.bgMusic)}
        volume={BG_MUSIC.volume}
        startFrom={BG_MUSIC.startFrom}
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

        {/* Scene 2: The Problem */}
        <TransitionSeries.Sequence durationInFrames={90}>
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

        {/* Scene 4: Multi-Agent Planning */}
        <TransitionSeries.Sequence durationInFrames={95}>
          <Scene4_MultiAgent />
        </TransitionSeries.Sequence>

        {/* Transition: Wipe - clean cut */}
        <TransitionSeries.Transition
          presentation={wipe({ direction: 'from-left' })}
          timing={quickTransition}
        />

        {/* Scene 5: LLM as Judge */}
        <TransitionSeries.Sequence durationInFrames={95}>
          <Scene5_Judge />
        </TransitionSeries.Sequence>

        {/* Transition: Slide from right */}
        <TransitionSeries.Transition
          presentation={slide({ direction: 'from-right' })}
          timing={quickTransition}
        />

        {/* Scene 6: Build Better Plans */}
        <TransitionSeries.Sequence durationInFrames={90}>
          <Scene6_BetterPlans />
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
