# 🚀 Vercel Deployment & Multi-Device Synchronization Guide

This project is fully configured and optimized for **1-click deployment on Vercel** with zero configuration required, and supports **real-time multi-device synchronization** across desktops, laptops, tablets, and mobile phones.

---

## 📦 Method 1: Deploy with Vercel CLI (Fastest - 2 Minutes)

If you have Node.js installed on your machine:

```bash
# 1. Install Vercel CLI globally
npm install -g vercel

# 2. Run Vercel in your project root
vercel

# 3. Follow the CLI prompts:
# - Set up and deploy? [Y]
# - Which scope? [Your Account]
# - Link to existing project? [N]
# - What's your project's name? [personal-project-tracker]
# - In which directory is your code located? [./]
# - Auto-detected Project Settings (Vite, output: dist)? [Y]

# 4. Deploy to Production
vercel --prod
```

Your app will be live immediately at `https://your-project.vercel.app`!

---

## 🐙 Method 2: Deploy with GitHub & Vercel Dashboard

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "feat: personal project tracker with multi-device sync"
   git branch -M main
   git remote add origin https://github.com/<YOUR_USERNAME>/personal-project-tracker.git
   git push -u origin main
   ```

2. **Import into Vercel**:
   - Go to [https://vercel.com/new](https://vercel.com/new)
   - Select your GitHub repository.
   - Vercel automatically detects **Vite** as the framework and sets the output directory to `dist`.
   - Click **Deploy**.

Every subsequent `git push` to your `main` branch will automatically trigger a new production build!

---

## 🔄 Enabling Multi-Device Synchronization

The tracker includes a hybrid sync engine that allows you to view and edit the same Kanban boards, tasks, and milestones simultaneously on your phone, tablet, and computer.

### Option A: Zero-Config Cloud Sync (Default - 30 Seconds)

1. Open your live app on your primary computer.
2. In the top navigation bar, click **"Sync Settings"** (or **"Live Synced"**).
3. Copy your unique **Sync Key** (e.g. `proj_9x2k4l8a`).
4. On your mobile phone, tablet, or work laptop, open your Vercel URL.
5. Click **"Sync Settings"**, paste the same **Sync Key**, and click **"Save & Sync"**.
6. Alternatively, click **"Share Link"** to copy a direct pairing URL (e.g. `https://your-app.vercel.app/?syncKey=proj_9x2k4l8a`) that connects any device automatically upon opening!

---

### Option B: Firebase Firestore Real-Time Cloud Sync (Production Scale)

For enterprise-grade real-time streaming with Firebase:

1. Create a free project at [Firebase Console](https://console.firebase.google.com/).
2. In your Firebase project, create a **Firestore Database** in test/production mode.
3. Under **Project Settings > General**, register a Web App and copy your config.
4. Set the following environment variables in your **Vercel Project Settings > Environment Variables**:

| Variable Name | Description | Example |
|---|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase API Key | `AIzaSyB...` |
| `VITE_FIREBASE_PROJECT_ID` | Project ID | `my-personal-tracker` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Auth Domain | `my-personal-tracker.firebaseapp.com` |
| `VITE_FIREBASE_STORAGE_BUCKET`| Storage Bucket (Optional) | `my-personal-tracker.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID (Optional) | `1234567890` |
| `VITE_FIREBASE_APP_ID` | Web App ID | `1:1234567890:web:abcdef` |
| `VITE_DEFAULT_SYNC_ROOM` | Default Sync Key (Optional) | `my-workspace` |

5. Redeploy on Vercel. All connected devices will now sync via Firebase Firestore in real time!

---

## 🛠️ Included Vercel Configuration (`vercel.json`)

The included `vercel.json` ensures:
- **SPA Fallback Routing**: Ensures deep links or page refreshes are handled gracefully by `index.html`.
- **Immutable Asset Caching**: High-performance HTTP caching for bundled JavaScript, CSS, and SVG assets.

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## 💾 Offline Support & JSON Backup

- **Local-First Architecture**: Changes are saved immediately to local storage, so you never lose data even if you go offline.
- **JSON Backup & Restore**: Export your full workspace anytime from the **Sync Settings > Export JSON Backup** button, or import previous backups.
