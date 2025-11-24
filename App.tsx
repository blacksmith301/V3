import React from 'react';
import { HapticVideoPlayer } from './components/HapticVideoPlayer';
import { Activity } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center py-8 px-4">
      <header className="mb-8 text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 mb-4">
          <Activity className="text-white w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Sonic Expert</h1>
        <p className="text-zinc-400 max-w-xs mx-auto text-sm">
          Haptic feedback synchronization for CloseUp Sonic Expert Toothbrush demo.
        </p>
      </header>

      <main className="w-full flex-1 flex flex-col items-center justify-start">
        <HapticVideoPlayer />
      </main>

      <footer className="mt-12 text-center text-zinc-600 text-xs">
        <p>Optimized for Android Chrome & Mobile Browsers</p>
      </footer>
    </div>
  );
}