import React, { useState, useEffect } from 'react';
import { Task, TaskPriority, TaskCategory } from '../types';
import { X, Check } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  initialTask?: Task | null;
  onClose: () => void;
  onSave: (taskData: Partial<Task>) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  initialTask,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [category, setCategory] = useState<TaskCategory>('WORK');

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || '');
      setDeadline(initialTask.deadline ? initialTask.deadline.substring(0, 16) : '');
      setPriority(initialTask.priority);
      setCategory(initialTask.category);
    } else {
      setTitle('');
      setDescription('');
      setDeadline('');
      setPriority('MEDIUM');
      setCategory('WORK');
    }
  }, [initialTask, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title,
      description,
      deadline: deadline ? new Date(deadline).toISOString() : undefined,
      priority,
      category
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-3xl p-6 shadow-2xl max-w-md w-full relative">
        <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
          <h3 className="font-bold text-base text-gray-100">
            {initialTask ? 'Edit Task' : 'Create New Task'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-300 font-medium mb-1">Task Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. DBMS Assignment"
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-gray-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add optional task details..."
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-gray-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-medium mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-gray-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-gray-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="WORK">Work</option>
                <option value="STUDY">Study</option>
                <option value="PROJECT">Project</option>
                <option value="PERSONAL">Personal</option>
                <option value="HEALTH">Health</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-1">Deadline Date & Time</label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-gray-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-background border border-border text-gray-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Save Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
