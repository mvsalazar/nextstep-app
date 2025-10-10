import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/sonner';
import { queryClient } from '@/lib/queryClient';
import { useSettings, useCurrentDate } from '@/hooks/useSettings';
import { useTasks, useUpdateTask, useTaskProgress, useNextTask } from '@/hooks/useTasks';
import { useUpdateStars } from '@/hooks/useRewards';
import { useReminders } from '@/hooks/useReminders';
import { useUiStore } from '@/store/ui';
import { useState, useEffect, useMemo } from 'react';
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
import { DateNavigation } from '@/components/DateNavigation';
import { RoutineSelector } from '@/components/RoutineSelector';
import { cn } from '@/lib/utils';
import { useRoutines } from '@/hooks/useRoutines';
import { useAuth } from '@/hooks/useAuth';
import { AuthScreen } from '@/components/AuthScreen';
import { DebugBanner } from '@/components/DebugBanner';
import { MicroCelebration } from '@/components/MicroCelebration';

function AppContent() {
  const { data: settings } = useSettings();
  const { currentDate, setCurrentDate } = useCurrentDate();
  const canAccessAdmin = settings?.userRole === 'parent' || settings?.userRole === 'guardian'; // Parents/guardians can access admin

  const { routines } = useRoutines();

  // Smart routine selection based on time of day using routine names
  const smartRoutineId = useMemo(() => {
    if (!routines || routines.length === 0) return undefined;
    const now = new Date();
    const hour = now.getHours();
    const findByName = (namePart: string) =>
      routines.find((r) => r.name.toLowerCase().includes(namePart))?.id;
    const byIndex = (idx: number) => routines[Math.min(idx, routines.length - 1)]?.id;

    const morningId = findByName('morning') || byIndex(0);
    const afterId = findByName('after') || findByName('school') || byIndex(1);
    const bedtimeId = findByName('bedtime') || findByName('bed') || byIndex(2);

    // Time windows:
    // 00:00–04:59 => Bedtime (late night)
    // 05:00–10:59 => Morning
    // 11:00–18:59 => After School
    // 19:00–23:59 => Bedtime
    if (hour < 5) return bedtimeId;
    if (hour < 11) return morningId;
    if (hour < 19) return afterId;
    return bedtimeId;
  }, [routines]);
  
  // State for current routine (can be overridden by user)
  const [currentRoutineId, setCurrentRoutineId] = useState<string>(smartRoutineId || '');
  const [isSmartSelected, setIsSmartSelected] = useState(true);
  
  // Update routine when smart selection changes (e.g., time passes)
  useEffect(() => {
    if (isSmartSelected && smartRoutineId) {
      setCurrentRoutineId(smartRoutineId);
    }
  }, [smartRoutineId, isSmartSelected]);

  // Removed focus behavior; routine selection remains time-of-day based
  
  const handleRoutineChange = (routineId: string) => {
    setCurrentRoutineId(routineId);
    setIsSmartSelected(routineId === smartRoutineId);
  };
  
  // Get tasks for the current routine and date
  const { data: tasks = [], isLoading: tasksLoading } = useTasks(currentRoutineId, currentDate);
  const progress = useTaskProgress(currentRoutineId, currentDate);
  const nextTask = useNextTask(currentRoutineId, currentDate);
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
  const isDark = settings?.theme === 'dark';
  
  // Apply theme classes to the root html element for full-scope CSS variables
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) root.classList.add('dark'); else root.classList.remove('dark');
    if (isLowStim) root.classList.add('low-stim'); else root.classList.remove('low-stim');
  }, [isDark, isLowStim]);

  return (
    <div className={cn('min-h-screen')}>
      <HeaderBar />
      {canAccessAdmin && (
        <DateNavigation 
          currentDate={currentDate} 
          onDateChange={setCurrentDate} 
        />
      )}
      <RoutineSelector 
        currentRoutineId={currentRoutineId}
        onRoutineChange={handleRoutineChange}
        smartSelected={isSmartSelected}
      />
      
      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        <ProgressBar progress={progress.progress} completedCount={progress.completedCount} totalCount={progress.totalCount} />
        <NextUp 
          task={nextTask}
          taskCount={tasks.length}
          onToggleTask={handleTaskToggle}
          onEditTask={(id) => console.log('Edit task:', id)}
        />
        <TaskList 
          tasks={tasks}
          isLoading={tasksLoading || !currentRoutineId}
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
        routineId={currentRoutineId}
        date={currentDate}
        isOpen={isTaskEditOpen}
        onClose={() => setTaskEditOpen(false)}
      />
      <Toaster position="top-center" />
      <MicroCelebration />
      {import.meta.env.DEV && <DebugBanner />}
    </div>
  );
}

const AuthOrApp = () => {
  const { storageMode, isAuthenticated } = useAuth();
  if (storageMode === 'api' && !isAuthenticated) return <AuthScreen />;
  return <AppContent />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthOrApp />
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default App;
