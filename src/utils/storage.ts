import confetti from 'canvas-confetti';
import { Project, Task, Milestone } from '../types';
import { INITIAL_PROJECTS, INITIAL_TASKS } from '../data/initialData';

const PROJECTS_STORAGE_KEY = 'personal_project_tracker_projects_v1';
const TASKS_STORAGE_KEY = 'personal_project_tracker_tasks_v1';
const ACTIVE_PROJECT_KEY = 'personal_project_tracker_active_proj_v1';

export function getStoredProjects(): Project[] {
  try {
    const saved = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load projects from localStorage', err);
  }
  // Initialize default
  saveProjects(INITIAL_PROJECTS);
  return INITIAL_PROJECTS;
}

export function saveProjects(projects: Project[]): void {
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error('Failed to save projects to localStorage', err);
  }
}

export function getStoredTasks(): Task[] {
  try {
    const saved = localStorage.getItem(TASKS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load tasks from localStorage', err);
  }
  // Initialize default
  saveTasks(INITIAL_TASKS);
  return INITIAL_TASKS;
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save tasks to localStorage', err);
  }
}

export function getActiveProjectId(projects: Project[]): string {
  try {
    const saved = localStorage.getItem(ACTIVE_PROJECT_KEY);
    if (saved && projects.some(p => p.id === saved)) {
      return saved;
    }
  } catch (err) {
    console.error('Failed to read active project id', err);
  }
  return projects.length > 0 ? projects[0].id : '';
}

export function setActiveProjectId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_PROJECT_KEY, id);
  } catch (err) {
    console.error('Failed to set active project id', err);
  }
}

export function resetToDemoData(): { projects: Project[]; tasks: Task[] } {
  saveProjects(INITIAL_PROJECTS);
  saveTasks(INITIAL_TASKS);
  if (INITIAL_PROJECTS.length > 0) {
    setActiveProjectId(INITIAL_PROJECTS[0].id);
  }
  return { projects: INITIAL_PROJECTS, tasks: INITIAL_TASKS };
}

export function calculateMilestoneStats(milestones: Milestone[] = []) {
  const total = milestones.length;
  const completed = milestones.filter(m => m.completed).length;
  const pending = total - completed;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { total, completed, pending, percentage };
}

export function calculateProjectStats(projectId: string, tasks: Task[]) {
  const projectTasks = tasks.filter(t => t.projectId === projectId);
  const totalTasks = projectTasks.length;
  const completedTasks = projectTasks.filter(t => t.status === 'done').length;
  
  let totalMilestones = 0;
  let completedMilestones = 0;
  
  projectTasks.forEach(task => {
    if (task.milestones) {
      totalMilestones += task.milestones.length;
      completedMilestones += task.milestones.filter(m => m.completed).length;
    }
  });

  const pendingMilestones = totalMilestones - completedMilestones;
  const milestonePercentage = totalMilestones > 0 
    ? Math.round((completedMilestones / totalMilestones) * 100) 
    : (completedTasks === totalTasks && totalTasks > 0 ? 100 : 0);
  
  const taskPercentage = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 0;

  return {
    totalTasks,
    completedTasks,
    totalMilestones,
    completedMilestones,
    pendingMilestones,
    milestonePercentage,
    taskPercentage,
    byStatus: {
      backlog: projectTasks.filter(t => t.status === 'backlog').length,
      in_progress: projectTasks.filter(t => t.status === 'in_progress').length,
      in_review: projectTasks.filter(t => t.status === 'in_review').length,
      done: projectTasks.filter(t => t.status === 'done').length,
    }
  };
}

export function triggerMilestoneCelebration() {
  try {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#10b981', '#6366f1', '#0284c7', '#f59e0b', '#ec4899'],
      disableForReducedMotion: true,
    });
  } catch {
    // Ignore if canvas confetti not available
  }
}

export function triggerFullTaskCelebration() {
  try {
    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#10b981', '#34d399', '#6ee7b7', '#3b82f6', '#8b5cf6'],
      disableForReducedMotion: true,
    });
  } catch {
    // Ignore
  }
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

export function isOverdue(dateString?: string): boolean {
  if (!dateString) return false;
  try {
    const d = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d < today;
  } catch {
    return false;
  }
}
