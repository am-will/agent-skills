import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

type Skill = {
  name: string;
  description: string;
  icon: string;
  color: string;
};

const SKILLS: Skill[] = [
  {
    name: "agent-browser",
    description: "Headless browser automation",
    icon: "🌐",
    color: "#58a6ff",
  },
  {
    name: "codex-subagent",
    description: "Spawn autonomous subagents",
    icon: "🤖",
    color: "#f778ba",
  },
  {
    name: "context7",
    description: "Fetch library documentation",
    icon: "📚",
    color: "#7ee787",
  },
  {
    name: "frontend-design",
    description: "Production-grade UI design",
    icon: "🎨",
    color: "#d2a8ff",
  },
  {
    name: "frontend-responsive-ui",
    description: "Mobile-first responsive layouts",
    icon: "📱",
    color: "#79c0ff",
  },
  {
    name: "gemini-computer-use",
    description: "Gemini browser control",
    icon: "💎",
    color: "#ffa657",
  },
  {
    name: "llm-council",
    description: "Multi-agent planning council",
    icon: "🏛️",
    color: "#ff7b72",
  },
  {
    name: "openai-docs-skill",
    description: "OpenAI documentation access",
    icon: "📖",
    color: "#7ee787",
  },
  {
    name: "parallel-task",
    description: "Execute parallel subagents",
    icon: "⚡",
    color: "#ffd700",
  },
  {
    name: "planner",
    description: "Implementation planning",
    icon: "📋",
    color: "#a5d6ff",
  },
  {
    name: "read-github",
    description: "GitHub repo documentation",
    icon: "🐙",
    color: "#8b949e",
  },
  {
    name: "vercel-react-best-practices",
    description: "React performance optimization",
    icon: "⚛️",
    color: "#61dafb",
  },
];

type SkillCardProps = {
  skill: Skill;
  isActive: boolean;
  progress: number;
};

const SkillCard: React.FC<SkillCardProps> = ({ skill, isActive, progress }) => {
  const scale = isActive ? 1 : 0.9;
  const opacity = isActive ? 1 : 0.3;

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        opacity,
        background: `linear-gradient(135deg, ${skill.color}22 0%, #161b2233 100%)`,
        border: `2px solid ${isActive ? skill.color : "#30363d"}`,
        borderRadius: 16,
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        minWidth: 340,
        boxShadow: isActive
          ? `0 0 30px ${skill.color}44, 0 10px 40px rgba(0,0,0,0.4)`
          : "0 4px 12px rgba(0,0,0,0.3)",
      }}
    >
      <div
        style={{
          fontSize: 36,
          width: 50,
          height: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {skill.icon}
      </div>
      <div>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 18,
            fontWeight: 600,
            color: skill.color,
            marginBottom: 4,
          }}
        >
          {skill.name}
        </div>
        <div
          style={{
            fontSize: 14,
            color: "#8b949e",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {skill.description}
        </div>
      </div>
    </div>
  );
};

type SkillShowcaseProps = {
  startFrame?: number;
  framesPerSkill?: number;
};

export const SkillShowcase: React.FC<SkillShowcaseProps> = ({
  startFrame = 0,
  framesPerSkill = 12,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = Math.max(0, frame - startFrame);
  const currentSkillIndex = Math.floor(localFrame / framesPerSkill) % SKILLS.length;
  const progress = (localFrame % framesPerSkill) / framesPerSkill;

  // Entrance animation
  const entranceProgress = spring({
    frame: localFrame,
    fps,
    config: { damping: 200 },
  });

  const translateY = interpolate(entranceProgress, [0, 1], [100, 0]);
  const opacity = interpolate(localFrame, [0, 0.3 * fps], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        transform: `translateY(${translateY}px)`,
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
      }}
    >
      {/* Current skill highlight */}
      <SkillCard
        skill={SKILLS[currentSkillIndex]}
        isActive={true}
        progress={progress}
      />

      {/* Skills counter */}
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 14,
          color: "#58a6ff",
          marginTop: 8,
        }}
      >
        {currentSkillIndex + 1} / {SKILLS.length} skills
      </div>
    </div>
  );
};

type SkillGridProps = {
  startFrame?: number;
  staggerDelay?: number;
};

export const SkillGrid: React.FC<SkillGridProps> = ({
  startFrame = 0,
  staggerDelay = 3,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = Math.max(0, frame - startFrame);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 16,
        padding: 20,
      }}
    >
      {SKILLS.map((skill, index) => {
        const skillStartFrame = index * staggerDelay;
        const skillLocalFrame = Math.max(0, localFrame - skillStartFrame);

        const entranceProgress = spring({
          frame: skillLocalFrame,
          fps,
          config: { damping: 200 },
        });

        const scale = interpolate(entranceProgress, [0, 1], [0, 1]);
        const opacity = interpolate(entranceProgress, [0, 1], [0, 1]);

        return (
          <div
            key={skill.name}
            style={{
              transform: `scale(${scale})`,
              opacity,
              background: `linear-gradient(135deg, ${skill.color}15 0%, #0d111755 100%)`,
              border: `1px solid ${skill.color}44`,
              borderRadius: 12,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div style={{ fontSize: 24 }}>{skill.icon}</div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                color: skill.color,
                fontWeight: 500,
              }}
            >
              {skill.name}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export { SKILLS };
