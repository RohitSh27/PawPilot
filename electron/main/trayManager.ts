import { Tray, Menu, app, nativeImage } from 'electron';
import path from 'path';
import { windowManager } from './windowManager.js';

// 16x16 cyan paw icon PNG Data URI for Windows tray
const TRAY_ICON_DATA_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAiSURBVDhPY/z//z8DJYCJgURA1gDGUTAKRsEoGAWjADsAAIdpAQ0Ff458AAAAAElFTkSuQmCC';

export class TrayManager {
  private tray: Tray | null = null;

  public createTray(): void {
    try {
      const icon = nativeImage.createFromDataURL(TRAY_ICON_DATA_URL);
      this.tray = new Tray(icon);
      this.tray.setToolTip('PawPilot 🐾 AI Desktop Pet Assistant');

      const contextMenu = Menu.buildFromTemplate([
        {
          label: '🐾 PawPilot Desktop Pet',
          enabled: false
        },
        { type: 'separator' },
        {
          label: '🖥️ Open Dashboard',
          click: () => windowManager.createDashboardWindow()
        },
        {
          label: '👁️ Toggle Pet',
          click: () => windowManager.togglePet()
        },
        {
          label: '⏱️ Start Focus Session',
          click: () => {
            const win = windowManager.createDashboardWindow();
            win.webContents.send('navigate', 'focus');
          }
        },
        {
          label: '📋 Today\'s Tasks',
          click: () => {
            const win = windowManager.createDashboardWindow();
            win.webContents.send('navigate', 'tasks');
          }
        },
        {
          label: '⚙️ Settings',
          click: () => {
            const win = windowManager.createDashboardWindow();
            win.webContents.send('navigate', 'settings');
          }
        },
        { type: 'separator' },
        {
          label: '❌ Quit PawPilot',
          click: () => {
            (app as any).isQuitting = true;
            app.quit();
          }
        }
      ]);

      this.tray.setContextMenu(contextMenu);
      this.tray.on('double-click', () => {
        windowManager.toggleDashboard();
      });
      console.log('✅ System Tray initialized successfully');
    } catch (err) {
      console.warn('⚠️ Could not initialize System Tray icon:', err);
    }
  }

  public destroy(): void {
    if (this.tray) {
      try {
        this.tray.destroy();
      } catch {
        // ignore
      }
      this.tray = null;
    }
  }
}

export const trayManager = new TrayManager();
