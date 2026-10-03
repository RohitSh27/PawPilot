import React, { useState } from 'react';
import { Task } from '../types';
import { TaskCard } from '../components/TaskCard';
import { TaskModal } from '../components/TaskModal';
import { NaturalLanguageInput } from '../components/NaturalLanguageInput';
import { Plus, Search, Filter } from 'lucide-react';
import { isToday, parseISO } from 'date-fns';

interface TasksPageProps {
  tasks: Task[];
  onTaskCreated: (taskData: Partial<Task>) => void;
  onTaskCompleted: (id: string) => void;
  onTaskDeleted: (id: string) => void;
  onTaskUpdated: (id: string, updates: Partial<Task>) => void;
}

export const TasksPage: React.FC<TasksPageProps> = ({
  tasks,
  onTaskCreated,
  onTaskCompleted,
  onTaskDeleted,
  onTaskUpdated
}) => {
  const [filter, setFilter] = useState<'ALL' | 'TODAY' | 'UPCOMING' | 'OVERDUE' | 'COMPLETED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const now = new Date();

  const filteredTasks = tasks.filter(task => {
    // Search query filter
    if (searchQuery.trim()) {
      const matchTitle = task.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDesc = task.description?.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchTitle && !matchDesc) return false;
    }

    // Status filter
    if (filter === 'TODAY') {
      if (task.status === 'COMPLETED') return false;
      return task.deadline ? isToday(parseISO(task.deadline)) : true;
    }
    if (filter === 'UPCOMING') {
      if (task.status === 'COMPLETED' || !task.deadline) return false;
      return new Date(task.deadline) >= now;
    }
    if (filter === 'OVERDUE') {
      if (task.status === 'COMPLETED' || !task.deadline) return false;
      return new Date(task.deadline) < now;
    }
    if (filter === 'COMPLETED') {
      return task.status === 'COMPLETED';
    }
    return task.status !== 'ARCHIVED';
  });

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-100">Task Manager</h2>
          <p className="text-xs text-gray-400 mt-0.5">Organize your goals, assignments, and deadlines</p>
        </div>

        <button
          onClick={() => {
            setEditingTask(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Create Task
        </button>
      </div>

      {/* Natural Language AI Input */}
      <NaturalLanguageInput onConfirmTask={onTaskCreated} />

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card/60 p-2 rounded-2xl border border-border/60">
        <div className="flex flex-wrap items-center gap-1">
          {(['ALL', 'TODAY', 'UPCOMING', 'OVERDUE', 'COMPLETED'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filter === tab
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="bg-background/80 border border-border/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500/60"
          />
        </div>
      </div>

      {/* Task List Grid */}
      {filteredTasks.length === 0 ? (
        <div className="bg-card/40 border border-border/40 rounded-2xl p-12 text-center text-gray-400 text-xs">
          No tasks found matching your filter. Click "Create Task" or parse a prompt above! 🐾
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={onTaskCompleted}
              onDelete={onTaskDeleted}
              onEdit={t => {
                setEditingTask(t);
                setIsModalOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Task Edit/Create Modal */}
      <TaskModal
        isOpen={isModalOpen}
        initialTask={editingTask}
        onClose={() => setIsModalOpen(false)}
        onSave={data => {
          if (editingTask) {
            onTaskUpdated(editingTask.id, data);
          } else {
            onTaskCreated(data);
          }
        }}
      />
    </div>
  );
};
