import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/sonner';
import { queryClient } from '@/lib/queryClient';
import { useSettings } from '@/hooks/useSettings';
import { useTasks, useUpdateTask, useTaskProgress, useNextTask } from '@/hooks/useTasks';
import { useUpdateStars } from '@/hooks/useRewards';
import { useReminders } from '@/hooks/useReminders';
import { useUiStore } from '@/store/ui';
import { HeaderBar } from '@/components/HeaderBar';
import { ProgressBar } from '@/components/ProgressBar';
import { NextUp } from '@/components/NextUp';
import { TaskList } from '@/components/TaskList';
import { CelebrationModal } from '@/components/CelebrationModal';
import { SettingsSheet } from '@/components/SettingsSheet';
import { RewardsPanel } from '@/components/RewardsPanel';
import { AdminSection } from '@/components/AdminSection';
import { RoutineManager } from '@/components/RoutineManager';
import { TaskEditModal } from '@/components/TaskEditModal';
import { cn } from '@/lib/utils';

function AppContent() {
  const { data: settings } = useSettings();
  const currentRoutineId = settings?.currentRoutineId;
  const { data: tasks = [] } = useTasks(currentRoutineId);
  const progress = useTaskProgress(currentRoutineId);
  const nextTask = useNextTask(currentRoutineId);
  const updateTask = useUpdateTask();
  const updateStars = useUpdateStars();
  const { 
    isAdminOpen, 
    isRoutineManagerOpen, 
    isTaskEditOpen,
    selectedTaskId,
    setAdminOpen, 
    setRoutineManagerOpen,
    setTaskEditOpen
  } = useUiStore();
  
  // Initialize reminders system
  useReminders();

  const handleTaskToggle = async (taskId: string, newDoneState: boolean) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Update the task
    await updateTask.mutateAsync({ 
      id: taskId, 
      updates: { done: newDoneState } 
    });

    // Update stars based on completion state change
    const starDelta = newDoneState ? 1 : -1;
    updateStars.mutate(starDelta);
  };

  const isLowStim = settings?.theme === 'lowstim';

  return (
    <div className={cn('min-h-screen', isLowStim && 'low-stim')}>
      <HeaderBar />
      
      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        <ProgressBar progress={progress.progress} />
        <NextUp 
          task={nextTask}
          onToggleTask={handleTaskToggle}
          onEditTask={(id) => console.log('Edit task:', id)}
        />
        <TaskList 
          tasks={tasks}
          onToggleTask={handleTaskToggle}
          onEditTask={(id) => console.log('Edit task:', id)}
        />
      </main>

      <CelebrationModal />
      <SettingsSheet />
      <RewardsPanel />
      <AdminSection 
        isOpen={isAdminOpen}
        onClose={() => setAdminOpen(false)}
      />
      <RoutineManager 
        isOpen={isRoutineManagerOpen}
        onClose={() => setRoutineManagerOpen(false)}
      />
      <TaskEditModal 
        task={selectedTaskId ? tasks.find(t => t.id === selectedTaskId) : null}
        isOpen={isTaskEditOpen}
        onClose={() => setTaskEditOpen(false)}
      />
      <Toaster position="top-center" />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;