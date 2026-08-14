import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Terminal, 
  Globe, 
  Check, 
  Copy, 
  ExternalLink, 
  ShieldCheck, 
  Smartphone, 
  Laptop, 
  Cloud, 
  ArrowRight,
  FolderGit2,
  Sparkles,
  Info
} from 'lucide-react';

interface VercelDeployGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncKey: string;
}

export const VercelDeployGuideModal: React.FC<VercelDeployGuideModalProps> = ({
  isOpen,
  onClose,
  syncKey,
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'vercel_cli' | 'github' | 'sync_env'>('vercel_cli');

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const cliCode = `# 1. Install Vercel CLI globally (if not already installed)
npm install -g vercel

# 2. Deploy directly from your project directory
vercel

# 3. Follow the CLI prompts (Accept defaults: Framework Vite, Output dist)
# When prompted to deploy to production:
vercel --prod`;

  const gitCode = `# 1. Initialize git and commit your files
git init
git add .
git commit -m "Initial commit: Personal Project Tracker with Multi-Device Sync"

# 2. Push to your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/personal-project-tracker.git
git branch -M main
git push -u origin main

# 3. Go to vercel.com/new, select your GitHub repo and click Deploy!`;

  const envSample = `# Add these to Vercel Project Settings > Environment Variables
# (Optional) For real-time Firebase Firestore multi-device sync:
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# (Optional) Default room key for auto-joining devices:
VITE_DEFAULT_SYNC_ROOM=${syncKey || 'my-workspace-key'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-slate-900"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shadow-xs">
              <Globe className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Deploy to Vercel & Multi-Device Setup</h2>
              <p className="text-xs text-slate-300">
                Complete instructions for hosting your tracker live and syncing across phones, tablets & laptops.
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

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('vercel_cli')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'vercel_cli'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>1. Deploy with Vercel CLI (Fastest)</span>
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'github'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>2. Deploy via GitHub Repository</span>
          </button>
          <button
            onClick={() => setActiveTab('sync_env')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'sync_env'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>3. Multi-Device Sync Config</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {activeTab === 'vercel_cli' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs">
                <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-emerald-950">Pre-configured for Vercel:</span>
                  The project includes an optimized <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">vercel.json</code> with SPA rewrite routing and high-performance immutable asset caching headers ready to go.
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-500">
                    Terminal Commands:
                  </span>
                  <button
                    onClick={() => handleCopy(cliCode, 'cli')}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    {copiedSection === 'cli' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSection === 'cli' ? 'Copied!' : 'Copy Commands'}</span>
                  </button>
                </div>
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                  {cliCode}
                </pre>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-700">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-indigo-600" />
                  What happens next:
                </h4>
                <p>
                  1. Vercel will detect Vite, execute <code className="bg-slate-200 px-1 rounded font-mono">npm run build</code>, and serve your <code className="bg-slate-200 px-1 rounded font-mono">dist</code> directory.
                </p>
                <p>
                  2. You will receive an instant live URL (e.g. <code className="bg-slate-200 px-1 rounded font-mono">https://personal-project-tracker.vercel.app</code>).
                </p>
              </div>
            </div>
          )}

          {activeTab === 'github' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-500">
                    Git Push Commands:
                  </span>
                  <button
                    onClick={() => handleCopy(gitCode, 'git')}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    {copiedSection === 'git' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSection === 'git' ? 'Copied!' : 'Copy Commands'}</span>
                  </button>
                </div>
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                  {gitCode}
                </pre>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                  <span className="font-bold text-xs text-slate-900 block mb-1">1. Connect Vercel</span>
                  <p className="text-xs text-slate-600">Sign in to vercel.com and click "Add New... Project".</p>
                </div>
                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                  <span className="font-bold text-xs text-slate-900 block mb-1">2. Select Repository</span>
                  <p className="text-xs text-slate-600">Import your personal-project-tracker repo.</p>
                </div>
                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                  <span className="font-bold text-xs text-slate-900 block mb-1">3. Auto Deploy</span>
                  <p className="text-xs text-slate-600">Every git push will automatically build and update!</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sync_env' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-500">
                    Vercel Environment Variables (Optional):
                  </span>
                  <button
                    onClick={() => handleCopy(envSample, 'env')}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    {copiedSection === 'env' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSection === 'env' ? 'Copied!' : 'Copy .env variables'}</span>
                  </button>
                </div>
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                  {envSample}
                </pre>
              </div>

              {/* How multi device sync works across mobile & desktop */}
              <div className="p-4 bg-indigo-50/70 border border-indigo-200/80 rounded-xl space-y-3">
                <div className="flex items-center gap-2 font-bold text-indigo-950 text-xs">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>How to connect all your devices in 30 seconds:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-indigo-900">
                  <div className="flex items-start gap-2.5 p-2.5 bg-white rounded-lg border border-indigo-100">
                    <Laptop className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-slate-900">On your primary laptop/PC:</span>
                      Click the "Cloud Sync" icon in the top navigation bar and copy your private <strong>Sync Key</strong> (e.g. <code className="bg-indigo-50 text-indigo-700 px-1 py-0.5 rounded font-mono font-bold">{syncKey}</code>).
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-2.5 bg-white rounded-lg border border-indigo-100">
                    <Smartphone className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-slate-900">On your phone or second PC:</span>
                      Open your Vercel URL, open "Cloud Sync", paste your Sync Key and click "Connect & Sync". All your Kanban columns, tasks & milestones sync in real time!
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <a
            href="https://vercel.com/docs/frameworks/vite"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5"
          >
            <span>Vercel Vite Documentation</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors"
          >
            Got It
          </button>
        </div>
      </motion.div>
    </div>
  );
};
