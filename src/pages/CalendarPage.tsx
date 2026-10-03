import React, { useState } from 'react';
import { Task } from '../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface CalendarPageProps {
  tasks: Task[];
}

export const CalendarPage: React.FC<CalendarPageProps> = ({ tasks }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-100">Deadline Calendar</h2>
          <p className="text-xs text-gray-400 mt-0.5">Visual schedule of your upcoming milestones</p>
        </div>

        <div className="flex items-center gap-3 bg-card/80 border border-border/80 rounded-2xl px-3 py-1.5">
          <button onClick={prevMonth} className="p-1 text-gray-400 hover:text-white">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-gray-200">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <button onClick={nextMonth} className="p-1 text-gray-400 hover:text-white">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-card/80 border border-border/80 rounded-3xl p-4 shadow-xl backdrop-blur-xl">
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {daysInMonth.map((day, idx) => {
            const dayTasks = tasks.filter(
              t => t.deadline && isSameDay(parseISO(t.deadline), day) && t.status !== 'COMPLETED'
            );

            return (
              <div
                key={idx}
                className="min-h-[85px] bg-background/60 border border-border/50 rounded-2xl p-2 flex flex-col justify-between hover:border-cyan-500/40 transition-colors"
              >
                <div className="text-[11px] font-bold text-gray-400">{format(day, 'd')}</div>

                <div className="space-y-1">
                  {dayTasks.map(task => (
                    <div
                      key={task.id}
                      className="px-1.5 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-500/40 text-[10px] font-medium text-cyan-300 truncate"
                      title={task.title}
                    >
                      {task.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
