import React from 'react';
import { 
  Folder, 
  Plus, 
  RotateCcw, 
  Sparkles, 
  ChevronDown,
  Layers,
  FolderPlus,
  Cloud,
  Globe,
  Radio
} from 'lucide-react';
import { Project, SyncState } from '../types';

interface NavbarProps {
  projects: Project[];
  activeProjectId: string;
  onSelectProject: (projectId: string) => void;
  onOpenNewProject: () => void;
  onResetData: () => void;
  onOpenNewTask: () => void;
  syncState: SyncState;
  onOpenSyncSettings: () => void;
  onOpenDeployGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onOpenNewProject,
  onResetData,
  onOpenNewTask,
  syncState,
  onOpenSyncSettings,
  onOpenDeployGuide,
}) => {
  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand and Project Picker */}
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-2xs">
              <Layers className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <span className="text-sm font-black tracking-tight text-slate-900 block leading-tight">
                PROJ<span className="text-indigo-600">TRACK</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-600 block">
                Personal Tracker
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          {/* Project Selector */}
          <div className="relative flex items-center gap-1.5">
            <label htmlFor="project-picker" className="text-xs font-semibold text-slate-500 hidden md:inline">
              Active Project:
            </label>
            <div className="relative">
              <select
                id="project-picker"
                value={activeProjectId}
                onChange={(e) => {
                  if (e.target.value === 'NEW_PROJECT') {
                    onOpenNewProject();
                  } else {
                    onSelectProject(e.target.value);
                  }
                }}
                className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-slate-900 text-xs sm:text-sm font-semibold rounded-xl pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs"
              >
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.name}
                  </option>
                ))}
                <option value="NEW_PROJECT">+ Create New Project...</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              onClick={onOpenNewProject}
              className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg border border-slate-200 transition-colors hidden sm:block"
              title="Add new project"
            >
              <FolderPlus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Cloud Sync Status Button */}
          <button
            id="navbar-cloud-sync-btn"
            onClick={onOpenSyncSettings}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 shadow-2xs ${
              syncState === 'synced'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/80'
                : syncState === 'syncing'
                ? 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
            title="Configure Multi-Device Cloud Sync"
          >
            <span className="relative flex h-2 w-2">
              {syncState === 'synced' && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                syncState === 'synced' ? 'bg-emerald-500' : syncState === 'syncing' ? 'bg-amber-500' : 'bg-slate-400'
              }`}></span>
            </span>
            <Cloud className="w-3.5 h-3.5 text-slate-600 hidden sm:inline" />
            <span className="text-xs">
              {syncState === 'synced' ? 'Live Synced' : syncState === 'syncing' ? 'Syncing...' : 'Sync Settings'}
            </span>
          </button>

          {/* Vercel Host Guide Button */}
          <button
            id="navbar-vercel-guide-btn"
            onClick={onOpenDeployGuide}
            className="text-xs text-slate-700 hover:text-slate-950 hover:bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-xl font-bold transition-colors hidden lg:flex items-center gap-1.5 shadow-2xs"
            title="Step-by-step instructions to deploy on Vercel"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-600" />
            <span>Deploy to Vercel</span>
          </button>

          <button
            id="reset-demo-data-btn"
            onClick={onResetData}
            className="text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-2 py-1.5 rounded-lg font-medium transition-colors hidden xl:flex items-center gap-1.5"
            title="Reset to initial demo projects and tasks"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            id="navbar-add-task-btn"
            onClick={onOpenNewTask}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>New Task</span>
          </button>
        </div>
      </div>
    </header>
  );
};

