import { ipcMain } from 'electron';
import { taskRepo, petRepo, settingsRepo, chatRepo } from '../database/repository.js';
import { notificationManager } from '../main/notificationManager.js';
import { startupManager } from '../main/startupManager.js';
import { windowManager } from '../main/windowManager.js';
import { Task } from '../types/index.js';

export function registerIpcHandlers() {
  ipcMain.handle('tasks:get-all', () => taskRepo.getAll());
  ipcMain.handle('tasks:get-by-id', (_, id: string) => taskRepo.getById(id));
  ipcMain.handle('tasks:create', (_, task: Task) => taskRepo.create(task));
  ipcMain.handle('tasks:update', (_, id: string, updates: Partial<Task>) => taskRepo.update(id, updates));
  ipcMain.handle('tasks:delete', (_, id: string) => taskRepo.delete(id));

  ipcMain.handle('pet:get-state', () => petRepo.get());
  ipcMain.handle('pet:update-state', (_, updates: any) => petRepo.update(updates));
  ipcMain.handle('pet:add-xp', (_, amount: number) => petRepo.addXp(amount));

  ipcMain.handle('settings:get', () => settingsRepo.get());
  ipcMain.handle('settings:update', (_, updates: any) => {
    const updated = settingsRepo.update(updates);
    if ('launchOnStartup' in updates) {
      startupManager.setAutoLaunch(updated.launchOnStartup);
    }
    if ('alwaysOnTop' in updates) {
      windowManager.updateAlwaysOnTop(updated.alwaysOnTop);
    }
    return updated;
  });

  ipcMain.handle('chat:get-all', () => chatRepo.getAll());
  ipcMain.handle('chat:add', (_, msg: any) => chatRepo.add(msg));
  ipcMain.handle('chat:clear', () => chatRepo.clear());

  ipcMain.handle('notifications:notify', (_, title: string, body: string) => {
    return notificationManager.showNotification(title, body);
  });

  ipcMain.handle('window:open-dashboard', () => {
    windowManager.createDashboardWindow();
  });
  ipcMain.handle('window:toggle-pet', () => {
    windowManager.togglePet();
  });
  ipcMain.handle('window:ignore-mouse-events', (event, ignore: boolean, options?: any) => {
    const win = windowManager.getPetWindow();
    if (win && !win.isDestroyed()) {
      win.setIgnoreMouseEvents(ignore, options);
    }
  });

  // Renderer sends new X position — main moves the pet window
  ipcMain.handle('window:move-pet', (_event, x: number) => {
    windowManager.movePetTo(x);
  });

  // Renderer asks for the screen work area so it knows the walking range
  ipcMain.handle('window:get-screen-bounds', () => {
    return windowManager.getScreenBounds();
  });
}
