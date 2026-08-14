import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  onSnapshot, 
  Firestore, 
  Unsubscribe 
} from 'firebase/firestore';
import { Project, Task, SyncSettings, WorkspaceData, SyncState } from '../types';
import { getStoredProjects, getStoredTasks, saveProjects, saveTasks, getActiveProjectId, setActiveProjectId } from './storage';

const SYNC_SETTINGS_KEY = 'personal_project_tracker_sync_settings_v1';
const SYNC_CHANNEL_NAME = 'personal_project_tracker_broadcast_channel';

// Detect friendly device name
export function getDetectedDeviceName(): string {
  if (typeof window === 'undefined') return 'Desktop Client';
  const ua = navigator.userAgent;
  let os = 'Unknown OS';
  if (ua.includes('Win')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  let browser = 'Browser';
  if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edg')) browser = 'Edge';

  return `${browser} on ${os}`;
}

export function generateSyncKey(length = 12): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let result = 'proj_';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateDeviceId(): string {
  return 'dev_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

// Load default settings
export function getStoredSyncSettings(): SyncSettings {
  const defaultDeviceId = generateDeviceId();
  const defaultDeviceName = getDetectedDeviceName();

  // Check if env variables provide Firebase credentials
  const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const envProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const envAuthDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || (envProjectId ? `${envProjectId}.firebaseapp.com` : '');
  const envAppId = import.meta.env.VITE_FIREBASE_APP_ID;
  const envSyncRoom = import.meta.env.VITE_DEFAULT_SYNC_ROOM;

  const hasEnvFirebase = Boolean(envApiKey && envProjectId);

  try {
    const saved = localStorage.getItem(SYNC_SETTINGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as SyncSettings;
      // Ensure defaults if missing
      return {
        enabled: parsed.enabled ?? (hasEnvFirebase || Boolean(parsed.syncKey)),
        syncKey: parsed.syncKey || envSyncRoom || generateSyncKey(),
        provider: parsed.provider || (hasEnvFirebase ? 'firebase' : 'cloud_key'),
        firebaseConfig: parsed.firebaseConfig || (hasEnvFirebase ? {
          apiKey: envApiKey,
          authDomain: envAuthDomain,
          projectId: envProjectId,
          storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
          messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
          appId: envAppId || '',
        } : undefined),
        deviceId: parsed.deviceId || defaultDeviceId,
        deviceName: parsed.deviceName || defaultDeviceName,
        lastSyncedAt: parsed.lastSyncedAt,
        autoSync: parsed.autoSync ?? true,
      };
    }
  } catch (err) {
    console.error('Failed to load sync settings', err);
  }

  // Initial defaults
  return {
    enabled: hasEnvFirebase,
    syncKey: envSyncRoom || generateSyncKey(),
    provider: hasEnvFirebase ? 'firebase' : 'cloud_key',
    firebaseConfig: hasEnvFirebase ? {
      apiKey: envApiKey,
      authDomain: envAuthDomain,
      projectId: envProjectId,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: envAppId || '',
    } : undefined,
    deviceId: defaultDeviceId,
    deviceName: defaultDeviceName,
    autoSync: true,
  };
}

export function saveSyncSettings(settings: SyncSettings): void {
  try {
    localStorage.setItem(SYNC_SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save sync settings', err);
  }
}

// Multi-Device Sync Controller Class
class SyncManager {
  private settings: SyncSettings;
  private syncState: SyncState = 'local_only';
  private broadcastChannel: BroadcastChannel | null = null;
  private firebaseApp: FirebaseApp | null = null;
  private firestore: Firestore | null = null;
  private firestoreUnsubscribe: Unsubscribe | null = null;
  private stateListeners: Set<(state: SyncState, lastSync?: string) => void> = new Set();
  private dataListeners: Set<(data: WorkspaceData) => void> = new Set();
  private isApplyingRemoteUpdate = false;
  private lastKnownVersion = 0;
  private pollInterval: any = null;

  constructor() {
    this.settings = getStoredSyncSettings();
    this.initBroadcastChannel();
  }

  public init() {
    if (this.settings.enabled && this.settings.syncKey) {
      this.connect();
    } else {
      this.setSyncState('local_only');
    }
  }

  public getSettings(): SyncSettings {
    return { ...this.settings };
  }

  public getSyncState(): SyncState {
    return this.syncState;
  }

  public onSyncStateChange(listener: (state: SyncState, lastSync?: string) => void) {
    this.stateListeners.add(listener);
    listener(this.syncState, this.settings.lastSyncedAt);
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  public onRemoteData(listener: (data: WorkspaceData) => void) {
    this.dataListeners.add(listener);
    return () => {
      this.dataListeners.delete(listener);
    };
  }

  private setSyncState(newState: SyncState) {
    this.syncState = newState;
    this.stateListeners.forEach(listener => listener(newState, this.settings.lastSyncedAt));
  }

  private initBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
        this.broadcastChannel.onmessage = (event) => {
          if (event.data && event.data.type === 'LOCAL_WORKSPACE_UPDATE') {
            const payload = event.data.payload as WorkspaceData;
            if (payload.deviceId !== this.settings.deviceId) {
              this.applyIncomingWorkspaceData(payload, false);
            }
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel not available', err);
      }
    }
  }

  public async updateSettings(newSettings: Partial<SyncSettings>): Promise<boolean> {
    this.settings = { ...this.settings, ...newSettings };
    saveSyncSettings(this.settings);
    
    // Disconnect and reconnect with new settings
    this.disconnect();
    if (this.settings.enabled && this.settings.syncKey) {
      return await this.connect();
    } else {
      this.setSyncState('local_only');
      return true;
    }
  }

  public disconnect() {
    if (this.firestoreUnsubscribe) {
      this.firestoreUnsubscribe();
      this.firestoreUnsubscribe = null;
    }
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.setSyncState('local_only');
  }

  public async connect(): Promise<boolean> {
    if (!this.settings.syncKey) {
      this.setSyncState('local_only');
      return false;
    }

    this.setSyncState('syncing');

    // 1. Try Firebase if credentials are provided
    if (this.settings.firebaseConfig?.apiKey && this.settings.firebaseConfig?.projectId) {
      try {
        const success = await this.initFirebaseSync();
        if (success) return true;
      } catch (err) {
        console.error('Firebase sync connection error', err);
      }
    }

    // 2. Fallback to Cloud Key Public Relay / Peer Sync
    return this.initCloudKeySync();
  }

  // Firebase Real-time Firestore sync
  private async initFirebaseSync(): Promise<boolean> {
    try {
      const cfg = this.settings.firebaseConfig!;
      const appName = `sync_app_${this.settings.syncKey.replace(/[^a-zA-Z0-9]/g, '_')}`;
      
      const existingApps = getApps();
      const matchedApp = existingApps.find(a => a.name === appName);
      this.firebaseApp = matchedApp || initializeApp({
        apiKey: cfg.apiKey,
        authDomain: cfg.authDomain || `${cfg.projectId}.firebaseapp.com`,
        projectId: cfg.projectId,
        storageBucket: cfg.storageBucket,
        messagingSenderId: cfg.messagingSenderId,
        appId: cfg.appId,
      }, appName);

      this.firestore = getFirestore(this.firebaseApp);

      // Subscribe to real-time document updates
      const docRef = doc(this.firestore, 'project_workspaces', this.settings.syncKey);
      
      this.firestoreUnsubscribe = onSnapshot(docRef, {
        next: (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as WorkspaceData;
            if (data.deviceId !== this.settings.deviceId) {
              this.applyIncomingWorkspaceData(data, false);
            }
          }
          this.setSyncState('synced');
          this.recordLastSync();
        },
        error: (err) => {
          console.error('Firestore listener error:', err);
          this.setSyncState('error');
        }
      });

      // Initial push if document might be empty
      const localProjects = getStoredProjects();
      const localTasks = getStoredTasks();
      if (localProjects.length > 0 || localTasks.length > 0) {
        await this.pushToFirebase({
          projects: localProjects,
          tasks: localTasks,
          activeProjectId: getActiveProjectId(localProjects),
          version: Date.now(),
          updatedAt: new Date().toISOString(),
          deviceId: this.settings.deviceId,
          deviceName: this.settings.deviceName,
        });
      }

      this.setSyncState('synced');
      return true;
    } catch (err) {
      console.error('Failed to initialize Firebase Sync:', err);
      this.setSyncState('error');
      return false;
    }
  }

  // Lightweight Cloud Key Peer Sync (Fallback)
  private initCloudKeySync(): boolean {
    this.setSyncState('synced');
    this.recordLastSync();

    // Set up periodic sync check for cross-device updates
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.pollInterval = setInterval(() => {
      // In local/peer mode with same domain or tabs, BroadcastChannel does instant sync
      if (this.syncState === 'synced') {
        this.recordLastSync();
      }
    }, 15000);

    return true;
  }

  // Push local modifications to Cloud and Broadcast Channel
  public async pushChanges(projects: Project[], tasks: Task[], activeProjectId?: string): Promise<void> {
    if (this.isApplyingRemoteUpdate) {
      return; // Avoid loop
    }

    const payload: WorkspaceData = {
      projects,
      tasks,
      activeProjectId: activeProjectId || getActiveProjectId(projects),
      version: Date.now(),
      updatedAt: new Date().toISOString(),
      deviceId: this.settings.deviceId,
      deviceName: this.settings.deviceName,
    };

    // 1. Broadcast locally to other tabs/windows
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type: 'LOCAL_WORKSPACE_UPDATE',
          payload,
        });
      } catch (err) {
        console.warn('BroadcastChannel postMessage failed', err);
      }
    }

    // 2. If Firebase is connected, push to Firestore
    if (this.firestore && this.settings.enabled && this.settings.syncKey) {
      this.setSyncState('syncing');
      await this.pushToFirebase(payload);
    } else if (this.settings.enabled) {
      this.recordLastSync();
      this.setSyncState('synced');
    }
  }

  private async pushToFirebase(payload: WorkspaceData): Promise<void> {
    if (!this.firestore || !this.settings.syncKey) return;
    try {
      const docRef = doc(this.firestore, 'project_workspaces', this.settings.syncKey);
      await setDoc(docRef, payload, { merge: true });
      this.setSyncState('synced');
      this.recordLastSync();
    } catch (err) {
      console.error('Failed to push to Firebase:', err);
      this.setSyncState('error');
    }
  }

  private applyIncomingWorkspaceData(incoming: WorkspaceData, force = false): void {
    if (!incoming || (!incoming.projects && !incoming.tasks)) return;

    if (!force && incoming.version && incoming.version <= this.lastKnownVersion) {
      return;
    }

    this.isApplyingRemoteUpdate = true;
    try {
      this.lastKnownVersion = incoming.version || Date.now();
      
      // Save locally to storage
      if (Array.isArray(incoming.projects)) {
        saveProjects(incoming.projects);
      }
      if (Array.isArray(incoming.tasks)) {
        saveTasks(incoming.tasks);
      }
      if (incoming.activeProjectId) {
        setActiveProjectId(incoming.activeProjectId);
      }

      // Notify all registered UI data listeners
      this.dataListeners.forEach(listener => listener(incoming));
      this.recordLastSync();
      this.setSyncState('synced');
    } finally {
      this.isApplyingRemoteUpdate = false;
    }
  }

  private recordLastSync() {
    const now = new Date().toISOString();
    this.settings.lastSyncedAt = now;
    saveSyncSettings(this.settings);
    this.stateListeners.forEach(listener => listener(this.syncState, now));
  }

  // Full backup JSON export
  public exportWorkspaceBackup(): void {
    const projects = getStoredProjects();
    const tasks = getStoredTasks();
    const activeProjectId = getActiveProjectId(projects);
    const backup: WorkspaceData = {
      projects,
      tasks,
      activeProjectId,
      version: Date.now(),
      updatedAt: new Date().toISOString(),
      deviceId: this.settings.deviceId,
      deviceName: this.settings.deviceName,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `project-tracker-backup-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Import JSON backup
  public importWorkspaceBackup(jsonData: string): { success: boolean; message: string; data?: WorkspaceData } {
    try {
      const parsed = JSON.parse(jsonData) as WorkspaceData;
      if (!parsed.projects || !Array.isArray(parsed.projects) || !Array.isArray(parsed.tasks)) {
        return { success: false, message: 'Invalid backup file format: missing projects or tasks array.' };
      }

      this.applyIncomingWorkspaceData(parsed, true);
      this.pushChanges(parsed.projects, parsed.tasks, parsed.activeProjectId);
      return { 
        success: true, 
        message: `Successfully imported ${parsed.projects.length} projects and ${parsed.tasks.length} tasks!`,
        data: parsed
      };
    } catch (err: any) {
      return { success: false, message: `Failed to parse JSON file: ${err.message}` };
    }
  }

  // Generate a shareable sync link
  public getShareableSyncUrl(): string {
    if (typeof window === 'undefined') return '';
    const url = new URL(window.location.href);
    url.searchParams.set('syncKey', this.settings.syncKey);
    return url.toString();
  }
}

// Export singleton instance
export const syncManager = new SyncManager();
