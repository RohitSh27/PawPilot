import { Task, TaskPriority, TaskCategory, TaskStatus } from '../types';

export class TaskService {
  private getApi() {
    if (typeof window !== 'undefined' && (window as any).pawpilot) {
      return (window as any).pawpilot.tasks;
    }
    return null;
  }

  public async getAllTasks(): Promise<Task[]> {
    const api = this.getApi();
    if (api) {
      return await api.getAll();
    }
    // Memory fallback for browser preview
    const cached = localStorage.getItem('pawpilot_tasks');
    return cached ? JSON.parse(cached) : [];
  }

  public async createTask(title: string, options: Partial<Task> = {}): Promise<Task> {
    const newTask: Task = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      title,
      description: options.description || '',
      deadline: options.deadline || undefined,
      priority: options.priority || 'MEDIUM',
      category: options.category || 'WORK',
      status: 'TODO',
      createdAt: new Date().toISOString(),
      reminderSettings: options.reminderSettings || { enabled: true, notify24Hours: true, notify3Hours: true }
    };

    const api = this.getApi();
    if (api) {
      return await api.create(newTask);
    }

    const tasks = await this.getAllTasks();
    tasks.unshift(newTask);
    localStorage.setItem('pawpilot_tasks', JSON.stringify(tasks));
    return newTask;
  }

  public async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    const api = this.getApi();
    if (api) {
      return await api.update(id, updates);
    }

    const tasks = await this.getAllTasks();
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) return null;

    tasks[idx] = { ...tasks[idx], ...updates };
    localStorage.setItem('pawpilot_tasks', JSON.stringify(tasks));
    return tasks[idx];
  }

  public async completeTask(id: string): Promise<Task | null> {
    return this.updateTask(id, {
      status: 'COMPLETED',
      completedAt: new Date().toISOString()
    });
  }

  public async deleteTask(id: string): Promise<boolean> {
    const api = this.getApi();
    if (api) {
      return await api.delete(id);
    }

    let tasks = await this.getAllTasks();
    tasks = tasks.filter(t => t.id !== id);
    localStorage.setItem('pawpilot_tasks', JSON.stringify(tasks));
    return true;
  }
}

export const taskService = new TaskService();
