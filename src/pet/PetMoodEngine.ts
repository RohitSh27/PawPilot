import { Task, PetMood } from '../types';
import { getDeadlineProximity } from '../utils/dateUtils';
import { isToday, parseISO } from 'date-fns';

export function calculatePetMood(tasks: Task[], isFocusActive: boolean = false, isUserIdle: boolean = false): PetMood {
  if (isFocusActive) {
    return 'WORKING';
  }

  const now = new Date();
  const currentHour = now.getHours();

  // Sleep late at night or when user idle
  if (currentHour >= 23 || currentHour < 6 || isUserIdle) {
    return 'SLEEPING';
  }

  // Check for urgent/expired deadlines
  const activeTasks = tasks.filter(t => t.status === 'TODO' || t.status === 'IN_PROGRESS');
  const hasUrgent = activeTasks.some(t => {
    const prox = getDeadlineProximity(t.deadline);
    return prox === 'URGENT' || prox === 'EXPIRED';
  });

  if (hasUrgent) {
    return 'WORRIED';
  }

  // Check today's completions
  const completedToday = tasks.filter(t => t.status === 'COMPLETED' && t.completedAt && isToday(parseISO(t.completedAt))).length;

  if (completedToday >= 5) {
    return 'EXCITED';
  } else if (completedToday >= 1) {
    return 'HAPPY';
  }

  return 'IDLE';
}
