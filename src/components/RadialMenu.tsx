import React from 'react';
import { CheckSquare, MessageSquare, Timer, Calendar, BarChart3, Settings, Monitor, X } from 'lucide-react';

interface RadialMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: string) => void;
}

export const RadialMenu: React.FC<RadialMenuProps> = ({
  isOpen,
  onClose,
  onSelectAction
}) => {
  if (!isOpen) return null;

  const actions = [
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, color: 'hover:text-cyan-400 hover:border-cyan-400' },
    { id: 'chat', label: 'AI Chat', icon: MessageSquare, color: 'hover:text-purple-400 hover:border-purple-400' },
    { id: 'focus', label: 'Focus', icon: Timer, color: 'hover:text-emerald-400 hover:border-emerald-400' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, color: 'hover:text-blue-400 hover:border-blue-400' },
    { id: 'stats', label: 'Stats', icon: BarChart3, color: 'hover:text-amber-400 hover:border-amber-400' },
    { id: 'dashboard', label: 'Dashboard', icon: Monitor, color: 'hover:text-fuchsia-400 hover:border-fuchsia-400' },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'hover:text-gray-300 hover:border-gray-300' }
  ];

  return (
    <div
      style={{ WebkitAppRegion: 'no-drag' } as any}
      className="absolute inset-0 z-50 flex items-center justify-center pointer-events-auto"
    >
      <div className="relative pointer-events-auto animate-in zoom-in-95 duration-200 bg-card/95 border border-border/80 rounded-2xl p-3 shadow-2xl backdrop-blur-xl w-64 flex flex-col gap-2">
        <div className="flex items-center justify-between border-b border-border/50 pb-2 px-1">
          <span className="text-xs font-semibold text-gray-300">PawPilot Controls</span>
          <button
            style={{ WebkitAppRegion: 'no-drag' } as any}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-gray-400 hover:text-white pointer-events-auto p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                style={{ WebkitAppRegion: 'no-drag' } as any}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectAction(act.id);
                  onClose();
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-xl bg-background/60 border border-border/60 text-gray-300 transition-all ${act.color} hover:bg-background/90 group pointer-events-auto cursor-pointer`}
              >
                <Icon className="w-4 h-4 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-medium">{act.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
