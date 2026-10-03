import React, { useEffect, useState } from 'react';
import { SpeechMessage } from '../types';
import { X, Sparkles, AlertTriangle, CheckCircle, Bell } from 'lucide-react';

interface SpeechBubbleProps {
  message: SpeechMessage | null;
  onDismiss: () => void;
  onActionClick?: (action: string) => void;
}

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  message,
  onDismiss,
  onActionClick
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      if (message.durationMs) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(onDismiss, 300);
        }, message.durationMs);
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [message]);

  if (!message || !isVisible) return null;

  const renderIcon = () => {
    switch (message.type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />;
      case 'celebration':
        return <Sparkles className="w-4 h-4 text-fuchsia-400 shrink-0 mt-0.5" />;
      case 'reminder':
        return <Bell className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />;
      default:
        return <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div
      style={{ WebkitAppRegion: 'no-drag' } as any}
      className="relative z-40 max-w-[260px] animate-in fade-in slide-in-from-bottom-3 duration-300 pointer-events-auto"
    >
      {/* Speech bubble box */}
      <div className="bg-card/95 backdrop-blur-xl border border-cyan-500/40 rounded-2xl p-3.5 shadow-2xl shadow-cyan-950/50 text-gray-100 text-xs">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5 font-semibold text-cyan-400">
            {renderIcon()}
            <span>PawPilot</span>
          </div>
          <button
            style={{ WebkitAppRegion: 'no-drag' } as any}
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
              setTimeout(onDismiss, 300);
            }}
            className="text-gray-400 hover:text-white transition-colors pointer-events-auto p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-gray-200 leading-relaxed font-medium">{message.text}</p>

        {/* Action Buttons */}
        {message.actions && message.actions.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {message.actions.map((act, idx) => (
              <button
                key={idx}
                style={{ WebkitAppRegion: 'no-drag' } as any}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onActionClick) onActionClick(act.action);
                  onDismiss();
                }}
                className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-medium text-[11px] transition-all pointer-events-auto cursor-pointer"
              >
                {act.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Pointer Tail */}
      <div className="w-3 h-3 bg-card/95 border-r border-b border-cyan-500/40 transform rotate-45 mx-auto -mt-1.5 z-40" />
    </div>
  );
};
