import { dbManager } from './database.js';
import { Task, PetStateData, AppSettings, ChatMessage } from '../types/index.js';

export class TaskRepository {
  public getAll(): Task[] {
    const rows = dbManager.all('SELECT * FROM tasks ORDER BY created_at DESC');
    return rows.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description || '',
      deadline: r.deadline || undefined,
      priority: r.priority,
      category: r.category,
      status: r.status,
      createdAt: r.created_at,
      completedAt: r.completed_at || undefined,
      reminderSettings: r.reminder_settings ? JSON.parse(r.reminder_settings) : { enabled: true, notify24Hours: true, notify3Hours: true }
    }));
  }

  public getById(id: string): Task | null {
    const r = dbManager.get('SELECT * FROM tasks WHERE id = ?', [id]);
    if (!r) return null;
    return {
      id: r.id,
      title: r.title,
      description: r.description || '',
      deadline: r.deadline || undefined,
      priority: r.priority,
      category: r.category,
      status: r.status,
      createdAt: r.created_at,
      completedAt: r.completed_at || undefined,
      reminderSettings: r.reminder_settings ? JSON.parse(r.reminder_settings) : { enabled: true }
    };
  }

  public create(task: Task): Task {
    dbManager.run(
      `INSERT INTO tasks (id, title, description, deadline, priority, category, status, created_at, completed_at, reminder_settings)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        task.id,
        task.title,
        task.description || '',
        task.deadline || null,
        task.priority,
        task.category,
        task.status,
        task.createdAt,
        task.completedAt || null,
        JSON.stringify(task.reminderSettings || { enabled: true, notify24Hours: true })
      ]
    );
    return task;
  }

  public update(id: string, updates: Partial<Task>): Task | null {
    const existing = this.getById(id);
    if (!existing) return null;

    const updated: Task = { ...existing, ...updates };
    dbManager.run(
      `UPDATE tasks SET title = ?, description = ?, deadline = ?, priority = ?, category = ?, status = ?, completed_at = ?, reminder_settings = ?
       WHERE id = ?`,
      [
        updated.title,
        updated.description || '',
        updated.deadline || null,
        updated.priority,
        updated.category,
        updated.status,
        updated.completedAt || null,
        JSON.stringify(updated.reminderSettings || { enabled: true }),
        id
      ]
    );
    return updated;
  }

  public delete(id: string): boolean {
    dbManager.run('DELETE FROM tasks WHERE id = ?', [id]);
    return true;
  }
}

export class PetRepository {
  public get(): PetStateData {
    const r = dbManager.get('SELECT * FROM pet_state WHERE id = 1');
    if (!r) {
      return {
        mood: 'IDLE',
        name: 'PawPilot',
        type: 'cat_fox',
        xp: 0,
        level: 1,
        streakDays: 1,
        lastActive: new Date().toISOString()
      };
    }
    return {
      mood: 'IDLE',
      name: r.name,
      type: r.type,
      xp: r.xp,
      level: r.level,
      streakDays: r.streak_days,
      lastActive: r.last_active,
      accessoryId: r.accessory_id || undefined
    };
  }

  public update(data: Partial<PetStateData>): PetStateData {
    const current = this.get();
    const updated = { ...current, ...data };
    dbManager.run(
      `UPDATE pet_state SET name = ?, type = ?, xp = ?, level = ?, streak_days = ?, last_active = ?, accessory_id = ? WHERE id = 1`,
      [
        updated.name,
        updated.type,
        updated.xp,
        updated.level,
        updated.streakDays,
        updated.lastActive,
        updated.accessoryId || null
      ]
    );
    return updated;
  }

  public addXp(amount: number): { xp: number; level: number; leveledUp: boolean } {
    const current = this.get();
    let newXp = current.xp + amount;
    let newLevel = current.level;
    let leveledUp = false;

    while (newXp >= newLevel * 100) {
      newXp -= newLevel * 100;
      newLevel += 1;
      leveledUp = true;
    }

    this.update({ xp: newXp, level: newLevel });
    return { xp: newXp, level: newLevel, leveledUp };
  }
}

export class SettingsRepository {
  public get(): AppSettings {
    const r = dbManager.get('SELECT * FROM settings WHERE id = 1');
    if (!r) {
      return {
        launchOnStartup: true,
        alwaysOnTop: true,
        petSize: 1.0,
        petPosition: { x: 1200, y: 700 },
        petName: 'PawPilot',
        petType: 'cat_fox',
        theme: 'dark',
        soundEnabled: true,
        quietHoursEnabled: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00',
        aiApiKey: process.env.AI_API_KEY || '',
        aiModel: process.env.AI_MODEL || 'gpt-4o-mini',
        focusDurationMinutes: 25
      };
    }
    return {
      launchOnStartup: Boolean(r.launch_on_startup),
      alwaysOnTop: Boolean(r.always_on_top),
      petSize: r.pet_size,
      petPosition: { x: r.pos_x, y: r.pos_y },
      petName: r.pet_name || 'PawPilot',
      petType: r.pet_type || 'cat_fox',
      theme: (r.theme as any) || 'dark',
      soundEnabled: Boolean(r.sound_enabled),
      quietHoursEnabled: Boolean(r.quiet_hours_enabled),
      quietHoursStart: r.quiet_hours_start || '22:00',
      quietHoursEnd: r.quiet_hours_end || '07:00',
      aiApiKey: r.ai_api_key || process.env.AI_API_KEY || '',
      aiModel: r.ai_model || process.env.AI_MODEL || 'gpt-4o-mini',
      focusDurationMinutes: r.focus_duration_minutes || 25
    };
  }

  public update(settings: Partial<AppSettings>): AppSettings {
    const current = this.get();
    const updated = { ...current, ...settings };
    dbManager.run(
      `UPDATE settings SET launch_on_startup = ?, always_on_top = ?, pet_size = ?, pos_x = ?, pos_y = ?, theme = ?, sound_enabled = ?, quiet_hours_enabled = ?, quiet_hours_start = ?, quiet_hours_end = ?, ai_api_key = ?, ai_model = ?, focus_duration_minutes = ? WHERE id = 1`,
      [
        updated.launchOnStartup ? 1 : 0,
        updated.alwaysOnTop ? 1 : 0,
        updated.petSize,
        updated.petPosition.x,
        updated.petPosition.y,
        updated.theme,
        updated.soundEnabled ? 1 : 0,
        updated.quietHoursEnabled ? 1 : 0,
        updated.quietHoursStart,
        updated.quietHoursEnd,
        updated.aiApiKey,
        updated.aiModel,
        updated.focusDurationMinutes
      ]
    );
    return updated;
  }
}

export class ChatRepository {
  public getAll(): ChatMessage[] {
    const rows = dbManager.all('SELECT * FROM chat_history ORDER BY timestamp ASC');
    return rows.map(r => ({
      id: r.id,
      sender: r.sender as any,
      text: r.text,
      timestamp: r.timestamp,
      toolCall: r.tool_call ? JSON.parse(r.tool_call) : undefined
    }));
  }

  public add(msg: ChatMessage): ChatMessage {
    dbManager.run(
      `INSERT INTO chat_history (id, sender, text, timestamp, tool_call) VALUES (?, ?, ?, ?, ?)`,
      [msg.id, msg.sender, msg.text, msg.timestamp, msg.toolCall ? JSON.stringify(msg.toolCall) : null]
    );
    return msg;
  }

  public clear(): void {
    dbManager.run('DELETE FROM chat_history');
  }
}

export const taskRepo = new TaskRepository();
export const petRepo = new PetRepository();
export const settingsRepo = new SettingsRepository();
export const chatRepo = new ChatRepository();
