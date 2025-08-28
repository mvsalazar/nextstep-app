export type PrimeOffset = 10 | 5 | 1;

export type Task = {
  id: string;
  routineId: string;
  // Owner is the main user (parent/guardian)
  ownerId?: string;
  // Assignee is the child this task belongs to
  childId?: string;
  title: string;
  emoji: string;
  done: boolean;
  dueTime?: string;
  prime?: PrimeOffset[];
  order: number;
  date?: string; // YYYY-MM-DD format - optional for templates
  isTemplate?: boolean; // true for routine templates, false/undefined for daily instances
  updatedAt?: string;
  version?: number;
};

export type Routine = {
  id: string;
  // Owner is the main user (parent/guardian)
  ownerId?: string;
  // Assignee is the child this routine is for
  childId?: string;
  name: string;
  emoji: string;
  color?: string;
  active: boolean;
  order: number;
  updatedAt?: string;
  version?: number;
};

export type DailyRoutine = {
  id: string;
  routineId: string;
  date: string; // YYYY-MM-DD format
  userId?: string;
  completed: boolean;
  completedAt?: string;
  updatedAt?: string;
  version?: number;
};

export type RewardRule = {
  id: string;
  // Owned by the main user
  ownerId?: string;
  name: string;
  cost: number;
};

export type UserRole = "child" | "parent" | "guardian";

export type Settings = {
  mode: "child" | "adult";
  theme: "light" | "lowstim";
  storageMode: "api" | "local";
  userRole: UserRole;
  adminPin?: string;
  currentRoutineId?: string;
  currentDate?: string; // YYYY-MM-DD format, defaults to today
  // Active child context for viewing/managing data
  currentChildId?: string | null;
};

export type ParentUser = {
  id: string;
  name?: string;
};

export type ChildUser = {
  id: string;
  name: string;
  emoji?: string;
  parentId: string; // reference to main user
};

export type AppState = {
  parentUser: ParentUser;
  children: ChildUser[];
  routines: Routine[];
  dailyRoutines: DailyRoutine[];
  tasks: Task[];
  // Per-child star balances
  starsByChild?: Record<string, number>;
  // Legacy: kept for migration
  stars?: number;
  rewardRules: RewardRule[];
  settings: Settings;
};

export type ApiResponse<T> = {
  data: T;
  success: boolean;
  message?: string;
};

export type ApiError = {
  code: string;
  message: string;
  details?: any;
};
