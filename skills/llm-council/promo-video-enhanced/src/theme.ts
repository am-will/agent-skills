// LLM Council brand theme - extracted from UI
export const THEME = {
  // Colors
  bg: '#f7f4ea',        // Warm cream background
  bgDark: '#0a0a0a',    // Near black for contrast scenes
  ink: '#141414',       // Primary text
  accent: '#ff6b00',    // Vibrant orange
  accent2: '#00d5ff',   // Cyan
  panel: '#ffffff',     // White panels
  shadow: '#000000',    // Hard shadows
  warmBg: '#fff9e8',    // Warm panel background
  codeBg: '#fef3d6',    // Code block background
  soft: 'rgba(0, 0, 0, 0.1)', // Soft overlay

  // Typography
  displayFont: "'Black Ops One', 'Impact', sans-serif",
  bodyFont: "'Franklin Gothic Medium', 'Trebuchet MS', sans-serif",
  monoFont: "'Courier New', monospace",

  // Spacing
  radius: 12,
  shadowOffset: 8,
} as const;

// Video settings
export const VIDEO_CONFIG = {
  width: 1920,
  height: 1080,
  fps: 30,
  durationInSeconds: 20,
} as const;
