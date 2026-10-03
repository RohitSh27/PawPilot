import React from 'react';
import { AppSettings } from '../types';
import { Shield, Key, Bell, Monitor, Volume2 } from 'lucide-react';

interface SettingsPageProps {
  settings: AppSettings;
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  onUpdateSettings
}) => {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-gray-100">Application Settings</h2>
        <p className="text-xs text-gray-400 mt-0.5">Customize pet behavior, notifications, and AI providers</p>
      </div>

      {/* General Settings */}
      <div className="bg-card/80 border border-border/80 rounded-3xl p-5 space-y-4 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-2 text-sm font-bold text-cyan-400 border-b border-border/50 pb-2">
          <Monitor className="w-4 h-4" /> Desktop & Pet Preferences
        </div>

        <div className="flex items-center justify-between text-xs">
          <div>
            <div className="font-semibold text-gray-200">Launch at Windows Startup</div>
            <div className="text-gray-400 text-[11px]">Automatically start PawPilot when Windows boots up</div>
          </div>
          <input
            type="checkbox"
            checked={settings.launchOnStartup}
            onChange={(e) => onUpdateSettings({ launchOnStartup: e.target.checked })}
            className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between text-xs">
          <div>
            <div className="font-semibold text-gray-200">Pet Always On Top</div>
            <div className="text-gray-400 text-[11px]">Keep the desktop pet above active windows</div>
          </div>
          <input
            type="checkbox"
            checked={settings.alwaysOnTop}
            onChange={(e) => onUpdateSettings({ alwaysOnTop: e.target.checked })}
            className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
          />
        </div>

        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="font-semibold text-gray-200">Pet Size Scale</span>
            <span className="text-cyan-400 font-mono">{settings.petSize}x</span>
          </div>
          <input
            type="range"
            min="0.8"
            max="1.5"
            step="0.1"
            value={settings.petSize}
            onChange={(e) => onUpdateSettings({ petSize: parseFloat(e.target.value) })}
            className="w-full accent-cyan-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Notifications & Audio */}
      <div className="bg-card/80 border border-border/80 rounded-3xl p-5 space-y-4 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-2 text-sm font-bold text-purple-400 border-b border-border/50 pb-2">
          <Bell className="w-4 h-4" /> Notifications & Sound
        </div>

        <div className="flex items-center justify-between text-xs">
          <div>
            <div className="font-semibold text-gray-200">Enable Sound Effects</div>
            <div className="text-gray-400 text-[11px]">Chimes for clicks, task completions, and level ups</div>
          </div>
          <input
            type="checkbox"
            checked={settings.soundEnabled}
            onChange={(e) => onUpdateSettings({ soundEnabled: e.target.checked })}
            className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between text-xs">
          <div>
            <div className="font-semibold text-gray-200">Quiet Hours</div>
            <div className="text-gray-400 text-[11px]">Suppress notifications during sleeping hours</div>
          </div>
          <input
            type="checkbox"
            checked={settings.quietHoursEnabled}
            onChange={(e) => onUpdateSettings({ quietHoursEnabled: e.target.checked })}
            className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
          />
        </div>
      </div>

      {/* AI Provider Config */}
      <div className="bg-card/80 border border-border/80 rounded-3xl p-5 space-y-4 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-2 text-sm font-bold text-emerald-400 border-b border-border/50 pb-2">
          <Key className="w-4 h-4" /> AI Engine Configuration
        </div>

        <div className="space-y-2 text-xs">
          <label className="block font-semibold text-gray-200">API Key</label>
          <input
            type="password"
            value={settings.aiApiKey}
            onChange={(e) => onUpdateSettings({ aiApiKey: e.target.value })}
            placeholder="OpenAI: sk-...   |   Gemini: AIza..."
            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-gray-100 focus:outline-none focus:border-emerald-500"
          />
          <div className="flex gap-2 pt-1">
            <span className="px-2 py-0.5 rounded-full bg-emerald-900/40 border border-emerald-500/40 text-emerald-300 text-[10px] font-semibold">
              ✓ OpenAI (sk-...)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-blue-900/40 border border-blue-500/40 text-blue-300 text-[10px] font-semibold">
              ✓ Gemini (AIza...)
            </span>
          </div>
          <p className="text-[11px] text-gray-400">
            Paste your OpenAI key (starts with sk-) or Google Gemini key (starts with AIza). The provider is auto-detected. Keys are stored locally and never shared.
          </p>
        </div>

        <div className="space-y-2 text-xs">
          <label className="block font-semibold text-gray-200">Model</label>
          <select
            value={settings.aiModel}
            onChange={(e) => onUpdateSettings({ aiModel: e.target.value })}
            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-gray-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <optgroup label="OpenAI Models">
              <option value="gpt-4o-mini">GPT-4o Mini (fast &amp; cheap)</option>
              <option value="gpt-4o">GPT-4o (best quality)</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo (legacy)</option>
            </optgroup>
            <optgroup label="Google Gemini Models">
              <option value="gemini-1.5-flash">Gemini 1.5 Flash (fast)</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro (best)</option>
              <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
            </optgroup>
          </select>
        </div>
      </div>

      {/* Privacy Guarantee */}
      <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-3xl p-4 text-xs text-gray-300 flex items-start gap-3">
        <Shield className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-cyan-300">Privacy First Commitment</h4>
          <p className="mt-1 leading-relaxed text-[11px] text-gray-400">
            PawPilot stores all tasks, reminders, settings, and logs 100% locally on your desktop. We never perform keylogging, screen recording, or telemetry.
          </p>
        </div>
      </div>
    </div>
  );
};
