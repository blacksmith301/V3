import { HapticCue } from './types';

export const HAPTIC_CUES: HapticCue[] = [
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
    id: 'cue-3',
    startTime: 28,
    endTime: 30,
    label: 'Deep Scrub',
    description: 'Sustained sonic frequency'
  }
];