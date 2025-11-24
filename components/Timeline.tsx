import React from 'react';
import { HAPTIC_CUES } from '../constants';
import { Zap } from 'lucide-react';

interface TimelineProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

export const Timeline: React.FC<TimelineProps> = ({ currentTime, duration, onSeek }) => {
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    onSeek(newTime);
  };

  return (
    <div className="w-full space-y-2 select-none">
      <div className="flex justify-between text-xs text-zinc-400 font-mono">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
      
      <div 
        className="relative h-12 bg-zinc-900/50 rounded-lg border border-zinc-800 cursor-pointer overflow-hidden group"
        onClick={handleTrackClick}
      >
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(to right, #333 1px, transparent 1px)', backgroundSize: '10% 100%' }}></div>

        {/* Haptic Zones */}
        {HAPTIC_CUES.map((cue) => {
          const startPct = (cue.startTime / Math.max(duration, 30)) * 100; 
          const widthPct = ((cue.endTime - cue.startTime) / Math.max(duration, 30)) * 100;
          
          if (duration === 0) return null;
          const isActive = currentTime >= cue.startTime && currentTime < cue.endTime;

          return (
            <div
              key={cue.id}
              className={`absolute top-2 bottom-2 rounded-md flex items-center justify-center transition-colors duration-200 ${
                isActive ? 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.6)]' : 'bg-cyan-900/40 border border-cyan-800/50'
              }`}
              style={{
                left: `${startPct}%`,
                width: `${widthPct}%`,
              }}
              title={`${cue.label} (${cue.startTime}s - ${cue.endTime}s)`}
            >
              <Zap size={10} className={`text-cyan-100 ${isActive ? 'animate-pulse' : 'opacity-50'}`} />
            </div>
          );
        })}

        {/* Playhead */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-75 ease-linear z-10"
          style={{ left: `${progressPercent}%` }}
        />
      </div>
      
      <div className="flex justify-between text-[10px] text-zinc-500 uppercase tracking-wider">
        {HAPTIC_CUES.map(cue => (
           <div key={cue.id} className={currentTime >= cue.startTime && currentTime < cue.endTime ? 'text-cyan-400 font-bold' : ''}>
              {cue.startTime}s
           </div>
        ))}
      </div>
    </div>
  );
};