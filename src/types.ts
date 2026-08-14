export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type ColumnStatus = 'backlog' | 'in_progress' | 'in_review' | 'done';

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: string;
  dueDate?: string;
  order?: number;
}

export interface TaskLink {
  id: string;
  title: string;
  url: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: ColumnStatus;
  priority: Priority;
  tags: string[];
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  milestones: Milestone[];
  estimatedHours?: number;
  notes?: string;
  links?: TaskLink[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  category: string;
  createdAt: string;
  targetDate?: string;
}

export interface KanbanColumnDef {
  id: ColumnStatus;
  title: string;
  description: string;
  color: string;
  accent: string;
  badgeBg: string;
  badgeText: string;
}

export type SyncState = 'synced' | 'syncing' | 'offline' | 'error' | 'local_only';

export interface FirebaseCredentials {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

export interface SyncSettings {
  enabled: boolean;
  syncKey: string;
  provider: 'firebase' | 'cloud_key' | 'local';
  firebaseConfig?: FirebaseCredentials;
  deviceId: string;
  deviceName: string;
  lastSyncedAt?: string;
  autoSync: boolean;
}

export interface WorkspaceData {
  projects: Project[];
  tasks: Task[];
  activeProjectId?: string;
  version: number;
  updatedAt: string;
  deviceId?: string;
  deviceName?: string;
}

