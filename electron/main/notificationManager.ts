import { Notification } from 'electron';
import { settingsRepo } from '../database/repository.js';

export class NotificationManager {
  private lastNotificationTime: number = 0;
  private minIntervalMs: number = 5000;

  public showNotification(title: string, body: string, icon?: string): boolean {
    const settings = settingsRepo.get();

    if (settings.quietHoursEnabled && this.isQuietHours(settings.quietHoursStart, settings.quietHoursEnd)) {
      console.log(`🌙 Notification suppressed due to quiet hours: ${title}`);
      return false;
    }

    const now = Date.now();
    if (now - this.lastNotificationTime < this.minIntervalMs) {
      console.log(`⏱️ Notification throttled: ${title}`);
      return false;
    }

    if (Notification.isSupported()) {
      const notif = new Notification({
        title: `🐾 PawPilot - ${title}`,
        body,
        silent: !settings.soundEnabled
      });
      notif.show();
      this.lastNotificationTime = now;
      return true;
    }
    return false;
  }

  private isQuietHours(startStr: string, endStr: string): boolean {
    try {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const [sH, sM] = startStr.split(':').map(Number);
      const startMinutes = sH * 60 + sM;

      const [eH, eM] = endStr.split(':').map(Number);
      const endMinutes = eH * 60 + eM;

      if (startMinutes <= endMinutes) {
        return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
      } else {
        return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
      }
    } catch {
      return false;
    }
  }
}

export const notificationManager = new NotificationManager();
