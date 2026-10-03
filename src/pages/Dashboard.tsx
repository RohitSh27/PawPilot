import React, { useState, useEffect } from 'react';
import { Task, AppSettings, ProductivityStats, PetStateData } from '../types';
import { taskService } from '../tasks/taskService';
import { calculateProductivityStats, getXpForTask } from '../services/productivityService';
import { TasksPage } from './TasksPage';
import { CalendarPage } from './CalendarPage';
import { StatsPage } from './StatsPage';
import { ChatPage } from './ChatPage';
import { SettingsPage } from './SettingsPage';
import { FocusTimer } from '../components/FocusTimer';
import { CheckSquare, Calendar, BarChart3, MessageSquare, Settings, Timer, Sparkles, LayoutDashboard, Flame } from 'lucide-react';
import { soundService } from '../services/soundService';

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'calendar' | 'stats' | 'chat' | 'focus' | 'settings'>('overview');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
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
    aiApiKey: '',
    aiModel: 'gpt-4o-mini',
    focusDurationMinutes: 25
  });
  const [petState, setPetState] = useState<PetStateData>({
    mood: 'IDLE',
    name: 'PawPilot',
    type: 'cat_fox',
    xp: 0,
    level: 1,
    streakDays: 1,
    lastActive: new Date().toISOString()
  });

  const loadData = async () => {
    const fetchedTasks = await taskService.getAllTasks();
    setTasks(fetchedTasks);

    if (typeof window !== 'undefined' && (window as any).pawpilot) {
      const fetchedSettings = await (window as any).pawpilot.settings.get();
      setSettings(fetchedSettings);
      soundService.setEnabled(fetchedSettings.soundEnabled);

      const fetchedPetState = await (window as any).pawpilot.pet.getState();
      setPetState(fetchedPetState);
    }
  };

  useEffect(() => {
    loadData();

    // Listen for tray navigation signals
    if (typeof window !== 'undefined' && (window as any).pawpilot?.onNavigate) {
      (window as any).pawpilot.onNavigate((route: string) => {
        if (['overview', 'tasks', 'calendar', 'stats', 'chat', 'focus', 'settings'].includes(route)) {
          setActiveTab(route as any);
        }
      });
    }
  }, []);

  const handleTaskCreated = async (taskData: Partial<Task>) => {
    await taskService.createTask(taskData.title || 'New Task', taskData);
    soundService.playClick();
    loadData();
  };

  const handleTaskCompleted = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      const xpAmount = getXpForTask(task.priority);
      if (typeof window !== 'undefined' && (window as any).pawpilot?.pet) {
        await (window as any).pawpilot.pet.addXp(xpAmount);
      }
    }
    await taskService.completeTask(id);
    loadData();
  };

  const handleTaskDeleted = async (id: string) => {
    await taskService.deleteTask(id);
    loadData();
  };

  const handleTaskUpdated = async (id: string, updates: Partial<Task>) => {
    await taskService.updateTask(id, updates);
    loadData();
  };

  const handleUpdateSettings = async (updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    soundService.setEnabled(newSettings.soundEnabled);

    if (typeof window !== 'undefined' && (window as any).pawpilot?.settings) {
      await (window as any).pawpilot.settings.update(updates);
    }
  };

  const stats: ProductivityStats = calculateProductivityStats(tasks, petState.xp, petState.level, petState.streakDays);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'focus', label: 'Focus Mode', icon: Timer },
    { id: 'stats', label: 'Stats & Level', icon: BarChart3 },
    { id: 'chat', label: 'AI Assistant', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="flex h-screen w-screen bg-background text-gray-100 font-sans overflow-hidden select-none">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-card/60 border-r border-border/60 p-4 flex flex-col justify-between backdrop-blur-xl">
        <div className="space-y-6">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-gray-950 font-bold text-lg shadow-lg shadow-cyan-500/20">
              🐾
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-wide bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                PawPilot
              </h1>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Virtual Assistant</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    soundService.playClick();
                    setActiveTab(item.id as any);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-950/30'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-card/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Pet Level Summary Footer */}
        <div className="bg-card/80 border border-border/80 rounded-2xl p-3 flex items-center gap-3 backdrop-blur-md">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 text-xs font-bold">
            L{petState.level}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-gray-200 truncate">{petState.name}</div>
            <div className="text-[10px] text-gray-400">{petState.xp} XP • {petState.streakDays}d Streak 🔥</div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8 space-y-6">
        {/* Daily Brief Banner */}
        <div className="bg-gradient-to-r from-cyan-950/60 via-slate-900 to-purple-950/40 border border-cyan-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-1">
                <Sparkles className="w-3.5 h-3.5" /> PawPilot Daily Brief
              </div>
              <h2 className="text-xl font-bold text-gray-100">
                You have {stats.upcomingCount} pending tasks today
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                {stats.overdueCount > 0 ? (
                  <span className="text-amber-400 font-semibold">⚠️ {stats.overdueCount} task(s) are overdue!</span>
                ) : (
                  'All deadlines are looking good. Stay focused!'
                )}
              </p>
            </div>

            <div className="flex items-center gap-3 bg-card/80 border border-border/80 rounded-2xl px-4 py-2">
              <Flame className="w-5 h-5 text-amber-400" />
              <div>
                <div className="text-xs font-bold text-gray-200">{stats.streakDays} Day Streak</div>
                <div className="text-[10px] text-gray-400">Keep up the momentum!</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Views */}
        {activeTab === 'overview' && (
          <TasksPage
            tasks={tasks}
            onTaskCreated={handleTaskCreated}
            onTaskCompleted={handleTaskCompleted}
            onTaskDeleted={handleTaskDeleted}
            onTaskUpdated={handleTaskUpdated}
          />
        )}
        {activeTab === 'tasks' && (
          <TasksPage
            tasks={tasks}
            onTaskCreated={handleTaskCreated}
            onTaskCompleted={handleTaskCompleted}
            onTaskDeleted={handleTaskDeleted}
            onTaskUpdated={handleTaskUpdated}
          />
        )}
        {activeTab === 'calendar' && <CalendarPage tasks={tasks} />}
        {activeTab === 'focus' && (
          <div className="max-w-md mx-auto py-8">
            <FocusTimer
              durationMinutes={settings.focusDurationMinutes}
              onFocusComplete={() => handleTaskCreated({ title: 'Completed Focus Session', priority: 'MEDIUM' })}
            />
          </div>
        )}
        {activeTab === 'stats' && <StatsPage stats={stats} />}
        {activeTab === 'chat' && (
          <ChatPage
            apiKey={settings.aiApiKey}
            model={settings.aiModel}
            onTaskCreated={loadData}
          />
        )}
        {activeTab === 'settings' && (
          <SettingsPage
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
          />
        )}
      </main>
    </div>
  );
};
