/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AnimatePresence } from 'motion/react';
import { Navbar } from './components/Navbar';
import { ProjectSummaryBar } from './components/ProjectSummaryBar';
import { FilterBar } from './components/FilterBar';
import { KanbanBoard } from './components/KanbanBoard';
import { MilestoneMatrixView } from './components/MilestoneMatrixView';
import { TaskDetailModal } from './components/TaskDetailModal';
import { NewTaskModal } from './components/NewTaskModal';
import { NewProjectModal } from './components/NewProjectModal';
import { SyncSettingsModal } from './components/SyncSettingsModal';
import { VercelDeployGuideModal } from './components/VercelDeployGuideModal';
import { InstallAppModal } from './components/InstallAppModal';
import { DeleteProjectModal } from './components/DeleteProjectModal';
import { Task, Project, ColumnStatus, Priority, SyncState, WorkspaceData } from './types';
import { 
  getStoredProjects, 
  saveProjects, 
  getStoredTasks, 
  saveTasks, 
  getActiveProjectId, 
  setActiveProjectId, 
  resetToDemoData 
} from './utils/storage';
import { syncManager } from './utils/syncManager';

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjId] = useState<string>('');
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // Sync State
  const [syncState, setSyncState] = useState<SyncState>(syncManager.getSyncState());
  const [lastSyncedAt, setLastSyncedAt] = useState<string | undefined>(syncManager.getSettings().lastSyncedAt);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isDeployGuideOpen, setIsDeployGuideOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  // UI State
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [newTaskInitialStatus, setNewTaskInitialStatus] = useState<ColumnStatus>('backlog');
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isDeleteProjectOpen, setIsDeleteProjectOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'kanban' | 'milestones_matrix'>('kanban');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<Priority | 'all'>('all');
  const [selectedTag, setSelectedTag] = useState<string | 'all'>('all');
  const [pendingOnly, setPendingOnly] = useState(false);

  // PWA Install prompt listener
  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setDeferredInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsAppInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleTriggerInstall = async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const choiceResult = await deferredInstallPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsAppInstalled(true);
      }
      setDeferredInstallPrompt(null);
    } else {
      setIsInstallModalOpen(true);
    }
  };

  // Initialize data and sync manager on mount
  useEffect(() => {
    const initialProjects = getStoredProjects();
    const initialTasks = getStoredTasks();
    const activeId = getActiveProjectId(initialProjects);
    
    setProjects(initialProjects);
    setTasks(initialTasks);
    setActiveProjId(activeId);

    // Check for ?syncKey= in URL to join room
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlSyncKey = params.get('syncKey');
      if (urlSyncKey && urlSyncKey.trim() !== '') {
        syncManager.updateSettings({ syncKey: urlSyncKey.trim(), enabled: true });
        // Clean URL query param without full reload
        window.history.replaceState({}, '', window.location.pathname);
      }
    }

    // Initialize cloud & cross-device sync
    syncManager.init();

    // Listen to sync status changes
    const unsubStatus = syncManager.onSyncStateChange((state, lastSync) => {
      setSyncState(state);
      if (lastSync) setLastSyncedAt(lastSync);
    });

    // Listen to remote updates from other devices / tabs
    const unsubData = syncManager.onRemoteData((data: WorkspaceData) => {
      if (Array.isArray(data.projects)) {
        setProjects(data.projects);
      }
      if (Array.isArray(data.tasks)) {
        setTasks(data.tasks);
      }
      if (data.activeProjectId) {
        setActiveProjId(data.activeProjectId);
      }
    });

    return () => {
      unsubStatus();
      unsubData();
    };
  }, []);

  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === activeProjectId) || projects[0];
  }, [projects, activeProjectId]);

  // Extract all distinct tags for active project
  const availableTags = useMemo(() => {
    const projectTasks = tasks.filter((t) => t.projectId === activeProjectId);
    const tagsSet = new Set<string>();
    projectTasks.forEach((t) => {
      if (t.tags) t.tags.forEach((tag) => tagsSet.add(tag));
    });
    return Array.from(tagsSet);
  }, [tasks, activeProjectId]);

  // Filter tasks based on project and search/filter criteria
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (task.projectId !== activeProjectId) return false;

      // Search query check
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = task.description?.toLowerCase().includes(query) || false;
        const matchesTag = task.tags?.some((t) => t.toLowerCase().includes(query)) || false;
        const matchesMilestone = task.milestones?.some(
          (m) => m.title.toLowerCase().includes(query) || (m.description && m.description.toLowerCase().includes(query))
        ) || false;

        if (!matchesTitle && !matchesDesc && !matchesTag && !matchesMilestone) {
          return false;
        }
      }

      // Priority check
      if (selectedPriority !== 'all' && task.priority !== selectedPriority) {
        return false;
      }

      // Tag check
      if (selectedTag !== 'all' && (!task.tags || !task.tags.includes(selectedTag))) {
        return false;
      }

      // Pending Milestones Only
      if (pendingOnly) {
        const hasPending = task.milestones && task.milestones.some((m) => !m.completed);
        if (!hasPending) return false;
      }

      return true;
    });
  }, [tasks, activeProjectId, searchQuery, selectedPriority, selectedTag, pendingOnly]);

  // Keep selectedTask in sync with tasks list
  const currentSelectedTask = useMemo(() => {
    if (!selectedTask) return null;
    return tasks.find((t) => t.id === selectedTask.id) || null;
  }, [tasks, selectedTask]);

  // Actions
  const handleSelectProject = (projectId: string) => {
    setActiveProjId(projectId);
    setActiveProjectId(projectId);
    setSelectedTask(null);
    syncManager.pushChanges(projects, tasks, projectId);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    const updated = tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
    setTasks(updated);
    saveTasks(updated);
    syncManager.pushChanges(projects, updated, activeProjectId);
  };

  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    setTasks(updated);
    saveTasks(updated);
    setSelectedTask(null);
    syncManager.pushChanges(projects, updated, activeProjectId);
  };

  const handleMoveTask = (taskId: string, newStatus: ColumnStatus) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          status: newStatus,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });
    setTasks(updated);
    saveTasks(updated);
    syncManager.pushChanges(projects, updated, activeProjectId);
  };

  const handleSaveNewTask = (newTask: Task) => {
    const updated = [newTask, ...tasks];
    setTasks(updated);
    saveTasks(updated);
    syncManager.pushChanges(projects, updated, activeProjectId);
  };

  const handleSaveNewProject = (newProject: Project) => {
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    saveProjects(updatedProjects);
    handleSelectProject(newProject.id);
    syncManager.pushChanges(updatedProjects, tasks, newProject.id);
  };

  const handleDeleteProject = (projectIdToDelete: string) => {
    const remainingProjects = projects.filter((p) => p.id !== projectIdToDelete);
    const remainingTasks = tasks.filter((t) => t.projectId !== projectIdToDelete);

    let nextActiveId = '';

    if (remainingProjects.length > 0) {
      nextActiveId = remainingProjects[0].id;
      setProjects(remainingProjects);
      setTasks(remainingTasks);
      setActiveProjId(nextActiveId);
      saveProjects(remainingProjects);
      saveTasks(remainingTasks);
      setActiveProjectId(nextActiveId);
      syncManager.pushChanges(remainingProjects, remainingTasks, nextActiveId);
    } else {
      // Create a clean starter project if user deletes their only project
      const fallbackProject: Project = {
        id: `proj_${Date.now()}`,
        name: 'My Workspace',
        description: 'Default project workspace',
        color: '#4f46e5',
        icon: 'folder',
        category: 'General',
        createdAt: new Date().toISOString(),
      };
      nextActiveId = fallbackProject.id;
      const newProjects = [fallbackProject];
      setProjects(newProjects);
      setTasks(remainingTasks);
      setActiveProjId(nextActiveId);
      saveProjects(newProjects);
      saveTasks(remainingTasks);
      setActiveProjectId(nextActiveId);
      syncManager.pushChanges(newProjects, remainingTasks, nextActiveId);
    }

    setSelectedTask(null);
    setIsDeleteProjectOpen(false);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all projects and tasks to the sample demo data? Any custom tasks will be replaced.')) {
      const { projects: p, tasks: t } = resetToDemoData();
      setProjects(p);
      setTasks(t);
      if (p.length > 0) {
        setActiveProjId(p[0].id);
      }
      setSelectedTask(null);
      syncManager.pushChanges(p, t, p[0]?.id);
    }
  };

  const handleOpenAddTaskToColumn = (status: ColumnStatus) => {
    setNewTaskInitialStatus(status);
    setIsNewTaskOpen(true);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedPriority('all');
    setSelectedTag('all');
    setPendingOnly(false);
  };

  const handleDataRestoredFromBackup = () => {
    const p = getStoredProjects();
    const t = getStoredTasks();
    const a = getActiveProjectId(p);
    setProjects(p);
    setTasks(t);
    setActiveProjId(a);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navbar */}
      <Navbar
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={handleSelectProject}
        onOpenNewProject={() => setIsNewProjectOpen(true)}
        onResetData={handleResetData}
        onOpenNewTask={() => {
          setNewTaskInitialStatus('backlog');
          setIsNewTaskOpen(true);
        }}
        syncState={syncState}
        onOpenSyncSettings={() => setIsSyncModalOpen(true)}
        onOpenDeployGuide={() => setIsDeployGuideOpen(true)}
        onOpenInstallApp={handleTriggerInstall}
        isInstallable={Boolean(deferredInstallPrompt)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Project Summary Banner & Progress Cards */}
        <ProjectSummaryBar
          project={activeProject}
          tasks={tasks}
          onOpenNewTask={() => {
            setNewTaskInitialStatus('backlog');
            setIsNewTaskOpen(true);
          }}
          onDeleteProject={() => setIsDeleteProjectOpen(true)}
        />

        {/* Filter, Search & View Controls */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedPriority={selectedPriority}
          onPriorityChange={setSelectedPriority}
          selectedTag={selectedTag}
          onTagChange={setSelectedTag}
          availableTags={availableTags}
          pendingOnly={pendingOnly}
          onPendingOnlyChange={setPendingOnly}
          currentView={currentView}
          onViewChange={setCurrentView}
          onResetFilters={handleResetFilters}
        />

        {/* Active View: Kanban Board or Milestones Matrix */}
        {currentView === 'kanban' ? (
          <KanbanBoard
            tasks={filteredTasks}
            project={activeProject}
            onSelectTask={setSelectedTask}
            onMoveTask={handleMoveTask}
            onAddTaskToColumn={handleOpenAddTaskToColumn}
          />
        ) : (
          <MilestoneMatrixView
            tasks={filteredTasks}
            project={activeProject}
            onSelectTask={setSelectedTask}
            onUpdateTask={handleUpdateTask}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-slate-200 bg-white/50 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 gap-2">
        <p>Personal Project Tracker • Kanban workflow with detailed completed & pending milestone tracking</p>
        <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-500">
          <button
            onClick={() => setIsDeployGuideOpen(true)}
            className="hover:text-indigo-600 transition-colors"
          >
            Vercel Deployment Guide
          </button>
          <span>•</span>
          <button
            onClick={() => setIsSyncModalOpen(true)}
            className="hover:text-indigo-600 transition-colors"
          >
            Multi-Device Sync ({syncState})
          </button>
        </div>
      </footer>

      {/* Modals with Motion Animations */}
      <AnimatePresence>
        {currentSelectedTask && (
          <TaskDetailModal
            task={currentSelectedTask}
            project={activeProject}
            onClose={() => setSelectedTask(null)}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isNewTaskOpen && (
          <NewTaskModal
            isOpen={isNewTaskOpen}
            onClose={() => setIsNewTaskOpen(false)}
            projects={projects}
            activeProjectId={activeProjectId}
            initialStatus={newTaskInitialStatus}
            onSaveTask={handleSaveNewTask}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isNewProjectOpen && (
          <NewProjectModal
            isOpen={isNewProjectOpen}
            onClose={() => setIsNewProjectOpen(false)}
            onSaveProject={handleSaveNewProject}
          />
        )}
      </AnimatePresence>

      {/* Cloud & Multi-Device Sync Modal */}
      <AnimatePresence>
        {isSyncModalOpen && (
          <SyncSettingsModal
            isOpen={isSyncModalOpen}
            onClose={() => setIsSyncModalOpen(false)}
            syncState={syncState}
            lastSyncedAt={lastSyncedAt}
            onOpenDeployGuide={() => {
              setIsSyncModalOpen(false);
              setIsDeployGuideOpen(true);
            }}
            onDataRestored={handleDataRestoredFromBackup}
          />
        )}
      </AnimatePresence>

      {/* Vercel Hosting Guide Modal */}
      <AnimatePresence>
        {isDeployGuideOpen && (
          <VercelDeployGuideModal
            isOpen={isDeployGuideOpen}
            onClose={() => setIsDeployGuideOpen(false)}
            syncKey={syncManager.getSettings().syncKey}
          />
        )}
      </AnimatePresence>

      {/* PWA / Web App Installation Modal */}
      <AnimatePresence>
        {isInstallModalOpen && (
          <InstallAppModal
            isOpen={isInstallModalOpen}
            onClose={() => setIsInstallModalOpen(false)}
            onInstallClick={handleTriggerInstall}
            isInstallable={Boolean(deferredInstallPrompt)}
            isInstalled={isAppInstalled}
          />
        )}
      </AnimatePresence>

      {/* Delete Project Confirmation Modal */}
      <AnimatePresence>
        {isDeleteProjectOpen && (
          <DeleteProjectModal
            isOpen={isDeleteProjectOpen}
            onClose={() => setIsDeleteProjectOpen(false)}
            project={activeProject}
            tasks={tasks}
            onConfirmDelete={handleDeleteProject}
            isOnlyProject={projects.length <= 1}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

