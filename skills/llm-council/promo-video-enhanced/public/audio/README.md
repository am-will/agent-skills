# Audio Assets for LLM Council Promo

This directory contains all audio files for the enhanced promo video.

## Required Files

### Background Music
- **File**: `bg-music.mp3`
- **Specs**: 120-140 BPM, energetic electronic/hip-hop beat, 20+ seconds
- **Volume**: Will be set to 0.4 (background level)
- **Usage**: Plays throughout entire video

### Sound Effects (sfx/ directory)

All sound effects should be short (0.5-1.5 seconds), punchy, and high-quality.

1. **boom.mp3** - Deep impact/slam sound
   - Used in Scene 1 when "YOUR PLAN SUCKS" appears
   - Search: "deep boom impact", "cinematic slam"

2. **shatter.mp3** - Glass breaking sound
   - Used in Scene 2 when brain fragments
   - Search: "glass shatter", "glass break"

3. **whoosh.mp3** - Fast whoosh/swoosh sound
   - Used in Scene 3 for brand reveal
   - Search: "fast whoosh", "swoosh transition"

4. **beep.mp3** - Connection/link beep
   - Used in Scene 4 when agents connect
   - Search: "digital beep", "connection sound"

5. **gavel.mp3** - Gavel slam sound
   - Used in Scene 5 for judge scene
   - Search: "gavel slam", "judge gavel"

6. **chime.mp3** - Magical/success chime
   - Used in Scene 6 for transformation
   - Search: "magic chime", "success sound", "twinkle"

7. **confidence.mp3** - Confident boom/impact
   - Used in Scene 7 for CTA
   - Search: "confident boom", "power impact"

## Free Audio Resources

### Background Music (Free/Royalty-Free)
- **Uppbeat.io** - Free with attribution, great for social media
- **Pixabay Music** - CC0, no attribution required
  - Search: "energetic electronic 120bpm"
- **YouTube Audio Library** - Free for YouTube videos
- **Incompetech** - CC-BY, large selection

### Sound Effects (Free)
- **Freesound.org** - Community-sourced, CC0/CC-BY
  - Create free account for downloads
- **Zapsplat.com** - Free with account
  - High quality, well-organized
- **Pixabay Sound Effects** - CC0, no attribution
- **BBC Sound Effects** - Free for personal/educational use

### Premium Options (If Budget Allows)
- **Epidemic Sound** (~$15/month) - Huge library, easy licensing
- **Artlist** (~$199/year) - Professional quality
- **Musicbed** - High-end music for commercial use

## File Format Requirements

- **Format**: MP3 (preferred) or WAV
- **Bit Rate**: 192 kbps minimum, 320 kbps recommended
- **Sample Rate**: 44.1 kHz or 48 kHz
- **Channels**: Stereo or Mono (both work)

## Quick Start

1. Download background music and save as `bg-music.mp3`
2. Download 7 sound effects and save in `sfx/` with names above
3. Test audio sync with `bun run start` in promo-video-enhanced/
4. Adjust volume levels in scene files if needed

## Audio Timing Reference

```
Scene 1 (0-2s, frames 0-60):   boom.mp3 at frame 0
Scene 2 (2-5s, frames 60-150): shatter.mp3 at frame 90
Scene 3 (5-8s, frames 150-250): whoosh.mp3 at frame 170
Scene 4 (8-11s, frames 250-345): beep.mp3 at frame 300
Scene 5 (11-14s, frames 345-440): gavel.mp3 at frame 365
Scene 6 (14-17s, frames 440-530): chime.mp3 at frame 475
Scene 7 (17-20s, frames 530-630): confidence.mp3 at frame 575
```

## Testing

After adding audio files:
```bash
cd promo-video-enhanced
bun run start
# In Remotion Studio:
# - Scrub through timeline
# - Check audio levels (not too loud/quiet)
# - Verify sync with animations
# - Adjust startFrom frames if needed
```

## Placeholder Files

If you want to test the video without audio, you can create silent placeholder files:
```bash
# Create 1-second silent MP3s (requires ffmpeg)
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 1 -acodec libmp3lame -b:a 192k sfx/boom.mp3
# Repeat for other SFX files
```

## License & Attribution

Make sure to:
1. Check license requirements for each audio file
2. Add attribution if required (CC-BY licenses)
3. Keep license info in this directory for reference
4. Include attribution in video description if needed

## Support

If you need help finding specific sounds, search the resources above using the keywords provided for each file.
