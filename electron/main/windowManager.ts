import { BrowserWindow, screen, app } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { settingsRepo } from '../database/repository.js';

const getDirname = () => {
  try {
    return __dirname;
  } catch {
    return path.dirname(fileURLToPath(import.meta.url));
  }
};

const currentDir = getDirname();

/**
 * PET WINDOW APPROACH:
 * A small transparent frameless window (~280x320) that the RENDERER tells
 * to move around via IPC.  This is the battle-tested approach used by
 * Shimeji / desktop-pet apps on Windows — fullscreen transparent overlays
 * are unreliable on Windows due to GPU compositing issues.
 */
export class WindowManager {
  private petWindow: BrowserWindow | null = null;
  private dashboardWindow: BrowserWindow | null = null;

  private getPreloadPath(): string {
    const srcCjsPath = path.resolve(app.getAppPath(), 'electron/preload/preload.cjs');
    if (fs.existsSync(srcCjsPath)) return srcCjsPath;
    const distCjsPath = path.resolve(app.getAppPath(), 'dist-electron/preload/preload.cjs');
    if (fs.existsSync(distCjsPath)) return distCjsPath;
    return srcCjsPath;
  }

  public getScreenBounds() {
    const display = screen.getPrimaryDisplay();
    return display.workArea;
  }

  public createPetWindow(): BrowserWindow {
    if (this.petWindow && !this.petWindow.isDestroyed()) {
      this.petWindow.show();
      return this.petWindow;
    }

    const { width: workW, height: workH, x: workX, y: workY } = this.getScreenBounds();
    const winW = 280;
    const winH = 340;  // enough for speech bubble + pet
    const startX = workX + Math.floor(workW * 0.6);
    const startY = workY + workH - winH;

    const preloadFile = this.getPreloadPath();
    console.log('📌 Pet preload:', preloadFile);
    console.log(`📐 Pet window: ${winW}x${winH} at (${startX}, ${startY}), screen ${workW}x${workH}`);

    this.petWindow = new BrowserWindow({
      width: winW,
      height: winH,
      x: startX,
      y: startY,
      transparent: true,
      backgroundColor: '#00000000',
      frame: false,
      alwaysOnTop: true,
      hasShadow: false,
      resizable: false,
      skipTaskbar: true,
      webPreferences: {
        preload: preloadFile,
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
        backgroundThrottling: false,
      }
    });

    this.petWindow.setAlwaysOnTop(true, 'screen-saver');

    this.petWindow.webContents.on('console-message', (_e, _lvl, msg, line) => {
      console.log(`🐱 [Pet] ${msg} (line ${line})`);
    });

    this.petWindow.webContents.on('did-fail-load', (_e, code, desc) => {
      console.error('❌ Pet load failed:', code, desc);
    });

    const isDev = process.env.VITE_DEV_SERVER_URL;
    const indexPath = path.resolve(currentDir, '../../dist/index.html');

    if (isDev) {
      const url = `${process.env.VITE_DEV_SERVER_URL}#pet`;
      console.log('🌐 Loading:', url);
      this.petWindow.loadURL(url);
    } else {
      this.petWindow.loadFile(indexPath, { hash: 'pet' });
    }

    this.petWindow.show();
    return this.petWindow;
  }

  /**
   * Move the pet window to a new X position while keeping it anchored
   * to the bottom of the work area.
   */
  public movePetTo(x: number): void {
    if (!this.petWindow || this.petWindow.isDestroyed()) return;
    const { width: workW, height: workH, x: workX, y: workY } = this.getScreenBounds();
    const [winW, winH] = this.petWindow.getSize();
    // Clamp X to screen bounds
    const clampedX = Math.max(workX, Math.min(x, workX + workW - winW));
    const bottomY  = workY + workH - winH;
    this.petWindow.setBounds({ x: Math.round(clampedX), y: bottomY, width: winW, height: winH });
  }

  public createDashboardWindow(): BrowserWindow {
    if (this.dashboardWindow && !this.dashboardWindow.isDestroyed()) {
      if (this.dashboardWindow.isMinimized()) this.dashboardWindow.restore();
      this.dashboardWindow.show();
      this.dashboardWindow.focus();
      return this.dashboardWindow;
    }

    const preloadFile = this.getPreloadPath();

    this.dashboardWindow = new BrowserWindow({
      width: 1180,
      height: 760,
      minWidth: 900,
      minHeight: 600,
      center: true,
      show: false,
      backgroundColor: '#0b0f19',
      autoHideMenuBar: true,
      title: 'PawPilot Desktop Dashboard',
      webPreferences: {
        preload: preloadFile,
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false
      }
    });

    this.dashboardWindow.once('ready-to-show', () => {
      this.dashboardWindow?.show();
      this.dashboardWindow?.focus();
    });

    this.dashboardWindow.webContents.on('console-message', (_e, _lvl, msg, line) => {
      console.log(`📊 [Dash] ${msg} (line ${line})`);
    });

    this.dashboardWindow.on('close', (e) => {
      if (!(app as any).isQuitting) {
        e.preventDefault();
        this.dashboardWindow?.hide();
      }
    });

    const isDev = process.env.VITE_DEV_SERVER_URL;
    const indexPath = path.resolve(currentDir, '../../dist/index.html');
    if (isDev) {
      this.dashboardWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}#dashboard`);
    } else {
      this.dashboardWindow.loadFile(indexPath, { hash: 'dashboard' });
    }

    return this.dashboardWindow;
  }

  public getPetWindow(): BrowserWindow | null {
    return this.petWindow;
  }
  public getDashboardWindow(): BrowserWindow | null {
    return this.dashboardWindow;
  }

  public toggleDashboard(): void {
    if (this.dashboardWindow && !this.dashboardWindow.isDestroyed() && this.dashboardWindow.isVisible()) {
      this.dashboardWindow.hide();
    } else {
      this.createDashboardWindow();
    }
  }

  public togglePet(): void {
    if (this.petWindow && !this.petWindow.isDestroyed()) {
      this.petWindow.isVisible() ? this.petWindow.hide() : this.petWindow.show();
    } else {
      this.createPetWindow();
    }
  }

  public updateAlwaysOnTop(value: boolean): void {
    if (this.petWindow && !this.petWindow.isDestroyed()) {
      this.petWindow.setAlwaysOnTop(value, 'screen-saver');
    }
  }
}

export const windowManager = new WindowManager();
