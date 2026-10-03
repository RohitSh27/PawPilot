import React, { useState, useEffect } from 'react';
import { Play, Pause, CheckCircle2, RotateCcw } from 'lucide-react';
import { soundService } from '../services/soundService';

interface FocusTimerProps {
  durationMinutes?: number;
  onFocusStateChange?: (isActive: boolean) => void;
  onFocusComplete?: () => void;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({
  durationMinutes = 25,
  onFocusStateChange,
  onFocusComplete
}) => {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setTimeLeft(durationMinutes * 60);
  }, [durationMinutes]);

  useEffect(() => {
    let timer: any = null;
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      soundService.playCelebration();
      if (onFocusStateChange) onFocusStateChange(false);
      if (onFocusComplete) onFocusComplete();
    }
    return () => clearInterval(timer);
  }, [isActive, timeLeft]);

  const toggleTimer = () => {
    const next = !isActive;
    setIsActive(next);
    soundService.playClick();
    if (onFocusStateChange) onFocusStateChange(next);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(durationMinutes * 60);
    if (onFocusStateChange) onFocusStateChange(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-card/80 border border-border/80 rounded-2xl p-4 shadow-xl backdrop-blur-md flex flex-col items-center justify-center text-center">
      <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-emerald-400 tracking-wide uppercase">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        Focus Timer
      </div>

      <div className="text-4xl font-bold font-mono text-gray-100 my-2 tracking-wider">
        {formatTime(timeLeft)}
      </div>

      <div className="flex items-center gap-3 mt-3">
        <button
          onClick={toggleTimer}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-xs transition-all ${
            isActive
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
          }`}
        >
          {isActive ? (
            <>
              <Pause className="w-3.5 h-3.5" /> Pause
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" /> Start Focus
            </>
          )}
        </button>

        <button
          onClick={resetTimer}
          className="p-2 rounded-xl bg-background/60 border border-border/60 text-gray-400 hover:text-white hover:bg-background/90 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
