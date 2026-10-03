import { contextBridge, ipcRenderer } from 'electron';
import { Task, PetStateData, AppSettings, ChatMessage } from '../types/index.js';

contextBridge.exposeInMainWorld('pawpilot', {
  tasks: {
    getAll: (): Promise<Task[]> => ipcRenderer.invoke('tasks:get-all'),
    getById: (id: string): Promise<Task | null> => ipcRenderer.invoke('tasks:get-by-id', id),
    create: (task: Task): Promise<Task> => ipcRenderer.invoke('tasks:create', task),
    update: (id: string, updates: Partial<Task>): Promise<Task | null> => ipcRenderer.invoke('tasks:update', id, updates),
    delete: (id: string): Promise<boolean> => ipcRenderer.invoke('tasks:delete', id)
  },
  pet: {
    getState: (): Promise<PetStateData> => ipcRenderer.invoke('pet:get-state'),
    updateState: (updates: Partial<PetStateData>): Promise<PetStateData> => ipcRenderer.invoke('pet:update-state', updates),
    addXp: (amount: number): Promise<{ xp: number; level: number; leveledUp: boolean }> => ipcRenderer.invoke('pet:add-xp', amount)
  },
  settings: {
    get: (): Promise<AppSettings> => ipcRenderer.invoke('settings:get'),
    update: (updates: Partial<AppSettings>): Promise<AppSettings> => ipcRenderer.invoke('settings:update', updates)
  },
  chat: {
    getAll: (): Promise<ChatMessage[]> => ipcRenderer.invoke('chat:get-all'),
    add: (msg: ChatMessage): Promise<ChatMessage> => ipcRenderer.invoke('chat:add', msg),
    clear: (): Promise<void> => ipcRenderer.invoke('chat:clear')
  },
  notifications: {
    notify: (title: string, body: string): Promise<boolean> => ipcRenderer.invoke('notifications:notify', title, body)
  },
  window: {
    openDashboard: (): Promise<void> => ipcRenderer.invoke('window:open-dashboard'),
    togglePet: (): Promise<void> => ipcRenderer.invoke('window:toggle-pet'),
    setIgnoreMouseEvents: (ignore: boolean, options?: any) => ipcRenderer.invoke('window:ignore-mouse-events', ignore, options),
    movePet: (x: number): Promise<void> => ipcRenderer.invoke('window:move-pet', x),
    getScreenBounds: (): Promise<{ x: number; y: number; width: number; height: number }> => ipcRenderer.invoke('window:get-screen-bounds'),
  },
  onNavigate: (callback: (route: string) => void) => {
    ipcRenderer.on('navigate', (_event, route) => callback(route));
  }
});
