import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Cloud, 
  CloudCheck, 
  RefreshCw, 
  Copy, 
  Check, 
  Download, 
  Upload, 
  Laptop, 
  Smartphone, 
  HelpCircle, 
  Key, 
  ShieldCheck, 
  AlertCircle, 
  Flame, 
  Globe, 
  Link2,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { SyncSettings, SyncState, WorkspaceData } from '../types';
import { syncManager, generateSyncKey } from '../utils/syncManager';

interface SyncSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncState: SyncState;
  lastSyncedAt?: string;
  onOpenDeployGuide: () => void;
  onDataRestored?: () => void;
}

export const SyncSettingsModal: React.FC<SyncSettingsModalProps> = ({
  isOpen,
  onClose,
  syncState,
  lastSyncedAt,
  onOpenDeployGuide,
  onDataRestored,
}) => {
  const currentSettings = syncManager.getSettings();
  
  const [syncKey, setSyncKey] = useState(currentSettings.syncKey || '');
  const [deviceName, setDeviceName] = useState(currentSettings.deviceName || '');
  const [provider, setProvider] = useState<'cloud_key' | 'firebase'>(
    currentSettings.provider === 'firebase' ? 'firebase' : 'cloud_key'
  );
  
  // Firebase inputs
  const [firebaseApiKey, setFirebaseApiKey] = useState(currentSettings.firebaseConfig?.apiKey || '');
  const [firebaseProjectId, setFirebaseProjectId] = useState(currentSettings.firebaseConfig?.projectId || '');
  const [firebaseAuthDomain, setFirebaseAuthDomain] = useState(currentSettings.firebaseConfig?.authDomain || '');
  const [firebaseAppId, setFirebaseAppId] = useState(currentSettings.firebaseConfig?.appId || '');

  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleCopyKey = () => {
    navigator.clipboard.writeText(syncKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopyShareLink = () => {
    const url = syncManager.getShareableSyncUrl();
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleGenerateNewKey = () => {
    const newKey = generateSyncKey();
    setSyncKey(newKey);
  };

  const handleSaveAndSync = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const updatedSettings: Partial<SyncSettings> = {
        enabled: true,
        syncKey: syncKey.trim(),
        deviceName: deviceName.trim(),
        provider: provider,
        firebaseConfig: provider === 'firebase' ? {
          apiKey: firebaseApiKey.trim(),
          projectId: firebaseProjectId.trim(),
          authDomain: firebaseAuthDomain.trim() || `${firebaseProjectId.trim()}.firebaseapp.com`,
          appId: firebaseAppId.trim(),
        } : undefined,
      };

      const success = await syncManager.updateSettings(updatedSettings);
      if (success) {
        setSaveMessage({ type: 'success', text: 'Multi-device sync connected successfully!' });
      } else {
        setSaveMessage({ type: 'error', text: 'Connection failed. Please check your credentials.' });
      }
    } catch (err: any) {
      setSaveMessage({ type: 'error', text: err.message || 'Error updating settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportBackup = () => {
    syncManager.exportWorkspaceBackup();
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = syncManager.importWorkspaceBackup(content);
        if (result.success) {
          setSaveMessage({ type: 'success', text: result.message });
          if (onDataRestored) onDataRestored();
        } else {
          setSaveMessage({ type: 'error', text: result.message });
        }
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  const formatLastSync = (timestamp?: string) => {
    if (!timestamp) return 'Never';
    try {
      const d = new Date(timestamp);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-slate-900"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
              <Cloud className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight">Multi-Device Cloud Sync</h2>
                {/* Sync status badge */}
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  syncState === 'synced'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : syncState === 'syncing'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                    : 'bg-slate-700 text-slate-300 border border-slate-600'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    syncState === 'synced' ? 'bg-emerald-400' : syncState === 'syncing' ? 'bg-amber-400' : 'bg-slate-400'
                  }`} />
                  {syncState === 'synced' ? 'Live Synced' : syncState === 'syncing' ? 'Syncing...' : 'Local Only'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Keep your Kanban boards, tasks & milestones synchronized across all your devices in real time.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Notification Message */}
          <AnimatePresence>
            {saveMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-semibold ${
                  saveMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                    : 'bg-rose-50 text-rose-900 border-rose-200'
                }`}
              >
                {saveMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{saveMessage.text}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Device Profile & Status Banner */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs">
                <Laptop className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Current Device
                </span>
                <span className="font-bold text-slate-900 text-xs sm:text-sm">
                  {deviceName || 'Primary Browser Client'}
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Last Synced
              </span>
              <span className="text-xs font-medium text-slate-700">
                {formatLastSync(lastSyncedAt)}
              </span>
            </div>
          </div>

          {/* Sync Passkey Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="sync-key-input" className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-600" />
                <span>Workspace Sync Key (Passkey)</span>
              </label>
              <button
                type="button"
                onClick={handleGenerateNewKey}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Generate New</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="sync-key-input"
                type="text"
                value={syncKey}
                onChange={(e) => setSyncKey(e.target.value)}
                placeholder="e.g. proj_7x9a2k1b..."
                className="flex-1 bg-slate-50 border border-slate-300 font-mono text-xs sm:text-sm rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs font-semibold"
              />
              <button
                type="button"
                onClick={handleCopyKey}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
                title="Copy Sync Key"
              >
                {copiedKey ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{copiedKey ? 'Copied' : 'Copy Key'}</span>
              </button>
              <button
                type="button"
                onClick={handleCopyShareLink}
                className="px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
                title="Copy One-Click Device Pairing Link"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                <span className="hidden sm:inline">{copiedLink ? 'Link Copied' : 'Share Link'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Enter this exact same Sync Key on your mobile phone, tablet, or work laptop to keep both devices in sync!
            </p>
          </div>

          {/* Sync Provider Switcher */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Cloud Sync Engine
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setProvider('cloud_key')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  provider === 'cloud_key'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Cloud className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold text-xs text-slate-900">Zero-Config Relay</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Instant multi-device & cross-tab sync with no account setup required.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setProvider('firebase')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  provider === 'firebase'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span className="font-bold text-xs text-slate-900">Firebase Firestore</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Enterprise real-time cloud database for high frequency updates.
                </p>
              </button>
            </div>
          </div>

          {/* Firebase Custom Configuration (if selected) */}
          {provider === 'firebase' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800">Firebase Project Credentials:</span>
                <span className="text-[11px] text-indigo-600">Can also be set in .env</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Project ID *</label>
                  <input
                    type="text"
                    value={firebaseProjectId}
                    onChange={(e) => setFirebaseProjectId(e.target.value)}
                    placeholder="my-personal-tracker"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">API Key *</label>
                  <input
                    type="password"
                    value={firebaseApiKey}
                    onChange={(e) => setFirebaseApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Auth Domain</label>
                  <input
                    type="text"
                    value={firebaseAuthDomain}
                    onChange={(e) => setFirebaseAuthDomain(e.target.value)}
                    placeholder="my-app.firebaseapp.com"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">App ID</label>
                  <input
                    type="text"
                    value={firebaseAppId}
                    onChange={(e) => setFirebaseAppId(e.target.value)}
                    placeholder="1:123456789:web:abcdef"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Backup Export & Import */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Backup & Restore
              </span>
              <button
                type="button"
                onClick={onOpenDeployGuide}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Vercel Deploy Guide</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleExportBackup}
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-800 text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-indigo-600" />
                <span>Export JSON Backup</span>
              </button>

              <label className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-800 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>Import JSON Backup</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onOpenDeployGuide}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
          >
            <span>How to host on Vercel</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSaveAndSync}
              disabled={isSaving}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-colors flex items-center gap-1.5"
            >
              {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CloudCheck className="w-3.5 h-3.5" />}
              <span>{isSaving ? 'Connecting...' : 'Save & Sync'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
