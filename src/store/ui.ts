import { create } from 'zustand';

interface UiState {
  selectedTaskId: string | null;
  isSettingsOpen: boolean;
  isRewardsOpen: boolean;
  isTaskEditOpen: boolean;
  isAdminOpen: boolean;
  isRoutineManagerOpen: boolean;
  showCelebration: boolean;
  celebrationStars: number;
}

interface UiActions {
  setSelectedTaskId: (id: string | null) => void;
  setSettingsOpen: (open: boolean) => void;
  setRewardsOpen: (open: boolean) => void;
  setTaskEditOpen: (open: boolean) => void;
  setAdminOpen: (open: boolean) => void;
  setRoutineManagerOpen: (open: boolean) => void;
  showCelebrationModal: (stars: number) => void;
  hideCelebration: () => void;
}

export const useUiStore = create<UiState & UiActions>((set) => ({
  // State
  selectedTaskId: null,
  isSettingsOpen: false,
  isRewardsOpen: false,
  isTaskEditOpen: false,
  isAdminOpen: false,
  isRoutineManagerOpen: false,
  showCelebration: false,
  celebrationStars: 0,

  // Actions
  setSelectedTaskId: (id) => set({ selectedTaskId: id }),
  setSettingsOpen: (open) => set({ isSettingsOpen: open }),
  setRewardsOpen: (open) => set({ isRewardsOpen: open }),
  setTaskEditOpen: (open) => set({ isTaskEditOpen: open }),
  setAdminOpen: (open) => set({ isAdminOpen: open }),
  setRoutineManagerOpen: (open) => set({ isRoutineManagerOpen: open }),
  showCelebrationModal: (stars) => set({ showCelebration: true, celebrationStars: stars }),
  hideCelebration: () => set({ showCelebration: false, celebrationStars: 0 }),
}));