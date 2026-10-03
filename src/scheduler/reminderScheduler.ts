import { Task, SpeechMessage } from '../types';
import { differenceInHours, differenceInDays, parseISO } from 'date-fns';

export class ReminderScheduler {
  private triggeredReminders: Set<string> = new Set();
  private onTriggerSpeech: ((msg: SpeechMessage) => void) | null = null;

  public setSpeechCallback(cb: (msg: SpeechMessage) => void) {
    this.onTriggerSpeech = cb;
  }

  public checkTasks(tasks: Task[]) {
    const now = new Date();

    tasks.forEach(task => {
      if (task.status === 'COMPLETED' || task.status === 'ARCHIVED' || !task.deadline) return;

      const deadline = parseISO(task.deadline);
      const hoursLeft = differenceInHours(deadline, now);
      const daysLeft = differenceInDays(deadline, now);

      // Missed deadline
      if (hoursLeft < 0 && !this.triggeredReminders.has(`${task.id}_MISSED`)) {
        this.triggerReminder(
          task.id,
          'MISSED',
          `Looks like you missed "${task.title}". Want to reschedule it?`,
          'warning',
          [{ label: 'Reschedule', action: `reschedule_${task.id}` }]
        );
        return;
      }

      // 3 hours left
      if (hoursLeft > 0 && hoursLeft <= 3 && !this.triggeredReminders.has(`${task.id}_3H`)) {
        this.triggerReminder(
          task.id,
          '3H',
          `⚠️ Only ${hoursLeft} hour${hoursLeft > 1 ? 's' : ''} left for "${task.title}"!`,
          'warning',
          [{ label: 'Complete Task', action: `complete_${task.id}` }]
        );
        return;
      }

      // 24 hours left
      if (hoursLeft > 3 && hoursLeft <= 24 && !this.triggeredReminders.has(`${task.id}_24H`)) {
        this.triggerReminder(
          task.id,
          '24H',
          `👀 Your "${task.title}" is due tomorrow!`,
          'reminder',
          [{ label: 'View Task', action: `view_${task.id}` }]
        );
        return;
      }

      // 3 days left
      if (daysLeft > 1 && daysLeft <= 3 && !this.triggeredReminders.has(`${task.id}_3D`)) {
        this.triggerReminder(
          task.id,
          '3D',
          `🐾 "${task.title}" is due in ${daysLeft} days.`,
          'reminder'
        );
        return;
      }

      // 7 days left
      if (daysLeft > 3 && daysLeft <= 7 && !this.triggeredReminders.has(`${task.id}_7D`)) {
        this.triggerReminder(
          task.id,
          '7D',
          `📌 "${task.title}" is due next week.`,
          'reminder'
        );
        return;
      }
    });
  }

  private triggerReminder(
    taskId: string,
    type: string,
    text: string,
    speechType: 'greeting' | 'reminder' | 'warning' | 'celebration',
    actions?: Array<{ label: string; action: string }>
  ) {
    const key = `${taskId}_${type}`;
    this.triggeredReminders.add(key);

    // Trigger Windows Native Notification
    if (typeof window !== 'undefined' && (window as any).pawpilot?.notifications) {
      (window as any).pawpilot.notifications.notify('Deadline Reminder', text);
    }

    // Trigger Pet Speech Bubble
    if (this.onTriggerSpeech) {
      this.onTriggerSpeech({
        id: 'rem_' + Date.now(),
        text,
        type: speechType,
        durationMs: 8000,
        actions
      });
    }
  }
}

export const reminderScheduler = new ReminderScheduler();
