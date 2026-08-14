import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Layers, 
  Sparkles, 
  CheckCheck, 
  Target, 
  AlertCircle,
  TrendingUp,
  FolderDot,
  Trash2
} from 'lucide-react';
import { Project, Task } from '../types';
import { calculateProjectStats, formatDate } from '../utils/storage';

interface ProjectSummaryBarProps {
  project: Project | undefined;
  tasks: Task[];
  onOpenNewTask: () => void;
  onEditProject?: () => void;
  onDeleteProject?: () => void;
}

export const ProjectSummaryBar: React.FC<ProjectSummaryBarProps> = ({
  project,
  tasks,
  onOpenNewTask,
  onEditProject,
  onDeleteProject,
}) => {
  if (!project) return null;

  const stats = calculateProjectStats(project.id, tasks);

  return (
    <div id="project-summary-bar" className="w-full bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs mb-6 space-y-4">
      {/* Top row: Project info and Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span 
              className="w-3.5 h-3.5 rounded-md shadow-2xs flex-shrink-0"
              style={{ backgroundColor: project.color }}
            />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {project.name}
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              {project.category}
            </span>
            {project.targetDate && (
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-indigo-500" />
                Target: {formatDate(project.targetDate)}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            {project.description}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap flex-shrink-0">
          {onDeleteProject && (
            <button
              id="delete-current-project-btn"
              onClick={onDeleteProject}
              className="px-3 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-red-700 hover:bg-red-50/80 border border-slate-200 hover:border-red-200 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
              title="Delete this project and all its associated tasks"
            >
              <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-red-600" />
              <span className="hidden xs:inline">Delete Project</span>
            </button>
          )}

          <button
            id="quick-add-task-btn"
            onClick={onOpenNewTask}
            className="px-4 py-2 text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-indigo-200" />
            + New Task & Milestones
          </button>
        </div>
      </div>

      {/* Metric Counters Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
        {/* Milestone Completion Rate */}
        <div className="p-3.5 rounded-xl bg-slate-900 text-white flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Milestone Progress
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-slate-800 px-1.5 py-0.5 rounded">
              {stats.milestonePercentage}%
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-xl font-bold tracking-tight text-white font-mono">
              {stats.completedMilestones} <span className="text-xs text-slate-400 font-sans font-normal">/ {stats.totalMilestones} done</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${stats.milestonePercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Pending Milestones */}
        <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-800">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Pending Milestones
            </span>
            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[11px] font-mono">
              Actionable
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-amber-950 font-mono">
              {stats.pendingMilestones}
            </div>
            <span className="text-[11px] text-amber-700 font-medium">
              Checkpoints pending across tasks
            </span>
          </div>
        </div>

        {/* Completed Milestones */}
        <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-800">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Completed Milestones
            </span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[11px] font-mono">
              Verified
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-emerald-950 font-mono">
              {stats.completedMilestones}
            </div>
            <span className="text-[11px] text-emerald-700 font-medium">
              Milestones finished & marked done
            </span>
          </div>
        </div>

        {/* Kanban Task Ratio */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              Tasks Distribution
            </span>
            <span className="text-[11px] font-mono font-medium text-slate-600">
              {stats.completedTasks}/{stats.totalTasks} Done
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <div className="flex-1 flex gap-1 h-2 rounded-full overflow-hidden bg-slate-200 p-0.5">
              <div 
                className="bg-slate-400 h-full rounded-sm" 
                title={`Backlog: ${stats.byStatus.backlog}`}
                style={{ width: `${stats.totalTasks ? (stats.byStatus.backlog / stats.totalTasks) * 100 : 25}%` }}
              />
              <div 
                className="bg-amber-500 h-full rounded-sm" 
                title={`In Progress: ${stats.byStatus.in_progress}`}
                style={{ width: `${stats.totalTasks ? (stats.byStatus.in_progress / stats.totalTasks) * 100 : 25}%` }}
              />
              <div 
                className="bg-indigo-500 h-full rounded-sm" 
                title={`In Review: ${stats.byStatus.in_review}`}
                style={{ width: `${stats.totalTasks ? (stats.byStatus.in_review / stats.totalTasks) * 100 : 25}%` }}
              />
              <div 
                className="bg-emerald-500 h-full rounded-sm" 
                title={`Done: ${stats.byStatus.done}`}
                style={{ width: `${stats.totalTasks ? (stats.byStatus.done / stats.totalTasks) * 100 : 25}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
