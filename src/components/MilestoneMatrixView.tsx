import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar, 
  ArrowUpRight, 
  ListTodo, 
  Tag, 
  Sparkles,
  Layers,
  Check
} from 'lucide-react';
import { Task, Project } from '../types';
import { calculateMilestoneStats, formatDate, isOverdue, triggerMilestoneCelebration } from '../utils/storage';

interface MilestoneMatrixViewProps {
  tasks: Task[];
  project: Project | undefined;
  onSelectTask: (task: Task) => void;
  onUpdateTask: (task: Task) => void;
}

export const MilestoneMatrixView: React.FC<MilestoneMatrixViewProps> = ({
  tasks,
  project,
  onSelectTask,
  onUpdateTask,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'pending' | 'completed' | 'by_task'>('by_task');

  const handleToggleMilestone = (task: Task, milestoneId: string) => {
    const updatedMilestones = (task.milestones || []).map((m) => {
      if (m.id === milestoneId) {
        const next = !m.completed;
        if (next) triggerMilestoneCelebration();
        return {
          ...m,
          completed: next,
          completedAt: next ? new Date().toISOString() : undefined,
        };
      }
      return m;
    });

    const stats = calculateMilestoneStats(updatedMilestones);
    let newStatus = task.status;
    if (stats.total > 0 && stats.completed === stats.total && task.status !== 'done') {
      newStatus = 'done';
    } else if (stats.completed < stats.total && task.status === 'done') {
      newStatus = 'in_progress';
    }

    onUpdateTask({
      ...task,
      milestones: updatedMilestones,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });
  };

  // Collect flat list of all milestones with their parent task context
  const allProjectMilestones = tasks.flatMap((t) =>
    (t.milestones || []).map((m) => ({
      ...m,
      parentTask: t,
    }))
  );

  const pendingMilestones = allProjectMilestones.filter((m) => !m.completed);
  const completedMilestones = allProjectMilestones.filter((m) => m.completed);

  return (
    <div id="milestone-matrix-view" className="w-full space-y-6">
      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveSubTab('by_task')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            activeSubTab === 'by_task'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
          }`}
        >
          Grouped by Task ({tasks.length})
        </button>
        <button
          onClick={() => setActiveSubTab('pending')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'pending'
              ? 'bg-amber-500 text-white shadow-2xs'
              : 'text-amber-800 hover:text-amber-900 bg-amber-50 border border-amber-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Pending Milestones Focus ({pendingMilestones.length})
        </button>
        <button
          onClick={() => setActiveSubTab('completed')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'completed'
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'text-emerald-800 hover:text-emerald-900 bg-emerald-50 border border-emerald-200'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Completed Log ({completedMilestones.length})
        </button>
      </div>

      {/* VIEW 1: GROUPED BY TASK */}
      {activeSubTab === 'by_task' && (
        <div className="space-y-4">
          {tasks.map((task) => {
            const stats = calculateMilestoneStats(task.milestones || []);
            return (
              <div
                key={task.id}
                id={`matrix-task-${task.id}`}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4"
              >
                {/* Task Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                        {task.status.replace('_', ' ')}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        task.priority === 'urgent' ? 'bg-rose-100 text-rose-800' :
                        task.priority === 'high' ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {task.priority} priority
                      </span>
                      {task.dueDate && (
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Due {formatDate(task.dueDate)}
                        </span>
                      )}
                    </div>
                    <h3 
                      onClick={() => onSelectTask(task)}
                      className="text-base font-bold text-slate-900 hover:text-indigo-600 cursor-pointer transition-colors"
                    >
                      {task.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-slate-800">
                        {stats.completed}/{stats.total} Milestones ({stats.percentage}%)
                      </div>
                      <div className="w-32 bg-slate-100 h-2 rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${stats.percentage}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectTask(task)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
                      title="Open task detail"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Milestones in this task */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {(task.milestones || []).map((milestone) => (
                    <div
                      key={milestone.id}
                      className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs transition-all ${
                        milestone.completed
                          ? 'bg-emerald-50/40 border-emerald-100 text-slate-600'
                          : 'bg-slate-50/70 border-slate-200 text-slate-800 hover:border-amber-300'
                      }`}
                    >
                      <button
                        onClick={() => handleToggleMilestone(task, milestone.id)}
                        className={`mt-0.5 flex-shrink-0 cursor-pointer transition-colors ${
                          milestone.completed ? 'text-emerald-600' : 'text-slate-400 hover:text-emerald-600'
                        }`}
                      >
                        {milestone.completed ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <span className={`font-semibold block ${milestone.completed ? 'line-through opacity-75' : 'text-slate-900'}`}>
                          {milestone.title}
                        </span>
                        {milestone.description && (
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                            {milestone.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          {milestone.completed && milestone.completedAt && (
                            <span className="text-[10px] text-emerald-700 font-medium">
                              Done {formatDate(milestone.completedAt)}
                            </span>
                          )}
                          {!milestone.completed && milestone.dueDate && (
                            <span className={`text-[10px] font-medium ${
                              isOverdue(milestone.dueDate) ? 'text-rose-600 font-semibold' : 'text-slate-500'
                            }`}>
                              Target: {formatDate(milestone.dueDate)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {(!task.milestones || task.milestones.length === 0) && (
                    <div className="col-span-2 text-center py-3 text-xs text-slate-400 italic">
                      No milestones registered. Click task to add milestones.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: PENDING MILESTONES FOCUS */}
      {activeSubTab === 'pending' && (
        <div className="space-y-3">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-amber-900">
                Actionable Pending Milestones ({pendingMilestones.length} checkpoints remaining)
              </h3>
              <p className="text-xs text-amber-700 mt-0.5">
                Every open sub-goal across all active project tasks. Check them off directly here.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {pendingMilestones.map((m) => (
              <div
                key={m.id}
                className="flex items-start justify-between gap-3 p-3.5 bg-white border border-slate-200 rounded-xl hover:border-amber-300 transition-all shadow-2xs"
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggleMilestone(m.parentTask, m.id)}
                    className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors"
                  >
                    <Circle className="w-5 h-5" />
                  </button>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{m.title}</h4>
                    {m.description && (
                      <p className="text-xs text-slate-600 mt-0.5">{m.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        Task: {m.parentTask.title}
                      </span>
                      {m.dueDate && (
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                          isOverdue(m.dueDate) ? 'bg-rose-50 text-rose-700 font-semibold' : 'bg-slate-100 text-slate-600'
                        }`}>
                          Due {formatDate(m.dueDate)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onSelectTask(m.parentTask)}
                  className="text-xs text-slate-500 hover:text-indigo-600 font-medium px-2 py-1 rounded hover:bg-slate-50 flex items-center gap-1 flex-shrink-0"
                >
                  <span>Open Task</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {pendingMilestones.length === 0 && (
              <div className="text-center py-10 bg-emerald-50 rounded-2xl border border-emerald-200">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                <h4 className="text-base font-bold text-emerald-900">All milestones completed!</h4>
                <p className="text-xs text-emerald-700 mt-1">
                  You have cleared all pending milestone checkpoints in this project.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: COMPLETED MILESTONES LOG */}
      {activeSubTab === 'completed' && (
        <div className="space-y-3">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <h3 className="text-sm font-bold text-emerald-900">
              Completed Milestones Timeline ({completedMilestones.length} milestones verified)
            </h3>
            <p className="text-xs text-emerald-700 mt-0.5">
              Historical record of all finished checkpoints and achievements.
            </p>
          </div>

          <div className="space-y-2">
            {completedMilestones.map((m) => (
              <div
                key={m.id}
                className="flex items-start justify-between gap-3 p-3.5 bg-emerald-50/20 border border-emerald-100 rounded-xl"
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggleMilestone(m.parentTask, m.id)}
                    className="mt-0.5 text-emerald-600 hover:text-slate-400 transition-colors"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 line-through opacity-80">{m.title}</h4>
                    {m.description && (
                      <p className="text-xs text-slate-500 mt-0.5 line-through opacity-70">{m.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        Task: {m.parentTask.title}
                      </span>
                      {m.completedAt && (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                          Completed {formatDate(m.completedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onSelectTask(m.parentTask)}
                  className="text-xs text-slate-500 hover:text-indigo-600 font-medium px-2 py-1 rounded hover:bg-white flex items-center gap-1 flex-shrink-0"
                >
                  <span>Open Task</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {completedMilestones.length === 0 && (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200">
                <Clock className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <h4 className="text-base font-bold text-slate-700">No completed milestones yet</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Complete milestones in your Kanban tasks to populate your timeline.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
