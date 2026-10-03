import React from 'react';
import { Task, TaskPriority } from '../types';
import { formatDate, getDeadlineProximity } from '../utils/dateUtils';
import { CheckCircle2, Clock, Trash2, Edit3, AlertCircle } from 'lucide-react';
import { soundService } from '../services/soundService';

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit?: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onComplete,
  onDelete,
  onEdit
}) => {
  const isCompleted = task.status === 'COMPLETED';
  const proximity = getDeadlineProximity(task.deadline);

  const getPriorityBadge = (p: TaskPriority) => {
    switch (p) {
      case 'URGENT':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'MEDIUM':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'LOW':
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/40';
    }
  };

  return (
    <div
      className={`group relative rounded-2xl p-4 transition-all duration-300 border backdrop-blur-md ${
        isCompleted
          ? 'bg-card/40 border-border/40 opacity-60'
          : proximity === 'URGENT' || proximity === 'EXPIRED'
          ? 'bg-rose-950/20 border-rose-500/40 shadow-lg shadow-rose-950/30'
          : 'bg-card/80 border-border/80 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-950/30'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Complete Checkbox */}
        <button
          onClick={() => {
            soundService.playCelebration();
            onComplete(task.id);
          }}
          className={`mt-0.5 p-1 rounded-lg transition-colors ${
            isCompleted
              ? 'text-emerald-400 bg-emerald-500/10'
              : 'text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10'
          }`}
        >
          <CheckCircle2 className={`w-5 h-5 ${isCompleted ? 'fill-emerald-500/20' : ''}`} />
        </button>

        {/* Task Title & Details */}
        <div className="flex-1 min-w-0">
          <h4
            className={`font-semibold text-sm leading-snug transition-all ${
              isCompleted ? 'line-through text-gray-500' : 'text-gray-100'
            }`}
          >
            {task.title}
          </h4>

          {task.description && (
            <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Meta Tags */}
          <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px]">
            {/* Priority Badge */}
            <span className={`px-2 py-0.5 rounded-md border font-medium uppercase tracking-wider ${getPriorityBadge(task.priority)}`}>
              {task.priority}
            </span>

            {/* Category Tag */}
            <span className="px-2 py-0.5 rounded-md bg-background/60 border border-border/60 text-gray-400 font-medium">
              {task.category}
            </span>

            {/* Deadline Tag */}
            {task.deadline && (
              <span
                className={`flex items-center gap-1 font-medium ${
                  proximity === 'URGENT' || proximity === 'EXPIRED'
                    ? 'text-rose-400'
                    : 'text-gray-400'
                }`}
              >
                <Clock className="w-3 h-3" />
                {formatDate(task.deadline)}
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
