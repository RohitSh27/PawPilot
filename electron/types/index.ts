export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED' | 'ARCHIVED';
export type TaskCategory = 'STUDY' | 'WORK' | 'PERSONAL' | 'PROJECT' | 'HEALTH' | 'OTHER';

export interface Task {
  id: string;
  title: string;
  description?: string;
  deadline?: string;
  priority: TaskPriority;
  category: TaskCategory;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
  reminderSettings?: {
    enabled: boolean;
    notify7Days?: boolean;
    notify3Days?: boolean;
    notify24Hours?: boolean;
    notify3Hours?: boolean;
  };
}

export type PetMood = 'IDLE' | 'HAPPY' | 'WORRIED' | 'EXCITED' | 'SLEEPING' | 'WORKING' | 'CELEBRATING' | 'SAD';

export interface PetStateData {
  mood: PetMood;
  name: string;
  type: string;
  xp: number;
  level: number;
  streakDays: number;
  lastActive: string;
  accessoryId?: string;
}

export interface ProductivityStats {
  completedToday: number;
  completedThisWeek: number;
  overdueCount: number;
  upcomingCount: number;
  streakDays: number;
  completionRate: number;
  xp: number;
  level: number;
}

export interface AppSettings {
  launchOnStartup: boolean;
  alwaysOnTop: boolean;
  petSize: number;
  petPosition: { x: number; y: number };
  petName: string;
  petType: string;
  theme: 'dark' | 'glass';
  soundEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  aiApiKey: string;
  aiModel: string;
  focusDurationMinutes: number;
}

export interface SpeechMessage {
  id: string;
  text: string;
  type?: 'greeting' | 'reminder' | 'encouragement' | 'warning' | 'celebration' | 'chat';
  durationMs?: number;
  actions?: Array<{ label: string; action: string }>;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'pet';
  text: string;
  timestamp: string;
  toolCall?: {
    name: string;
    args: any;
    result?: any;
  };
}
