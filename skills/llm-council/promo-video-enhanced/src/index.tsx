import { registerRoot } from 'remotion';
import { Composition } from 'remotion';
import React from 'react';
import { LLMCouncilPromo } from './LLMCouncilPromo';
import { VIDEO_CONFIG } from './theme';

// Individual scene imports for preview/testing
import { Scene1_YourPlanSucks } from './scenes/Scene1_YourPlanSucks';
import { Scene2_Problem } from './scenes/Scene2_Problem';
import { Scene3_BrandReveal } from './scenes/Scene3_BrandReveal';
import { Scene4_MultiAgent } from './scenes/Scene4_MultiAgent';
import { Scene5_Judge } from './scenes/Scene5_Judge';
import { Scene6_BetterPlans } from './scenes/Scene6_BetterPlans';
import { Scene7_Closing } from './scenes/Scene7_Closing';

export const RemotionRoot: React.FC = () => {
  const { width, height, fps, durationInSeconds } = VIDEO_CONFIG;

  return (
    <>
      {/* Main promotional video */}
      <Composition
        id="LLMCouncilPromo"
        component={LLMCouncilPromo}
        durationInFrames={fps * durationInSeconds}
        fps={fps}
        width={width}
        height={height}
      />

      {/* Individual scenes for preview/editing */}
      <Composition
        id="Scene1-YourPlanSucks"
        component={Scene1_YourPlanSucks}
        durationInFrames={60}
        fps={fps}
        width={width}
        height={height}
      />
      <Composition
        id="Scene2-Problem"
        component={Scene2_Problem}
        durationInFrames={90}
        fps={fps}
        width={width}
        height={height}
      />
      <Composition
        id="Scene3-BrandReveal"
        component={Scene3_BrandReveal}
        durationInFrames={100}
        fps={fps}
        width={width}
        height={height}
      />
      <Composition
        id="Scene4-MultiAgent"
        component={Scene4_MultiAgent}
        durationInFrames={95}
        fps={fps}
        width={width}
        height={height}
      />
      <Composition
        id="Scene5-Judge"
        component={Scene5_Judge}
        durationInFrames={95}
        fps={fps}
        width={width}
        height={height}
      />
      <Composition
        id="Scene6-BetterPlans"
        component={Scene6_BetterPlans}
        durationInFrames={90}
        fps={fps}
        width={width}
        height={height}
      />
      <Composition
        id="Scene7-Closing"
        component={Scene7_Closing}
        durationInFrames={100}
        fps={fps}
        width={width}
        height={height}
      />
    </>
  );
};

registerRoot(RemotionRoot);
