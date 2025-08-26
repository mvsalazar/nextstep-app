import type { Task, RewardRule, Settings, Routine, DailyRoutine } from '@/types';

export const STORAGE_KEY = 'nextstep:v3'; // Updated to force fresh data with template system

export const DEFAULT_SETTINGS: Settings = {
  mode: 'child',
  theme: 'light',
  storageMode: 'local',
  userRole: 'child',
  currentRoutineId: 'r1',
  // currentDate will be set dynamically in useCurrentDate hook
};

export const SEED_ROUTINES: Routine[] = [
  {
    id: 'r1',
    name: 'Morning Routine',
    emoji: '🌅',
    color: '#fbbf24',
    active: true,
    order: 1,
    updatedAt: new Date().toISOString(),
    version: 1,
  },
  {
    id: 'r2',
    name: 'After School',
    emoji: '🏠',
    color: '#60a5fa',
    active: true,
    order: 2,
    updatedAt: new Date().toISOString(),
    version: 1,
  },
  {
    id: 'r3',
    name: 'Bedtime Routine',
    emoji: '🌙',
    color: '#a78bfa',
    active: true,
    order: 3,
    updatedAt: new Date().toISOString(),
    version: 1,
  },
];

const today = new Date().toISOString().split('T')[0];

export const SEED_TASK_TEMPLATES: Task[] = [
  {
    id: 't1',
    routineId: 'r1',
    title: 'Brush Teeth',
    emoji: '🪥',
    done: false,
    dueTime: '07:15',
    prime: [10, 5],
    order: 1,
    isTemplate: true,
    updatedAt: new Date().toISOString(),
    version: 1,
  },
  {
    id: 't2',
    routineId: 'r1',
    title: 'Get Dressed',
    emoji: '👕',
    done: false,
    dueTime: '07:25',
    prime: [5],
    order: 2,
    isTemplate: true,
    updatedAt: new Date().toISOString(),
    version: 1,
  },
  {
    id: 't3',
    routineId: 'r1',
    title: 'Eat Breakfast',
    emoji: '🥣',
    done: false,
    dueTime: '07:45',
    order: 3,
    isTemplate: true,
    updatedAt: new Date().toISOString(),
    version: 1,
  },
  {
    id: 't4',
    routineId: 'r1',
    title: 'Pack School Bag',
    emoji: '🎒',
    done: false,
    dueTime: '08:15',
    prime: [10],
    order: 4,
    isTemplate: true,
    updatedAt: new Date().toISOString(),
    version: 1,
  },
  {
    id: 't5',
    routineId: 'r2',
    title: 'Hang Up Backpack',
    emoji: '🎒',
    done: false,
    order: 1,
    isTemplate: true,
    updatedAt: new Date().toISOString(),
    version: 1,
  },
  {
    id: 't6',
    routineId: 'r2',
    title: 'Wash Hands',
    emoji: '🧼',
    done: false,
    order: 2,
    isTemplate: true,
    updatedAt: new Date().toISOString(),
    version: 1,
  },
  {
    id: 't7',
    routineId: 'r2',
    title: 'Have Snack',
    emoji: '🍎',
    done: false,
    order: 3,
    isTemplate: true,
    updatedAt: new Date().toISOString(),
    version: 1,
  },
  {
    id: 't8',
    routineId: 'r3',
    title: 'Put on Pajamas',
    emoji: '👘',
    done: false,
    dueTime: '19:30',
    order: 1,
    isTemplate: true,
    updatedAt: new Date().toISOString(),
    version: 1,
  },
  {
    id: 't9',
    routineId: 'r3',
    title: 'Brush Teeth',
    emoji: '🪥',
    done: false,
    dueTime: '19:45',
    prime: [5],
    order: 2,
    isTemplate: true,
    updatedAt: new Date().toISOString(),
    version: 1,
  },
  {
    id: 't10',
    routineId: 'r3',
    title: 'Read Story',
    emoji: '📖',
    done: false,
    dueTime: '20:00',
    order: 3,
    isTemplate: true,
    updatedAt: new Date().toISOString(),
    version: 1,
  },
];

export const SEED_DAILY_ROUTINES: DailyRoutine[] = [
  {
    id: 'dr1',
    routineId: 'r1',
    date: today,
    completed: false,
    updatedAt: new Date().toISOString(),
    version: 1,
  },
  {
    id: 'dr2',
    routineId: 'r2',
    date: today,
    completed: false,
    updatedAt: new Date().toISOString(),
    version: 1,
  },
  {
    id: 'dr3',
    routineId: 'r3',
    date: today,
    completed: false,
    updatedAt: new Date().toISOString(),
    version: 1,
  },
];

export const SEED_REWARDS: RewardRule[] = [
  {
    id: 'r1',
    name: 'Choose a snack',
    cost: 5,
  },
  {
    id: 'r2',
    name: 'Extra 15 minutes of screen time',
    cost: 10,
  },
];

// Alias for backward compatibility
export const SEED_TASKS = SEED_TASK_TEMPLATES;

export const STAR_THRESHOLDS = [5, 10, 20, 50];

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
export const DEFAULT_STORAGE_MODE = (import.meta.env.VITE_STORAGE_MODE as 'api' | 'local') || 'local';