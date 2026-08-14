import { Project, Task, KanbanColumnDef } from '../types';

export const KANBAN_COLUMNS: KanbanColumnDef[] = [
  {
    id: 'backlog',
    title: 'Backlog',
    description: 'Upcoming ideas & scoped work items',
    color: 'border-slate-200 bg-slate-50/70',
    accent: 'bg-slate-500',
    badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
    badgeText: 'text-slate-600',
  },
  {
    id: 'in_progress',
    title: 'In Progress',
    description: 'Currently actively working on',
    color: 'border-amber-200 bg-amber-50/40',
    accent: 'bg-amber-500',
    badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
    badgeText: 'text-amber-700',
  },
  {
    id: 'in_review',
    title: 'In Review / QA',
    description: 'Testing, verifying, or polishing',
    color: 'border-indigo-200 bg-indigo-50/40',
    accent: 'bg-indigo-500',
    badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    badgeText: 'text-indigo-700',
  },
  {
    id: 'done',
    title: 'Completed',
    description: 'All milestones finished & verified',
    color: 'border-emerald-200 bg-emerald-50/40',
    accent: 'bg-emerald-500',
    badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    badgeText: 'text-emerald-700',
  },
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-smart-hub',
    name: 'Smart Home Automation Hub',
    description: 'Raspberry Pi central dashboard for Zigbee sensors, energy monitors, and ambient lighting automations.',
    color: '#0284c7', // Sky blue
    icon: 'Cpu',
    category: 'Hardware & IoT',
    createdAt: '2026-06-10T10:00:00Z',
    targetDate: '2026-09-30',
  },
  {
    id: 'proj-portfolio',
    name: 'Interactive Dev Portfolio & Blog',
    description: 'Modern portfolio showcase with 3D interactive project previews, MDX blog, and live stats widgets.',
    color: '#8b5cf6', // Purple
    icon: 'Globe',
    category: 'Web Development',
    createdAt: '2026-07-01T14:30:00Z',
    targetDate: '2026-08-28',
  },
  {
    id: 'proj-habit-app',
    name: 'ZenFlow Habit & Micro-Journal',
    description: 'Minimalist offline-first mobile app for tracking daily routines and emotional reflections.',
    color: '#10b981', // Emerald
    icon: 'Sparkles',
    category: 'Mobile App',
    createdAt: '2026-07-15T09:00:00Z',
    targetDate: '2026-10-15',
  },
];

export const INITIAL_TASKS: Task[] = [
  // Smart Home Hub Tasks
  {
    id: 'task-sh-1',
    projectId: 'proj-smart-hub',
    title: 'Zigbee 3.0 USB Coordinator Setup & Flashing',
    description: 'Flash CC2652P dongle with latest coordinator firmware and bind initial temperature and motion sensors.',
    status: 'done',
    priority: 'high',
    tags: ['Hardware', 'Zigbee', 'Firmware'],
    dueDate: '2026-08-01',
    createdAt: '2026-07-10T11:00:00Z',
    updatedAt: '2026-08-01T16:20:00Z',
    estimatedHours: 6,
    notes: 'Firmware flashed using cc2538-bsl tool. Stable on Channel 25 to avoid WiFi 2.4GHz interference.',
    links: [
      { id: 'l1', title: 'Zigbee2MQTT Docs', url: 'https://www.zigbee2mqtt.io' },
      { id: 'l2', title: 'Firmware Repo', url: 'https://github.com/Koenkk/Z-Stack-firmware' }
    ],
    milestones: [
      {
        id: 'ms-101',
        title: 'Download and verify coordinator hex firmware',
        description: 'Source from Koenkk repository, verify SHA256 checksum',
        completed: true,
        completedAt: '2026-07-12T14:00:00Z',
        dueDate: '2026-07-12'
      },
      {
        id: 'ms-102',
        title: 'Flash dongle via bootloader mode with Python flasher',
        description: 'Set device in BSL mode with onboard push buttons',
        completed: true,
        completedAt: '2026-07-14T18:30:00Z',
        dueDate: '2026-07-14'
      },
      {
        id: 'ms-103',
        title: 'Pair test Sonoff SNZB-02 temperature/humidity sensor',
        description: 'Check reporting interval and RSSI signal quality',
        completed: true,
        completedAt: '2026-07-18T10:15:00Z',
        dueDate: '2026-07-20'
      },
      {
        id: 'ms-104',
        title: 'Configure USB passthrough in Docker Compose',
        description: 'Add /dev/ttyACM0 mapping with persistent udev rules',
        completed: true,
        completedAt: '2026-08-01T15:45:00Z',
        dueDate: '2026-08-01'
      }
    ]
  },
  {
    id: 'task-sh-2',
    projectId: 'proj-smart-hub',
    title: 'Energy Monitoring & Solar Inverter Integration',
    description: 'Connect Shelly EM clamp meters and pull generation telemetry from solar inverter API.',
    status: 'in_progress',
    priority: 'urgent',
    tags: ['Energy', 'API', 'Docker'],
    dueDate: '2026-08-20',
    createdAt: '2026-07-20T08:00:00Z',
    updatedAt: '2026-08-12T19:10:00Z',
    estimatedHours: 12,
    notes: 'Shelly is configured with MQTT enabled. Local push updates sent every 10 seconds.',
    links: [
      { id: 'l3', title: 'Shelly API Reference', url: 'https://shelly-api-docs.shelly.cloud' }
    ],
    milestones: [
      {
        id: 'ms-201',
        title: 'Physical installation of Shelly EM in breaker panel',
        description: 'Installed 50A clamp around main grid supply wire',
        completed: true,
        completedAt: '2026-07-25T11:00:00Z',
        dueDate: '2026-07-25'
      },
      {
        id: 'ms-202',
        title: 'Configure local MQTT broker authentication',
        description: 'Setup Mosquitto ACLs and dedicated IoT credentials',
        completed: true,
        completedAt: '2026-08-02T16:00:00Z',
        dueDate: '2026-08-03'
      },
      {
        id: 'ms-203',
        title: 'Implement Modbus TCP parser for Solar Inverter',
        description: 'Read registers 40071 to 40085 for active kW wattage and daily yield',
        completed: false,
        dueDate: '2026-08-16'
      },
      {
        id: 'ms-204',
        title: 'Build automated battery-charging excess solar rule',
        description: 'Trigger power banks when solar output exceeds 1.5kW',
        completed: false,
        dueDate: '2026-08-19'
      },
      {
        id: 'ms-205',
        title: 'Deploy Grafana real-time power flow sankey diagram',
        description: 'Visual representation of grid vs solar vs consumption',
        completed: false,
        dueDate: '2026-08-20'
      }
    ]
  },
  {
    id: 'task-sh-3',
    projectId: 'proj-smart-hub',
    title: 'Ambient Circadian Lighting Engine',
    description: 'Dynamic Kelvin temperature adjustment throughout the day synchronized with local solar elevation.',
    status: 'in_review',
    priority: 'medium',
    tags: ['Lighting', 'Automation', 'Scripting'],
    dueDate: '2026-08-18',
    createdAt: '2026-07-22T15:00:00Z',
    updatedAt: '2026-08-11T12:00:00Z',
    estimatedHours: 8,
    notes: 'Testing color transitions at dusk to avoid harsh step jumps in brightness.',
    milestones: [
      {
        id: 'ms-301',
        title: 'Calculate sun altitude and azimuth algorithm',
        description: 'SunCalc integration based on latitude/longitude',
        completed: true,
        completedAt: '2026-07-28T13:20:00Z',
        dueDate: '2026-07-28'
      },
      {
        id: 'ms-302',
        title: 'Map 2700K (warm) to 6500K (cool) color curves',
        description: 'Ensure smooth easing curves rather than linear shifts',
        completed: true,
        completedAt: '2026-08-05T17:40:00Z',
        dueDate: '2026-08-06'
      },
      {
        id: 'ms-303',
        title: 'Handle manual wall switch override detection',
        description: 'Temporarily disable automation if user manually dims light',
        completed: true,
        completedAt: '2026-08-10T20:10:00Z',
        dueDate: '2026-08-11'
      },
      {
        id: 'ms-304',
        title: 'Perform 3-day stress test across living room & office lights',
        description: 'Verify no flickering or delayed packet congestion during sunset',
        completed: false,
        dueDate: '2026-08-18'
      }
    ]
  },
  {
    id: 'task-sh-4',
    projectId: 'proj-smart-hub',
    title: 'Touchscreen Wall Mount Display (Kiosk Mode)',
    description: 'Mount 10-inch tablet in central hallway with custom wall bracket and auto-wake radar sensor.',
    status: 'backlog',
    priority: 'low',
    tags: ['Hardware', 'UI', 'Mounting'],
    dueDate: '2026-09-10',
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-01T10:00:00Z',
    estimatedHours: 10,
    milestones: [
      {
        id: 'ms-401',
        title: '3D print magnetic flush wall bracket',
        description: 'Design in CAD with recessed space for USB-C 90 degree cable',
        completed: false,
        dueDate: '2026-08-25'
      },
      {
        id: 'ms-402',
        title: 'Wire 5V PoE step-down converter behind drywall',
        description: 'Safety check for low-voltage conduit run',
        completed: false,
        dueDate: '2026-08-30'
      },
      {
        id: 'ms-403',
        title: 'Setup Fully Kiosk Browser with motion wake and screen timeout',
        description: 'Dim screen to 0% after 2 minutes of no presence',
        completed: false,
        dueDate: '2026-09-05'
      }
    ]
  },

  // Portfolio Tasks
  {
    id: 'task-pf-1',
    projectId: 'proj-portfolio',
    title: 'Interactive 3D WebGL Project Showcase Canvas',
    description: 'Build an interactive 3D particle canvas allowing visitors to manipulate and inspect project cards.',
    status: 'in_progress',
    priority: 'high',
    tags: ['ThreeJS', 'WebGL', 'UI/UX'],
    dueDate: '2026-08-22',
    createdAt: '2026-07-15T12:00:00Z',
    updatedAt: '2026-08-13T14:30:00Z',
    estimatedHours: 15,
    notes: 'Optimizing draw calls and fallback to 2D card grid for mobile devices to preserve 60fps.',
    milestones: [
      {
        id: 'ms-501',
        title: 'Setup Three.js scene, camera, and perspective lighting',
        description: 'Soft ambient illumination with subtle rim lighting',
        completed: true,
        completedAt: '2026-07-20T19:00:00Z',
        dueDate: '2026-07-20'
      },
      {
        id: 'ms-502',
        title: 'Generate floating project glass cards with custom shader material',
        description: 'Subtle refraction and chromatic aberration effect on hover',
        completed: true,
        completedAt: '2026-08-01T22:15:00Z',
        dueDate: '2026-08-02'
      },
      {
        id: 'ms-503',
        title: 'Implement smooth inertia drag and orbit controls',
        description: 'Dampened camera pan with boundary clamping',
        completed: true,
        completedAt: '2026-08-09T18:00:00Z',
        dueDate: '2026-08-10'
      },
      {
        id: 'ms-504',
        title: 'Implement mobile low-power mode with auto-throttling',
        description: 'Drop pixel ratio on device pixel ratio > 2 to preserve battery',
        completed: false,
        dueDate: '2026-08-19'
      },
      {
        id: 'ms-505',
        title: 'Add accessibility mode (prefers-reduced-motion)',
        description: 'Gracefully swap 3D canvas with static responsive grid',
        completed: false,
        dueDate: '2026-08-22'
      }
    ]
  },
  {
    id: 'task-pf-2',
    projectId: 'proj-portfolio',
    title: 'MDX Engineering Blog with Live Code Snippets',
    description: 'Add an MDX-based article engine with syntax highlighting, copy buttons, and execution sandbox.',
    status: 'done',
    priority: 'medium',
    tags: ['MDX', 'Content', 'Typography'],
    dueDate: '2026-08-08',
    createdAt: '2026-07-18T10:00:00Z',
    updatedAt: '2026-08-08T18:40:00Z',
    estimatedHours: 10,
    milestones: [
      {
        id: 'ms-601',
        title: 'Configure Shiki syntax highlighter with Tokyo Night theme',
        description: 'Line highlighting and diff badges support',
        completed: true,
        completedAt: '2026-07-25T11:30:00Z',
        dueDate: '2026-07-25'
      },
      {
        id: 'ms-602',
        title: 'Add reading time estimation and table of contents scrollspy',
        description: 'Calculates WPM and highlights active H2/H3 in sidebar',
        completed: true,
        completedAt: '2026-07-30T17:20:00Z',
        dueDate: '2026-07-31'
      },
      {
        id: 'ms-603',
        title: 'Write inaugural technical deep dive article',
        description: 'Publish: "Architecting Low-Latency Local IoT Automations"',
        completed: true,
        completedAt: '2026-08-08T16:00:00Z',
        dueDate: '2026-08-08'
      }
    ]
  },

  // Habit App Tasks
  {
    id: 'task-ha-1',
    projectId: 'proj-habit-app',
    title: 'Local-First SQLite Database Architecture & Schema',
    description: 'Setup OPFS SQLite with reactive query subscriptions for instant offline write & sync.',
    status: 'in_progress',
    priority: 'high',
    tags: ['Database', 'Offline-First', 'Architecture'],
    dueDate: '2026-08-25',
    createdAt: '2026-07-20T09:00:00Z',
    updatedAt: '2026-08-12T11:00:00Z',
    estimatedHours: 14,
    milestones: [
      {
        id: 'ms-701',
        title: 'Define habits, check-ins, and streak log tables with indexes',
        description: 'Schema with UUID primary keys and ISO timestamp columns',
        completed: true,
        completedAt: '2026-07-28T16:00:00Z',
        dueDate: '2026-07-28'
      },
      {
        id: 'ms-702',
        title: 'Implement database migration runner for version upgrades',
        description: 'Atomic transaction support for schema versions',
        completed: true,
        completedAt: '2026-08-04T14:15:00Z',
        dueDate: '2026-08-05'
      },
      {
        id: 'ms-703',
        title: 'Build streak calculation algorithm with timezone support',
        description: 'Accurately handle travel across day boundaries and leap years',
        completed: false,
        dueDate: '2026-08-20'
      },
      {
        id: 'ms-704',
        title: 'Add automated backup export and JSON snapshot import',
        description: 'Local file picker export with encrypted payload',
        completed: false,
        dueDate: '2026-08-25'
      }
    ]
  }
];
