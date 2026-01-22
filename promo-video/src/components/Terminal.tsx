import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

type TerminalProps = {
  children: React.ReactNode;
  title?: string;
};

export const Terminal: React.FC<TerminalProps> = ({
  children,
  title = "Terminal",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animate terminal appearing
  const scaleProgress = spring({
    frame,
    fps,
    config: { damping: 200 },
  });

  const scale = interpolate(scaleProgress, [0, 1], [0.8, 1]);
  const opacity = interpolate(frame, [0, 0.3 * fps], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        opacity,
        width: 900,
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 25px 80px rgba(0, 0, 0, 0.6), 0 10px 30px rgba(0, 0, 0, 0.4)",
        fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', Menlo, monospace",
      }}
    >
      {/* Title bar */}
      <div
        style={{
          height: 40,
          background: "linear-gradient(180deg, #3d3d3d 0%, #2a2a2a 100%)",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          borderBottom: "1px solid #1a1a1a",
        }}
      >
        {/* Traffic lights */}
        <div style={{ display: "flex", gap: 8 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: "#ff5f57",
              boxShadow: "inset 0 -1px 1px rgba(0,0,0,0.2)",
            }}
          />
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: "#febc2e",
              boxShadow: "inset 0 -1px 1px rgba(0,0,0,0.2)",
            }}
          />
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: "#28c840",
              boxShadow: "inset 0 -1px 1px rgba(0,0,0,0.2)",
            }}
          />
        </div>

        {/* Title */}
        <div
          style={{
            flex: 1,
            textAlign: "center",
            color: "#9a9a9a",
            fontSize: 14,
            fontWeight: 500,
            marginRight: 50,
          }}
        >
          {title}
        </div>
      </div>

      {/* Terminal body */}
      <div
        style={{
          background: "#0d1117",
          padding: "24px 28px",
          minHeight: 300,
          color: "#e6edf3",
          fontSize: 18,
          lineHeight: 1.6,
        }}
      >
        {children}
      </div>
    </div>
  );
};

type TypewriterTextProps = {
  text: string;
  startFrame?: number;
  charsPerSecond?: number;
  color?: string;
  prefix?: string;
  prefixColor?: string;
};

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  startFrame = 0,
  charsPerSecond = 30,
  color = "#e6edf3",
  prefix = "",
  prefixColor = "#7ee787",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const framesPerChar = fps / charsPerSecond;
  const localFrame = Math.max(0, frame - startFrame);
  const charsToShow = Math.floor(localFrame / framesPerChar);
  const visibleText = text.slice(0, charsToShow);

  // Blinking cursor
  const showCursor = charsToShow < text.length && Math.floor(frame / (fps / 2)) % 2 === 0;

  return (
    <div style={{ display: "flex" }}>
      {prefix && (
        <span style={{ color: prefixColor, marginRight: 8 }}>{prefix}</span>
      )}
      <span style={{ color }}>
        {visibleText}
        {showCursor && (
          <span
            style={{
              background: "#58a6ff",
              width: 10,
              height: 22,
              display: "inline-block",
              marginLeft: 2,
              verticalAlign: "text-bottom",
            }}
          />
        )}
      </span>
    </div>
  );
};

type TerminalLineProps = {
  prompt?: string;
  promptColor?: string;
  children: React.ReactNode;
};

export const TerminalLine: React.FC<TerminalLineProps> = ({
  prompt = "$",
  promptColor = "#7ee787",
  children,
}) => {
  return (
    <div style={{ display: "flex", marginBottom: 8 }}>
      <span style={{ color: promptColor, marginRight: 12 }}>{prompt}</span>
      <span>{children}</span>
    </div>
  );
};

type TerminalOutputProps = {
  children: React.ReactNode;
  delay?: number;
  color?: string;
};

export const TerminalOutput: React.FC<TerminalOutputProps> = ({
  children,
  delay = 0,
  color = "#8b949e",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(
    frame,
    [delay * fps, delay * fps + 0.2 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div style={{ color, opacity, marginLeft: 0, marginBottom: 6 }}>
      {children}
    </div>
  );
};
