import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Play, Pause, Smartphone, RefreshCw, Volume2, VolumeX, Zap, Loader2, Maximize, Minimize } from 'lucide-react';
import { HAPTIC_CUES } from '../constants';
import { Timeline } from './Timeline';

const VIDEO_URL = "https://closeup-sonicexpert.com/cdn/shop/videos/c/vp/0499295a775148d0a7d38998241f1758/0499295a775148d0a7d38998241f1758.HD-720p-2.1Mbps-27295103.mp4?v=0";

export const HapticVideoPlayer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  
  // Use a ref to track active cue synchronously to avoid closure/batching issues with RAF
  const activeCueRef = useRef<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [activeCue, setActiveCue] = useState<string | null>(null);
  const [isDeviceSupported, setIsDeviceSupported] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && !navigator.vibrate) {
      setIsDeviceSupported(false);
    }
  }, []);

  // Handle Fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Auto-hide controls logic
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 1000);
    }
  }, [isPlaying]);

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying, resetControlsTimeout]);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      try {
        await containerRef.current.requestFullscreen();
      } catch (err) {
        console.error("Error attempting to enable fullscreen:", err);
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    }
  };

  const syncLoopRef = useRef<number>();

  const handleSync = useCallback(() => {
    if (!videoRef.current) return;

    const t = videoRef.current.currentTime;
    setCurrentTime(t);

    const currentCue = HAPTIC_CUES.find(cue => t >= cue.startTime && t < cue.endTime);

    if (currentCue) {
      // Check against ref for immediate update within the loop
      if (activeCueRef.current !== currentCue.id) {
        activeCueRef.current = currentCue.id;
        setActiveCue(currentCue.id);
        
        if (navigator.vibrate) {
          if (currentCue.vibrationPattern) {
            // Use custom pattern if defined (Fire and forget for patterns)
            navigator.vibrate(currentCue.vibrationPattern);
          } else {
            // Default to continuous vibration for the remainder of the cue
            const remainingDuration = (currentCue.endTime - t) * 1000;
            navigator.vibrate(Math.max(0, remainingDuration));
          }
        }
      }
    } else {
      if (activeCueRef.current) {
        activeCueRef.current = null;
        setActiveCue(null);
        if (navigator.vibrate) navigator.vibrate(0);
      }
    }

    if (isPlaying && t < duration) {
      syncLoopRef.current = requestAnimationFrame(handleSync);
    }
  }, [isPlaying, duration]);

  useEffect(() => {
    if (isPlaying) {
      syncLoopRef.current = requestAnimationFrame(handleSync);
    } else {
      if (syncLoopRef.current) cancelAnimationFrame(syncLoopRef.current);
      if (navigator.vibrate) navigator.vibrate(0);
      setActiveCue(null);
      activeCueRef.current = null;
    }
    return () => {
      if (syncLoopRef.current) cancelAnimationFrame(syncLoopRef.current);
    };
  }, [isPlaying, handleSync]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
    if (navigator.vibrate) navigator.vibrate(0);
    setActiveCue(null);
    activeCueRef.current = null;
    resetControlsTimeout();
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const resetPlayer = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      if (!isPlaying) setCurrentTime(0);
    }
    setActiveCue(null);
    activeCueRef.current = null;
  };

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    setDuration(e.currentTarget.duration);
    setIsLoading(false);
  };

  const currentActiveCueData = HAPTIC_CUES.find(c => c.id === activeCue);

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
      <div 
        ref={containerRef}
        className={`relative ${isFullscreen ? 'w-full h-full fixed inset-0 z-50 bg-black' : 'aspect-video rounded-2xl shadow-2xl border border-zinc-800'} bg-zinc-900 overflow-hidden transition-all duration-300 group ${activeCue && !isFullscreen ? 'shadow-cyan-500/20 ring-1 ring-cyan-500/30' : ''}`}
        onMouseMove={resetControlsTimeout}
        onTouchStart={resetControlsTimeout}
        onClick={resetControlsTimeout}
      >
        {activeCue && (
          <div className="absolute inset-0 pointer-events-none z-20 animate-vibrate-overlay opacity-30 bg-cyan-500 mix-blend-overlay"></div>
        )}
        
        <video
          ref={videoRef}
          src={VIDEO_URL}
          className={`w-full h-full ${isFullscreen ? 'object-contain' : 'object-cover'}`}
          playsInline
          crossOrigin="anonymous"
          onEnded={() => {
            setIsPlaying(false);
            setShowControls(true);
          }}
          onLoadedMetadata={handleLoadedMetadata}
          onWaiting={() => setIsLoading(true)}
          onCanPlay={() => setIsLoading(false)}
        />

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/50 z-10">
            <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
          </div>
        )}

        <div className={`absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent z-30 transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="flex items-center justify-between mb-4">
                <button 
                    onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                    className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 transition active:scale-95 shadow-lg shadow-white/20"
                >
                    {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                </button>

                <div className="flex gap-3">
                    <button onClick={(e) => { e.stopPropagation(); toggleMute(); }} className="p-3 bg-zinc-800/80 backdrop-blur-sm rounded-full text-white hover:bg-zinc-700 transition">
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); resetPlayer(); }} className="p-3 bg-zinc-800/80 backdrop-blur-sm rounded-full text-white hover:bg-zinc-700 transition">
                        <RefreshCw size={20} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }} className="p-3 bg-zinc-800/80 backdrop-blur-sm rounded-full text-white hover:bg-zinc-700 transition">
                        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                    </button>
                </div>
            </div>
            <div onClick={(e) => e.stopPropagation()}>
               <Timeline currentTime={currentTime} duration={duration} onSeek={handleSeek} />
            </div>
        </div>
        
        <div className={`absolute top-4 right-4 z-30 transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
             <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border transition-all duration-300 ${
                 activeCue 
                 ? 'bg-cyan-500/90 border-cyan-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)]' 
                 : 'bg-black/40 border-white/10 text-zinc-400'
             }`}>
                <Smartphone size={14} className={activeCue ? 'animate-pulse' : ''} />
                <span className="text-xs font-bold tracking-wide">
                    {activeCue ? 'VIBRATING' : 'READY'}
                </span>
             </div>
        </div>
      </div>

      <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
        <div className="flex items-start justify-between gap-4">
            <div>
                <h3 className="text-white font-semibold mb-1">Haptic Sync Status</h3>
                <p className="text-zinc-400 text-sm min-h-[20px]">
                    {currentActiveCueData ? (
                        <span className="text-cyan-400 font-medium animate-pulse flex items-center gap-2">
                          <Zap size={14} fill="currentColor" />
                          {currentActiveCueData.label}
                        </span>
                    ) : (
                        "Waiting for haptic cues..."
                    )}
                </p>
            </div>
             {!isDeviceSupported && (
                <div className="shrink-0 px-2 py-1 bg-zinc-800 border border-zinc-700 text-zinc-400 text-[10px] rounded uppercase font-bold">
                    Desktop Mode
                </div>
            )}
        </div>
      </div>

      {!isDeviceSupported && (
          <p className="text-xs text-center text-zinc-600 px-4">
            Note: Physical vibration requires a mobile device (Android recommended).
          </p>
      )}
      
      <style>{`
        @keyframes vibrate-overlay {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }
        .animate-vibrate-overlay {
          animation: vibrate-overlay 0.05s infinite;
        }
      `}</style>
    </div>
  );
};