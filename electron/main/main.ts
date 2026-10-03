import { app, BrowserWindow } from 'electron';
import { dbManager } from '../database/database.js';
import { registerIpcHandlers } from '../ipc/handlers.js';
import { windowManager } from './windowManager.js';
import { trayManager } from './trayManager.js';
import { startupManager } from './startupManager.js';
import { settingsRepo } from '../database/repository.js';

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const petWin = windowManager.getPetWindow();
    if (petWin) {
      petWin.show();
      petWin.focus();
    } else {
      windowManager.createPetWindow();
    }
    windowManager.createDashboardWindow();
  });
}

app.whenReady().then(async () => {
  console.log('🚀 Starting PawPilot Electron App...');

  // Initialize Database
  await dbManager.init();

  // Register IPC handlers
  registerIpcHandlers();

  // Check & sync startup preferences
  const settings = settingsRepo.get();
  startupManager.setAutoLaunch(settings.launchOnStartup);

  // Create System Tray
  trayManager.createTray();

  // Create BOTH Pet Window and Dashboard Window
  windowManager.createPetWindow();
  windowManager.createDashboardWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      windowManager.createPetWindow();
      windowManager.createDashboardWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Keep app running in system tray
  }
});

app.on('before-quit', () => {
  (app as any).isQuitting = true;
  trayManager.destroy();
});
