export type PrimeOffset = 10 | 5 | 1;

export type Task = {
  id: string;
  routineId: string;
  userId?: string;
  title: string;
  emoji: string;
  done: boolean;
  dueTime?: string;
  prime?: PrimeOffset[];
  order: number;
  updatedAt?: string;
  version?: number;
};

export type Routine = {
  id: string;
  userId?: string;
  name: string;
  emoji: string;
  color?: string;
  active: boolean;
  order: number;
  updatedAt?: string;
  version?: number;
};

export type RewardRule = {
  id: string;
  userId?: string;
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
};

export type AppState = {
  routines: Routine[];
  tasks: Task[];
  stars: number;
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