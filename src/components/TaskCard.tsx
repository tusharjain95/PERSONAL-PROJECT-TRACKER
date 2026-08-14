import React from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Clock, 
  Calendar, 
  ChevronRight, 
  ChevronLeft, 
  Layers, 
  Sparkles,
  ArrowRight,
  ListTodo
} from 'lucide-react';
import { Task, ColumnStatus, Priority } from '../types';
import { calculateMilestoneStats, formatDate, isOverdue } from '../utils/storage';

interface TaskCardProps {
  task: Task;
  onSelectTask: (task: Task) => void;
  onMoveTask: (taskId: string, newStatus: ColumnStatus) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onSelectTask,
  onMoveTask,
}) => {
  const stats = calculateMilestoneStats(task.milestones || []);
  const overdue = isOverdue(task.dueDate) && task.status !== 'done';

  const priorityConfig: Record<Priority, { label: string; bg: string; text: string; dot: string }> = {
    low: { label: 'Low', bg: 'bg-slate-100 border-slate-200', text: 'text-slate-700', dot: 'bg-slate-400' },
    medium: { label: 'Medium', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' },
    high: { label: 'High', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
    urgent: { label: 'Urgent', bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500' },
  };

  const currentPriority = priorityConfig[task.priority] || priorityConfig.medium;

  const columnFlow: ColumnStatus[] = ['backlog', 'in_progress', 'in_review', 'done'];
  const currentIndex = columnFlow.indexOf(task.status);
  const prevStatus = currentIndex > 0 ? columnFlow[currentIndex - 1] : null;
  const nextStatus = currentIndex < columnFlow.length - 1 ? columnFlow[currentIndex + 1] : null;

  return (
    <motion.div
      id={`task-card-${task.id}`}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      onClick={() => onSelectTask(task)}
      className="group relative bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer select-none"
    >
      {/* Top Meta Row: Priority & Due Date */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${currentPriority.bg} ${currentPriority.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${currentPriority.dot}`} />
          {currentPriority.label}
        </span>

        {task.dueDate && (
          <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md ${
            overdue 
              ? 'bg-rose-50 text-rose-700 font-semibold border border-rose-200' 
              : 'text-slate-500 bg-slate-50 border border-slate-100'
          }`}>
            <Calendar className="w-3 h-3" />
            {formatDate(task.dueDate)}
          </span>
        )}
      </div>

      {/* Task Title */}
      <h3 className="text-sm font-semibold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
        {task.title}
      </h3>

      {/* Task Description snippet if available */}
      {task.description && (
        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Milestones Breakdown Highlight Box */}
      <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 group-hover:bg-indigo-50/40 group-hover:border-indigo-100 transition-colors">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <ListTodo className="w-3.5 h-3.5 text-indigo-500" />
            Milestones:
          </span>
          <span className="font-mono font-bold text-slate-800 text-[11px]">
            {stats.completed}/{stats.total} ({stats.percentage}%)
          </span>
        </div>

        {/* Mini progress bar */}
        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              stats.percentage === 100 
                ? 'bg-emerald-500' 
                : stats.percentage > 50 
                ? 'bg-indigo-500' 
                : stats.percentage > 0 
                ? 'bg-amber-500' 
                : 'bg-slate-300'
            }`}
            style={{ width: `${stats.percentage}%` }}
          />
        </div>

        {/* Sub-label showing pending vs completed count */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium mt-1.5 pt-0.5">
          <span className="text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5" />
            {stats.completed} Done
          </span>
          <span className="text-amber-700 font-semibold flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            {stats.pending} Pending
          </span>
        </div>
      </div>

      {/* Tags & Quick Move Row */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
        {/* Tags preview */}
        <div className="flex flex-wrap gap-1 items-center max-w-[65%]">
          {task.tags && task.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 truncate"
            >
              #{tag}
            </span>
          ))}
          {task.tags && task.tags.length > 2 && (
            <span className="text-[10px] text-slate-400 font-medium">
              +{task.tags.length - 2}
            </span>
          )}
        </div>

        {/* Quick Column Shift Controls */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {prevStatus && (
            <button
              onClick={() => onMoveTask(task.id, prevStatus)}
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
              title={`Move to previous column`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}
          {nextStatus && (
            <button
              onClick={() => onMoveTask(task.id, nextStatus)}
              className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
              title={`Advance to next column`}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Hover prompt hint */}
      <div className="absolute inset-x-0 bottom-0 py-1 bg-indigo-600 text-white text-[10px] font-semibold text-center rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 pointer-events-none">
        <span>Click to view exact milestones</span>
        <ArrowRight className="w-2.5 h-2.5" />
      </div>
    </motion.div>
  );
};
