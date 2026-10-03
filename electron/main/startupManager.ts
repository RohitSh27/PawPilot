import { app } from 'electron';
import path from 'path';

export class StartupManager {
  public setAutoLaunch(enable: boolean): void {
    if (process.platform === 'win32' || process.platform === 'darwin') {
      const isDev = !app.isPackaged;
      if (isDev) {
        app.setLoginItemSettings({
          openAtLogin: enable,
          path: process.execPath,
          args: [path.resolve(app.getAppPath()), '--hidden']
        });
      } else {
        app.setLoginItemSettings({
          openAtLogin: enable,
          openAsHidden: true
        });
      }
      console.log(`🚀 Windows auto-launch setting updated to: ${enable} (packaged: ${!isDev})`);
    }
  }

  public isAutoLaunchEnabled(): boolean {
    if (process.platform === 'win32' || process.platform === 'darwin') {
      const settings = app.getLoginItemSettings();
      return settings.openAtLogin;
    }
    return false;
  }
}

export const startupManager = new StartupManager();
