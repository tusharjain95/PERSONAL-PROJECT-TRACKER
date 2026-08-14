import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Plus, 
  Trash2, 
  Calendar, 
  Tag, 
  AlertCircle, 
  ExternalLink, 
  Sparkles, 
  Check, 
  Layers, 
  FileText, 
  Timer,
  ChevronRight,
  ListTodo,
  CheckCheck
} from 'lucide-react';
import { Task, Milestone, Priority, ColumnStatus, Project } from '../types';
import { 
  calculateMilestoneStats, 
  formatDate, 
  isOverdue, 
  triggerMilestoneCelebration, 
  triggerFullTaskCelebration 
} from '../utils/storage';

interface TaskDetailModalProps {
  task: Task | null;
  project: Project | undefined;
  onClose: () => void;
  onUpdateTask: (updatedTask: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  project,
  onClose,
  onUpdateTask,
  onDeleteTask,
}) => {
  if (!task) return null;

  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('all');
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDesc, setNewMilestoneDesc] = useState('');
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState('');
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState(task.notes || '');
  const [newTagInput, setNewTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [showAddLink, setShowAddLink] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const stats = calculateMilestoneStats(task.milestones || []);
  const pendingMilestones = (task.milestones || []).filter(m => !m.completed);
  const completedMilestones = (task.milestones || []).filter(m => m.completed);

  const handleToggleMilestone = (milestoneId: string) => {
    const updatedMilestones = (task.milestones || []).map(m => {
      if (m.id === milestoneId) {
        const nextState = !m.completed;
        if (nextState) {
          triggerMilestoneCelebration();
        }
        return {
          ...m,
          completed: nextState,
          completedAt: nextState ? new Date().toISOString() : undefined,
        };
      }
      return m;
    });

    const newStats = calculateMilestoneStats(updatedMilestones);
    let newStatus = task.status;
    
    // If all milestones just finished, offer/auto set to done
    if (newStats.total > 0 && newStats.completed === newStats.total && task.status !== 'done') {
      newStatus = 'done';
      triggerFullTaskCelebration();
    } else if (newStats.completed < newStats.total && task.status === 'done') {
      newStatus = 'in_progress';
    }

    onUpdateTask({
      ...task,
      milestones: updatedMilestones,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim()) return;

    const newMilestone: Milestone = {
      id: `ms-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: newMilestoneTitle.trim(),
      description: newMilestoneDesc.trim() || undefined,
      completed: false,
      dueDate: newMilestoneDueDate || undefined,
      order: (task.milestones || []).length + 1,
    };

    const updatedMilestones = [...(task.milestones || []), newMilestone];
    onUpdateTask({
      ...task,
      milestones: updatedMilestones,
      updatedAt: new Date().toISOString(),
    });

    setNewMilestoneTitle('');
    setNewMilestoneDesc('');
    setNewMilestoneDueDate('');
    setShowAddMilestone(false);
  };

  const handleDeleteMilestone = (milestoneId: string) => {
    const updatedMilestones = (task.milestones || []).filter(m => m.id !== milestoneId);
    onUpdateTask({
      ...task,
      milestones: updatedMilestones,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleStatusChange = (status: ColumnStatus) => {
    onUpdateTask({
      ...task,
      status,
      updatedAt: new Date().toISOString(),
    });
  };

  const handlePriorityChange = (priority: Priority) => {
    onUpdateTask({
      ...task,
      priority,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleSaveNotes = () => {
    onUpdateTask({
      ...task,
      notes: notesText,
      updatedAt: new Date().toISOString(),
    });
    setEditingNotes(false);
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const tag = newTagInput.trim();
    if (tag && !task.tags.includes(tag)) {
      onUpdateTask({
        ...task,
        tags: [...task.tags, tag],
        updatedAt: new Date().toISOString(),
      });
      setNewTagInput('');
      setShowTagInput(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdateTask({
      ...task,
      tags: task.tags.filter(t => t !== tagToRemove),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) return;
    let url = newLinkUrl.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    const newLink = {
      id: `link-${Date.now()}`,
      title: newLinkTitle.trim(),
      url,
    };
    onUpdateTask({
      ...task,
      links: [...(task.links || []), newLink],
      updatedAt: new Date().toISOString(),
    });
    setNewLinkTitle('');
    setNewLinkUrl('');
    setShowAddLink(false);
  };

  const handleRemoveLink = (linkId: string) => {
    onUpdateTask({
      ...task,
      links: (task.links || []).filter(l => l.id !== linkId),
      updatedAt: new Date().toISOString(),
    });
  };

  const priorityStyles: Record<Priority, { label: string; bg: string; text: string; dot: string }> = {
    low: { label: 'Low Priority', bg: 'bg-slate-100 border-slate-200', text: 'text-slate-700', dot: 'bg-slate-400' },
    medium: { label: 'Medium Priority', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' },
    high: { label: 'High Priority', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
    urgent: { label: 'Urgent Priority', bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500' },
  };

  const statusLabels: Record<ColumnStatus, { label: string; bg: string; text: string }> = {
    backlog: { label: 'Backlog', bg: 'bg-slate-100', text: 'text-slate-700' },
    in_progress: { label: 'In Progress', bg: 'bg-amber-100', text: 'text-amber-800' },
    in_review: { label: 'In Review', bg: 'bg-indigo-100', text: 'text-indigo-800' },
    done: { label: 'Completed', bg: 'bg-emerald-100', text: 'text-emerald-800' },
  };

  return (
    <div 
      id="task-detail-modal-overlay" 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        id="task-detail-modal-container"
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="space-y-1.5 max-w-[85%]">
            <div className="flex flex-wrap items-center gap-2">
              {project && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs">
                  <span 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: project.color }} 
                  />
                  {project.name}
                </span>
              )}

              {/* Status Selector Pill */}
              <div className="relative inline-block">
                <select
                  id="task-status-select"
                  value={task.status}
                  onChange={(e) => handleStatusChange(e.target.value as ColumnStatus)}
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400 ${statusLabels[task.status].bg} ${statusLabels[task.status].text} border-transparent hover:border-slate-300`}
                >
                  <option value="backlog">Backlog</option>
                  <option value="in_progress">In Progress</option>
                  <option value="in_review">In Review / QA</option>
                  <option value="done">Completed</option>
                </select>
              </div>

              {/* Priority Selector */}
              <div className="relative inline-block">
                <select
                  id="task-priority-select"
                  value={task.priority}
                  onChange={(e) => handlePriorityChange(e.target.value as Priority)}
                  className={`text-xs font-medium px-2.5 py-0.5 rounded-md border cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400 ${priorityStyles[task.priority].bg} ${priorityStyles[task.priority].text}`}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent Priority</option>
                </select>
              </div>

              {task.dueDate && (
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md border ${
                  isOverdue(task.dueDate) && task.status !== 'done'
                    ? 'bg-rose-50 text-rose-700 border-rose-200' 
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  <Calendar className="w-3 h-3" />
                  Due {formatDate(task.dueDate)}
                </span>
              )}
            </div>

            <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-snug">
              {task.title}
            </h2>
          </div>

          <button
            id="close-task-detail-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Close modal (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body with Two Columns */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          
          {/* Main Column: Milestone Breakdown & Drill-Down (7 cols) */}
          <div className="lg:col-span-7 p-6 space-y-6">
            
            {/* Milestones Progress Card */}
            <div id="milestone-status-summary-card" className="p-4 rounded-xl bg-slate-900 text-white shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-semibold tracking-wide uppercase text-slate-300">
                    Milestone Progress Drill-Down
                  </span>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-300 border border-slate-700">
                  {stats.percentage}% COMPLETE
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${stats.percentage}%` }}
                />
              </div>

              {/* Exact Milestone Count Indicators */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-center">
                  <span className="block text-lg font-bold text-white leading-tight">
                    {stats.total}
                  </span>
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">
                    Total
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-950/50 border border-emerald-800/40 text-center">
                  <span className="block text-lg font-bold text-emerald-400 leading-tight">
                    {stats.completed}
                  </span>
                  <span className="text-[11px] text-emerald-300 uppercase tracking-wider font-medium">
                    Completed
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/40 text-center">
                  <span className="block text-lg font-bold text-amber-400 leading-tight">
                    {stats.pending}
                  </span>
                  <span className="text-[11px] text-amber-300 uppercase tracking-wider font-medium">
                    Pending
                  </span>
                </div>
              </div>
            </div>

            {/* Milestone List Controls & Filter Tabs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                  <button
                    id="filter-all-milestones"
                    onClick={() => setActiveTab('all')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                      activeTab === 'all'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All ({stats.total})
                  </button>
                  <button
                    id="filter-pending-milestones"
                    onClick={() => setActiveTab('pending')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 ${
                      activeTab === 'pending'
                        ? 'bg-amber-500 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    Pending ({stats.pending})
                  </button>
                  <button
                    id="filter-completed-milestones"
                    onClick={() => setActiveTab('completed')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 ${
                      activeTab === 'completed'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Completed ({stats.completed})
                  </button>
                </div>

                <button
                  id="toggle-add-milestone-btn"
                  onClick={() => setShowAddMilestone(!showAddMilestone)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Milestone
                </button>
              </div>

              {/* Add Milestone Inline Form */}
              <AnimatePresence>
                {showAddMilestone && (
                  <motion.form
                    id="add-milestone-form"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleAddMilestone}
                    className="p-3.5 rounded-xl border border-slate-300 bg-slate-50 space-y-2.5 overflow-hidden"
                  >
                    <div className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                      <ListTodo className="w-3.5 h-3.5 text-indigo-600" />
                      Create New Milestone for this Task
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Milestone title (e.g., Setup API Gateway routes)"
                        value={newMilestoneTitle}
                        onChange={(e) => setNewMilestoneTitle(e.target.value)}
                        className="w-full text-sm px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium"
                        autoFocus
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Short description/acceptance note (optional)"
                        value={newMilestoneDesc}
                        onChange={(e) => setNewMilestoneDesc(e.target.value)}
                        className="text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="date"
                        value={newMilestoneDueDate}
                        onChange={(e) => setNewMilestoneDueDate(e.target.value)}
                        className="text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
                      />
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddMilestone(false)}
                        className="px-3 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-md"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!newMilestoneTitle.trim()}
                        className="px-3.5 py-1 text-xs font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-2xs"
                      >
                        Save Milestone
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Exact Milestone List Item Breakdown */}
              <div className="space-y-2.5 pt-1">
                {stats.total === 0 ? (
                  <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/50">
                    <ListTodo className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No milestones yet</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Add milestones to break down this task into exact completed and pending checkpoints.
                    </p>
                    <button
                      onClick={() => setShowAddMilestone(true)}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg border border-indigo-200 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add First Milestone
                    </button>
                  </div>
                ) : (
                  <>
                    {/* SECTION: PENDING MILESTONES (if tab is all or pending) */}
                    {(activeTab === 'all' || activeTab === 'pending') && (
                      <div className="space-y-2">
                        {activeTab === 'all' && pendingMilestones.length > 0 && (
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                              Pending Milestones ({pendingMilestones.length})
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium">
                              Click circle to mark complete
                            </span>
                          </div>
                        )}

                        {pendingMilestones.map((milestone) => (
                          <div
                            key={milestone.id}
                            id={`milestone-item-${milestone.id}`}
                            className="group relative flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:border-amber-300 hover:shadow-xs transition-all"
                          >
                            <button
                              onClick={() => handleToggleMilestone(milestone.id)}
                              className="mt-0.5 flex-shrink-0 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                              title="Mark as completed"
                            >
                              <Circle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </button>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                                  {milestone.title}
                                </h4>
                                {milestone.dueDate && (
                                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded flex items-center gap-1 flex-shrink-0 ${
                                    isOverdue(milestone.dueDate)
                                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}>
                                    <Calendar className="w-3 h-3" />
                                    {formatDate(milestone.dueDate)}
                                  </span>
                                )}
                              </div>

                              {milestone.description && (
                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                  {milestone.description}
                                </p>
                              )}

                              <div className="flex items-center gap-2 mt-2">
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                                  Pending Action
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleDeleteMilestone(milestone.id)}
                              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 rounded transition-opacity"
                              title="Delete milestone"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}

                        {activeTab === 'pending' && pendingMilestones.length === 0 && (
                          <div className="text-center py-6 px-4 rounded-xl bg-emerald-50/50 border border-emerald-200 text-emerald-800">
                            <CheckCheck className="w-6 h-6 mx-auto mb-1 text-emerald-600" />
                            <p className="text-xs font-semibold">All milestones completed!</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* SECTION: COMPLETED MILESTONES (if tab is all or completed) */}
                    {(activeTab === 'all' || activeTab === 'completed') && (
                      <div className="space-y-2 pt-2">
                        {activeTab === 'all' && completedMilestones.length > 0 && (
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                              Completed Milestones ({completedMilestones.length})
                            </span>
                            <span className="text-[11px] text-emerald-600 font-medium">
                              Verified
                            </span>
                          </div>
                        )}

                        {completedMilestones.map((milestone) => (
                          <div
                            key={milestone.id}
                            id={`milestone-item-${milestone.id}`}
                            className="group relative flex items-start gap-3 p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/30 hover:border-emerald-200 transition-all"
                          >
                            <button
                              onClick={() => handleToggleMilestone(milestone.id)}
                              className="mt-0.5 flex-shrink-0 text-emerald-600 hover:text-slate-400 transition-colors cursor-pointer"
                              title="Click to revert to pending"
                            >
                              <CheckCircle2 className="w-5 h-5" />
                            </button>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="text-sm font-semibold text-slate-800 line-through opacity-80 leading-snug">
                                  {milestone.title}
                                </h4>
                                {milestone.completedAt && (
                                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded flex items-center gap-1 flex-shrink-0">
                                    <Check className="w-3 h-3" />
                                    Done {formatDate(milestone.completedAt)}
                                  </span>
                                )}
                              </div>

                              {milestone.description && (
                                <p className="text-xs text-slate-500 mt-1 line-through opacity-75">
                                  {milestone.description}
                                </p>
                              )}
                            </div>

                            <button
                              onClick={() => handleDeleteMilestone(milestone.id)}
                              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 rounded transition-opacity"
                              title="Delete milestone"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}

                        {activeTab === 'completed' && completedMilestones.length === 0 && (
                          <div className="text-center py-6 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
                            <Clock className="w-6 h-6 mx-auto mb-1 text-slate-400" />
                            <p className="text-xs font-semibold">No completed milestones yet</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Check off items from the pending list as you finish them.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Task Context, Notes, Tags, and Resources (5 cols) */}
          <div className="lg:col-span-5 p-6 bg-slate-50/60 space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              
              {/* Task Description */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  Task Overview
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-sm text-slate-700 leading-relaxed shadow-2xs">
                  {task.description || <span className="text-slate-400 italic">No description provided.</span>}
                </div>
              </div>

              {/* Tags Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                    <Tag className="w-3.5 h-3.5 text-slate-500" />
                    Labels & Categories
                  </div>
                  <button
                    onClick={() => setShowTagInput(!showTagInput)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                  >
                    + Add Tag
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {task.tags && task.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-2xs"
                    >
                      #{tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="text-slate-400 hover:text-rose-600 ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}

                  {task.tags.length === 0 && !showTagInput && (
                    <span className="text-xs text-slate-400 italic">No tags added</span>
                  )}
                </div>

                {showTagInput && (
                  <form onSubmit={handleAddTag} className="flex gap-1.5 pt-1">
                    <input
                      type="text"
                      placeholder="Tag name"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      className="text-xs px-2.5 py-1 bg-white border border-slate-300 rounded-md flex-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={!newTagInput.trim()}
                      className="px-2.5 py-1 text-xs bg-slate-900 text-white rounded-md font-medium hover:bg-slate-800"
                    >
                      Add
                    </button>
                  </form>
                )}
              </div>

              {/* Time Estimate & Metadata */}
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="font-medium flex items-center gap-1.5">
                    <Timer className="w-3.5 h-3.5 text-slate-400" />
                    Estimated Effort:
                  </span>
                  <span className="font-semibold text-slate-900">
                    {task.estimatedHours ? `${task.estimatedHours} hours` : 'Not specified'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="font-medium flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Created On:
                  </span>
                  <span className="font-semibold text-slate-800">
                    {formatDate(task.createdAt)}
                  </span>
                </div>
                {task.updatedAt && (
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="font-medium flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Last Activity:
                    </span>
                    <span className="font-semibold text-slate-800">
                      {formatDate(task.updatedAt)}
                    </span>
                  </div>
                )}
              </div>

              {/* Task Notes / Scratchpad */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    Technical Notes & Log
                  </span>
                  {!editingNotes ? (
                    <button
                      onClick={() => setEditingNotes(true)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                    >
                      Edit Notes
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setNotesText(task.notes || '');
                          setEditingNotes(false);
                        }}
                        className="text-xs text-slate-500 hover:text-slate-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveNotes}
                        className="text-xs text-emerald-600 font-semibold hover:text-emerald-700"
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>

                {editingNotes ? (
                  <textarea
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    rows={4}
                    placeholder="Add implementation notes, terminal commands, configuration snippets..."
                    className="w-full text-xs p-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-slate-800"
                  />
                ) : (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 font-mono whitespace-pre-wrap min-h-[60px] shadow-2xs">
                    {task.notes || <span className="text-slate-400 italic">No notes recorded yet.</span>}
                  </div>
                )}
              </div>

              {/* Reference Links */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                    Reference Links
                  </span>
                  <button
                    onClick={() => setShowAddLink(!showAddLink)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                  >
                    + Add Link
                  </button>
                </div>

                <div className="space-y-1.5">
                  {task.links && task.links.map((link) => (
                    <div
                      key={link.id}
                      className="group flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs hover:border-indigo-200 transition-colors shadow-2xs"
                    >
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1.5 truncate max-w-[80%]"
                      >
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{link.title}</span>
                      </a>
                      <button
                        onClick={() => handleRemoveLink(link.id)}
                        className="text-slate-400 hover:text-rose-600 p-0.5"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {(!task.links || task.links.length === 0) && !showAddLink && (
                    <span className="text-xs text-slate-400 italic block">No links attached</span>
                  )}

                  {showAddLink && (
                    <form onSubmit={handleAddLink} className="p-2.5 bg-white border border-slate-300 rounded-lg space-y-2">
                      <input
                        type="text"
                        placeholder="Link Label (e.g. GitHub PR, Spec)"
                        value={newLinkTitle}
                        onChange={(e) => setNewLinkTitle(e.target.value)}
                        className="w-full text-xs px-2.5 py-1 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        autoFocus
                      />
                      <input
                        type="text"
                        placeholder="URL (https://...)"
                        value={newLinkUrl}
                        onChange={(e) => setNewLinkUrl(e.target.value)}
                        className="w-full text-xs px-2.5 py-1 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setShowAddLink(false)}
                          className="px-2 py-0.5 text-xs text-slate-500 hover:text-slate-700"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={!newLinkTitle.trim() || !newLinkUrl.trim()}
                          className="px-2.5 py-0.5 text-xs bg-slate-900 text-white rounded font-medium disabled:opacity-50"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>

            </div>

            {/* Bottom Actions: Delete Task */}
            <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between">
              {confirmDelete ? (
                <div className="flex items-center gap-2 w-full justify-between bg-rose-50 p-2 rounded-lg border border-rose-200">
                  <span className="text-xs font-semibold text-rose-800">
                    Delete this task & milestones?
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="px-2.5 py-1 text-xs font-bold bg-rose-600 text-white rounded hover:bg-rose-700"
                    >
                      Yes, Delete
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    id="delete-task-btn"
                    onClick={() => setConfirmDelete(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Task
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-2xs"
                  >
                    Done
                  </button>
                </>
              )}
            </div>

          </div>

        </div>
      </motion.div>
    </div>
  );
};
