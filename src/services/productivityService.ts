import { Task, ProductivityStats } from '../types';
import { isToday, parseISO, isSameWeek } from 'date-fns';

export function calculateProductivityStats(tasks: Task[], xp: number, level: number, streakDays: number): ProductivityStats {
  const now = new Date();
  
  const completedToday = tasks.filter(t => t.status === 'COMPLETED' && t.completedAt && isToday(parseISO(t.completedAt))).length;
  const completedThisWeek = tasks.filter(t => t.status === 'COMPLETED' && t.completedAt && isSameWeek(parseISO(t.completedAt), now)).length;
  
  const overdueCount = tasks.filter(t => {
    if (t.status === 'COMPLETED' || !t.deadline) return false;
    return new Date(t.deadline) < now;
  }).length;

  const upcomingCount = tasks.filter(t => {
    if (t.status === 'COMPLETED' || !t.deadline) return false;
    return new Date(t.deadline) >= now;
  }).length;

  const totalActionable = tasks.filter(t => t.status !== 'ARCHIVED').length;
  const totalCompleted = tasks.filter(t => t.status === 'COMPLETED').length;
  const completionRate = totalActionable > 0 ? Math.round((totalCompleted / totalActionable) * 100) : 0;

  return {
    completedToday,
    completedThisWeek,
    overdueCount,
    upcomingCount,
    streakDays,
    completionRate,
    xp,
    level
  };
}

export function getXpForTask(priority: string): number {
  switch (priority) {
    case 'URGENT':
      return 35;
    case 'HIGH':
      return 25;
    case 'MEDIUM':
      return 15;
    case 'LOW':
    default:
      return 10;
  }
}
