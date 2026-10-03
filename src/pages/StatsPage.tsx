import React from 'react';
import { ProductivityStats } from '../types';
import { Flame, Award, CheckCircle2, TrendingUp, Zap } from 'lucide-react';

interface StatsPageProps {
  stats: ProductivityStats;
}

export const StatsPage: React.FC<StatsPageProps> = ({ stats }) => {
  const xpForNextLevel = stats.level * 100;
  const xpPercent = Math.min(100, Math.round((stats.xp / xpForNextLevel) * 100));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-100">Productivity & XP Stats</h2>
        <p className="text-xs text-gray-400 mt-0.5">Track your achievements, streak, and pet level growth</p>
      </div>

      {/* Level & XP Banner */}
      <div className="bg-gradient-to-r from-cyan-950/60 via-purple-950/40 to-slate-900 border border-cyan-500/40 rounded-3xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold text-lg shadow-lg">
              Lvl {stats.level}
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-100">PawPilot Companion Level</h3>
              <p className="text-xs text-cyan-400">{stats.xp} / {xpForNextLevel} XP to Level {stats.level + 1}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
            <Flame className="w-4 h-4 fill-amber-500/20" />
            <span>{stats.streakDays} Day Streak!</span>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="w-full h-3 bg-background/80 rounded-full overflow-hidden border border-border/60">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500 rounded-full"
            style={{ width: `${xpPercent}%` }}
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card/80 border border-border/80 rounded-2xl p-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1">
            <CheckCircle2 className="w-4 h-4" /> Completed Today
          </div>
          <div className="text-2xl font-bold text-gray-100">{stats.completedToday}</div>
        </div>

        <div className="bg-card/80 border border-border/80 rounded-2xl p-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 mb-1">
            <TrendingUp className="w-4 h-4" /> Completed This Week
          </div>
          <div className="text-2xl font-bold text-gray-100">{stats.completedThisWeek}</div>
        </div>

        <div className="bg-card/80 border border-border/80 rounded-2xl p-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
            <Award className="w-4 h-4" /> Completion Rate
          </div>
          <div className="text-2xl font-bold text-gray-100">{stats.completionRate}%</div>
        </div>

        <div className="bg-card/80 border border-border/80 rounded-2xl p-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
            <Zap className="w-4 h-4" /> Overdue Tasks
          </div>
          <div className="text-2xl font-bold text-gray-100">{stats.overdueCount}</div>
        </div>
      </div>
    </div>
  );
};
