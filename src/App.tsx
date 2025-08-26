import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/sonner';
import { queryClient } from '@/lib/queryClient';
import { useSettings, useCurrentDate } from '@/hooks/useSettings';
import { useTasks, useUpdateTask, useTaskProgress, useNextTask } from '@/hooks/useTasks';
import { useUpdateStars } from '@/hooks/useRewards';
import { useReminders } from '@/hooks/useReminders';
import { useUiStore } from '@/store/ui';
import { useState, useEffect } from 'react';
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

function AppContent() {
  const { data: settings } = useSettings();
  const { currentDate, setCurrentDate } = useCurrentDate();
  const canAccessAdmin = settings?.userRole === 'parent' || settings?.userRole === 'guardian'; // Parents/guardians can access admin

  // Smart routine selection based on time of day
  const getSmartRoutineId = () => {
    const now = new Date();
    const hour = now.getHours();
    
    // Morning routine: 5 AM - 11 AM
    if (hour >= 5 && hour < 11) {
      return 'r1'; // Morning Routine
    }
    // After school routine: 2 PM - 6 PM  
    else if (hour >= 14 && hour < 18) {
      return 'r2'; // After School
    }
    // Bedtime routine: 7 PM - 10 PM
    else if (hour >= 19 && hour <= 22) {
      return 'r3'; // Bedtime Routine
    }
    // Default to morning routine
    else {
      return 'r1';
    }
  };
  
  const smartRoutineId = getSmartRoutineId();
  
  // State for current routine (can be overridden by user)
  const [currentRoutineId, setCurrentRoutineId] = useState<string>(smartRoutineId);
  const [isSmartSelected, setIsSmartSelected] = useState(true);
  
  // Update routine when smart selection changes (e.g., time passes)
  useEffect(() => {
    if (isSmartSelected) {
      setCurrentRoutineId(smartRoutineId);
    }
  }, [smartRoutineId, isSmartSelected]);
  
  const handleRoutineChange = (routineId: string) => {
    setCurrentRoutineId(routineId);
    setIsSmartSelected(routineId === smartRoutineId);
  };
  
  // Get tasks for the current routine and date
  const { data: tasks = [] } = useTasks(currentRoutineId, currentDate);
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

  return (
    <div className={cn('min-h-screen', isLowStim && 'low-stim')}>
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
        routineId={currentRoutineId}
        date={currentDate}
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