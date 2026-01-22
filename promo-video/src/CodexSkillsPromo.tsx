import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  interpolate,
  spring,
  AbsoluteFill,
} from "remotion";
import {
  Terminal,
  TypewriterText,
  TerminalLine,
  TerminalOutput,
} from "./components/Terminal";
import { SkillShowcase, SkillGrid, SKILLS } from "./components/SkillShowcase";

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Subtle gradient animation
  const hue1 = interpolate(frame, [0, durationInFrames], [220, 260]);
  const hue2 = interpolate(frame, [0, durationInFrames], [280, 320]);

  return (
    <AbsoluteFill
      style={{
        background: `
          radial-gradient(ellipse at 20% 20%, hsla(${hue1}, 70%, 15%, 0.4) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 80%, hsla(${hue2}, 70%, 12%, 0.4) 0%, transparent 50%),
          linear-gradient(180deg, #0d1117 0%, #161b22 50%, #0d1117 100%)
        `,
      }}
    />
  );
};

const GridPattern: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `
          linear-gradient(rgba(88, 166, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(88, 166, 255, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
      }}
    />
  );
};

const Title: React.FC<{ startFrame?: number }> = ({ startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = Math.max(0, frame - startFrame);

  const entranceProgress = spring({
    frame: localFrame,
    fps,
    config: { damping: 200 },
  });

  const translateY = interpolate(entranceProgress, [0, 1], [-50, 0]);
  const opacity = interpolate(entranceProgress, [0, 1], [0, 1]);

  return (
    <div
      style={{
        transform: `translateY(${translateY}px)`,
        opacity,
        textAlign: "center",
        marginBottom: 40,
      }}
    >
      <h1
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 72,
          fontWeight: 700,
          background: "linear-gradient(135deg, #58a6ff 0%, #d2a8ff 50%, #7ee787 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          margin: 0,
          letterSpacing: -2,
        }}
      >
        Codex-Skills
      </h1>
      <p
        style={{
          fontFamily: "system-ui, sans-serif",
          fontSize: 24,
          color: "#8b949e",
          marginTop: 16,
        }}
      >
        Extend AI agent capabilities with modular skills
      </p>
    </div>
  );
};

const InstallScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 60,
      }}
    >
      <Title />

      <Terminal title="bash -- Installing Codex-Skills">
        <TerminalLine prompt="$">
          <TypewriterText
            text="npx @am-will/codexskills --user am-will/codex-skills"
            startFrame={30}
            charsPerSecond={25}
            color="#e6edf3"
          />
        </TerminalLine>

        <Sequence from={90} layout="none">
          <TerminalOutput delay={0} color="#8b949e">
            <div style={{ marginTop: 12 }}>
              <span style={{ color: "#7ee787" }}>✓</span> Fetching skills from
              GitHub...
            </div>
          </TerminalOutput>
        </Sequence>

        <Sequence from={110} layout="none">
          <TerminalOutput delay={0} color="#8b949e">
            <span style={{ color: "#7ee787" }}>✓</span> Installing 12 skills to
            ~/.codex/skills/
          </TerminalOutput>
        </Sequence>

        <Sequence from={130} layout="none">
          <TerminalOutput delay={0} color="#7ee787">
            <div style={{ marginTop: 8 }}>
              🎉 Successfully installed Codex-Skills!
            </div>
          </TerminalOutput>
        </Sequence>
      </Terminal>
    </AbsoluteFill>
  );
};

const SkillsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          textAlign: "center",
          marginBottom: 40,
        }}
      >
        <h2
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 42,
            fontWeight: 600,
            color: "#e6edf3",
            margin: 0,
          }}
        >
          12 Powerful Skills
        </h2>
        <p
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: 18,
            color: "#8b949e",
            marginTop: 12,
          }}
        >
          Ready to supercharge your AI workflows
        </p>
      </div>

      <SkillShowcase startFrame={20} framesPerSkill={10} />
    </AbsoluteFill>
  );
};

const GridScene: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          textAlign: "center",
          marginBottom: 20,
        }}
      >
        <h2
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 36,
            fontWeight: 600,
            color: "#e6edf3",
            margin: 0,
          }}
        >
          The Complete Collection
        </h2>
      </div>

      <SkillGrid startFrame={10} staggerDelay={4} />
    </AbsoluteFill>
  );
};

const CallToAction: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entranceProgress = spring({
    frame,
    fps,
    config: { damping: 200 },
  });

  const scale = interpolate(entranceProgress, [0, 1], [0.8, 1]);
  const opacity = interpolate(entranceProgress, [0, 1], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      <h1
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 56,
          fontWeight: 700,
          background: "linear-gradient(135deg, #58a6ff 0%, #d2a8ff 50%, #7ee787 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          margin: 0,
          textAlign: "center",
        }}
      >
        Get Started Today
      </h1>

      <div
        style={{
          marginTop: 40,
          background: "#21262d",
          border: "1px solid #30363d",
          borderRadius: 12,
          padding: "20px 32px",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 20,
          color: "#7ee787",
        }}
      >
        npx @am-will/codexskills
      </div>

      <p
        style={{
          fontFamily: "system-ui, sans-serif",
          fontSize: 18,
          color: "#8b949e",
          marginTop: 32,
        }}
      >
        github.com/am-will/codex-skills
      </p>
    </AbsoluteFill>
  );
};

export const CodexSkillsPromo: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Background />
      <GridPattern />

      {/* Scene 1: Install command (0-5 seconds) */}
      <Sequence from={0} durationInFrames={5 * fps}>
        <InstallScene />
      </Sequence>

      {/* Scene 2: Skills flashing through (5-10 seconds) */}
      <Sequence from={5 * fps} durationInFrames={5 * fps}>
        <SkillsScene />
      </Sequence>

      {/* Scene 3: Grid view of all skills (10-13 seconds) */}
      <Sequence from={10 * fps} durationInFrames={3 * fps}>
        <GridScene />
      </Sequence>

      {/* Scene 4: Call to action (13-15 seconds) */}
      <Sequence from={13 * fps} durationInFrames={2 * fps}>
        <CallToAction />
      </Sequence>
    </AbsoluteFill>
  );
};
