/**
 * Sound Effects Timing Configuration
 *
 * Centralized timing for all SFX in the promo video.
 * Frame numbers are at 30fps.
 *
 * To adjust timing: modify the frame numbers below and all scenes
 * will automatically use the updated values.
 */

export const SFX_TIMING = {
  // Scene 1: YOUR PLAN SUCKS (frames 0-60)
  scene1: {
    boom: {
      startFrom: 0, // Start of video
      volume: 0.8,
      description: 'Deep impact when text appears',
    },
  },

  // Scene 2: Problem - Brain fragments (frames 60-150)
  scene2: {
    shatter: {
      startFrom: 90, // 30 frames into scene (1 second)
      volume: 0.7,
      description: 'Glass shatter when brain fragments',
    },
  },

  // Scene 3: Brand Reveal (frames 150-250)
  scene3: {
    whoosh: {
      startFrom: 170, // 20 frames into scene
      volume: 0.6,
      description: 'Whoosh on brand zoom reveal',
    },
  },

  // Scene 4: Multi-Agent Planning (frames 250-345)
  scene4: {
    beep: {
      startFrom: 300, // 50 frames into scene
      volume: 0.5,
      description: 'Connection beep when agents link',
    },
  },

  // Scene 5: LLM as Judge (frames 345-440)
  scene5: {
    gavel: {
      startFrom: 365, // 20 frames into scene
      volume: 0.7,
      description: 'Gavel slam sound',
    },
  },

  // Scene 6: Build Better Plans (frames 440-530)
  scene6: {
    chime: {
      startFrom: 475, // 35 frames into scene
      volume: 0.6,
      description: 'Magical chime for transformation',
    },
  },

  // Scene 7: Closing (frames 530-630)
  scene7: {
    confidence: {
      startFrom: 575, // 45 frames into scene
      volume: 0.8,
      description: 'Confident boom for CTA',
    },
  },
} as const;

/**
 * Audio file paths
 */
export const AUDIO_PATHS = {
  bgMusic: '/audio/bg-music.mp3',
  sfx: {
    boom: '/audio/sfx/boom.mp3',
    shatter: '/audio/sfx/shatter.mp3',
    whoosh: '/audio/sfx/whoosh.mp3',
    beep: '/audio/sfx/beep.mp3',
    gavel: '/audio/sfx/gavel.mp3',
    chime: '/audio/sfx/chime.mp3',
    confidence: '/audio/sfx/confidence.mp3',
  },
} as const;

/**
 * Background music configuration
 */
export const BG_MUSIC = {
  volume: 0.4, // Background level, not overpowering
  startFrom: 0,
  description: '120-140 BPM energetic electronic/hip-hop beat',
} as const;

/**
 * Helper function to check if audio file exists
 * Can be used for graceful degradation if audio not yet added
 */
export function audioFileExists(path: string): boolean {
  // In production, you might want to actually check file existence
  // For now, we'll assume files exist once they're in the public directory
  return true;
}

/**
 * Scene frame ranges for reference
 * Total: 600 frames (20 seconds @ 30fps)
 */
export const SCENE_FRAMES = {
  scene1: { start: 0, end: 60, duration: 60 },
  scene2: { start: 60, end: 150, duration: 90 },
  scene3: { start: 150, end: 250, duration: 100 },
  scene4: { start: 250, end: 345, duration: 95 },
  scene5: { start: 345, end: 440, duration: 95 },
  scene6: { start: 440, end: 530, duration: 90 },
  scene7: { start: 530, end: 630, duration: 100 },
} as const;
