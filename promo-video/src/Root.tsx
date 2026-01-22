import { Composition } from "remotion";
import { CodexSkillsPromo } from "./CodexSkillsPromo";

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="CodexSkillsPromo"
        component={CodexSkillsPromo}
        durationInFrames={15 * 30} // 15 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
