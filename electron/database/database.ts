import path from 'path';
import fs from 'fs';
import { app } from 'electron';
import initSqlJs from 'sql.js';
import { INITIAL_SCHEMA } from './schema.js';

export class DatabaseManager {
  private db: any = null;
  private dbPath: string;

  constructor() {
    const userDataPath = app ? app.getPath('userData') : process.cwd();
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }
    this.dbPath = path.join(userDataPath, 'pawpilot.db');
  }

  public async init() {
    try {
      const SQL = await initSqlJs();
      if (fs.existsSync(this.dbPath)) {
        const filebuffer = fs.readFileSync(this.dbPath);
        this.db = new SQL.Database(filebuffer);
      } else {
        this.db = new SQL.Database();
      }
      this.db.run(INITIAL_SCHEMA);
      this.persist();
      this.ensureDefaults();
      console.log('✅ SQLite database initialized at:', this.dbPath);
    } catch (err) {
      console.error('❌ Failed to initialize SQLite database:', err);
    }
  }

  private persist() {
    if (this.db) {
      const data = this.db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(this.dbPath, buffer);
    }
  }

  private ensureDefaults() {
    const now = new Date().toISOString();
    const petCount = this.get('SELECT COUNT(*) as count FROM pet_state');
    if (!petCount || petCount.count === 0) {
      this.run(
        `INSERT INTO pet_state (id, name, type, xp, level, streak_days, last_active) VALUES (1, 'PawPilot', 'cat_fox', 0, 1, 1, ?)`,
        [now]
      );
    }
    const settingsCount = this.get('SELECT COUNT(*) as count FROM settings');
    if (!settingsCount || settingsCount.count === 0) {
      this.run(
        `INSERT INTO settings (id, launch_on_startup, always_on_top, pet_size, pos_x, pos_y, theme, sound_enabled) VALUES (1, 1, 1, 1.0, 1200, 700, 'dark', 1)`
      );
    }
  }

  public run(sql: string, params: any[] = []): any {
    if (this.db) {
      this.db.run(sql, params);
      this.persist();
      return { changes: 1 };
    }
    return { changes: 0 };
  }

  public get(sql: string, params: any[] = []): any {
    if (this.db) {
      const stmt = this.db.prepare(sql);
      stmt.bind(params);
      if (stmt.step()) {
        const row = stmt.getAsObject();
        stmt.free();
        return row;
      }
      stmt.free();
      return null;
    }
    return null;
  }

  public all(sql: string, params: any[] = []): any[] {
    if (this.db) {
      const stmt = this.db.prepare(sql);
      stmt.bind(params);
      const rows: any[] = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();
      return rows;
    }
    return [];
  }
}

export const dbManager = new DatabaseManager();
