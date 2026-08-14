import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  AlertTriangle, 
  Trash2, 
  X, 
  Layers, 
  CheckCircle2, 
  Calendar 
} from 'lucide-react';
import { Project, Task } from '../types';
import { calculateProjectStats } from '../utils/storage';

interface DeleteProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | undefined;
  tasks: Task[];
  onConfirmDelete: (projectId: string) => void;
  isOnlyProject: boolean;
}

export const DeleteProjectModal: React.FC<DeleteProjectModalProps> = ({
  isOpen,
  onClose,
  project,
  tasks,
  onConfirmDelete,
  isOnlyProject,
}) => {
  const [confirmText, setConfirmText] = useState('');

  if (!isOpen || !project) return null;

  const stats = calculateProjectStats(project.id, tasks);
  const projectTasks = tasks.filter((t) => t.projectId === project.id);

  const handleDelete = () => {
    onConfirmDelete(project.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-2xl border border-red-200 w-full max-w-md overflow-hidden text-slate-900"
      >
        {/* Warning Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-red-600 to-rose-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Delete Project?</h2>
              <p className="text-xs text-red-100">
                This action will delete all associated tasks
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-red-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content & Details */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-sm shrink-0"
                style={{ backgroundColor: project.color }}
              />
              <span className="font-bold text-slate-900 text-sm">{project.name}</span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-200/80 font-medium text-slate-700">
                {project.category}
              </span>
            </div>
            {project.description && (
              <p className="text-xs text-slate-600 line-clamp-2">
                {project.description}
              </p>
            )}
          </div>

          {/* Impact summary */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-red-50/70 border border-red-100 flex items-center gap-2 text-red-900">
              <Layers className="w-4 h-4 text-red-600 shrink-0" />
              <div>
                <span className="font-bold block">{projectTasks.length} Tasks</span>
                <span className="text-[10px] text-red-700">will be permanently deleted</span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-red-50/70 border border-red-100 flex items-center gap-2 text-red-900">
              <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
              <div>
                <span className="font-bold block">{stats.totalMilestones} Milestones</span>
                <span className="text-[10px] text-red-700">will be erased</span>
              </div>
            </div>
          </div>

          {isOnlyProject && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <span className="font-bold block">Note:</span>
              <span>This is your only project. Deleting it will create a fresh, clean starter workspace.</span>
            </div>
          )}

          <p className="text-xs text-slate-600 leading-relaxed">
            Are you sure you want to delete <strong className="text-slate-900">"{project.name}"</strong>? All tasks, Kanban cards, and milestone progress will be removed and synchronized across your paired devices.
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200/70 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            id="confirm-delete-project-btn"
            onClick={handleDelete}
            className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Project & All Tasks</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
