import { HapticCue } from './types';

export const HAPTIC_CUES: HapticCue[] = [
  {
    id: 'cue-burst-1',
    startTime: 6.8,
    endTime: 7.2, // Widened window to prevent cutoff
    label: 'Intro Burst',
    description: 'Initial sync pulse',
    vibrationPattern: [200] // Explicit strong pulse
  },
  {
    id: 'cue-1',
    startTime: 10,
    endTime: 12,
    label: 'Intense Clean',
    description: 'Sonic vibration activation'
  },
  {
    id: 'cue-2',
    startTime: 16,
    endTime: 17,
    label: 'Pulse Mode',
    description: 'Short rapid burst'
  },
  {
    id: 'cue-new-1',
    startTime: 21,
    endTime: 22.2,
    label: 'Rhythmic Pulse',
    description: 'Triple pulse sequence',
    // 1.2s total: 200ms on, 200ms off, 200ms on, 200ms off, 200ms on, 200ms off
    vibrationPattern: [200, 200, 200, 200, 200, 200]
  },
  {
    id: 'cue-3',
    startTime: 28,
    endTime: 30,
    label: 'Deep Scrub',
    description: 'Sustained sonic frequency'
  },
  {
    id: 'cue-burst-2',
    startTime: 38.0,
    endTime: 38.4, // Widened window to prevent cutoff
    label: 'Outro Burst',
    description: 'Final sync pulse',
    vibrationPattern: [200] // Explicit strong pulse
  }
];