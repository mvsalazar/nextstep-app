import { useEffect, useRef } from 'react';
import { useTasks } from './useTasks';
import type { Task, PrimeOffset } from '@/types';
import { toast } from 'sonner';

export const useReminders = () => {
  const { data: tasks = [] } = useTasks();
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Clear all existing timers
  const clearAllTimers = () => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();
  };

  // Schedule reminders for a single task
  const scheduleTaskReminders = (task: Task) => {
    if (!task.dueTime || !task.prime || task.done) return;

    const now = new Date();
    
    // Parse due time (assumes format "HH:MM")
    const [hours, minutes] = task.dueTime.split(':').map(Number);
    const dueDateTime = new Date();
    dueDateTime.setHours(hours, minutes, 0, 0);
    
    // If due time has passed today, schedule for tomorrow
    if (dueDateTime <= now) {
      dueDateTime.setDate(dueDateTime.getDate() + 1);
    }

    task.prime.forEach((primeMinutes: PrimeOffset) => {
      const reminderTime = new Date(dueDateTime.getTime() - (primeMinutes * 60 * 1000));
      
      // Only schedule if reminder time is in the future
      if (reminderTime > now) {
        const delay = reminderTime.getTime() - now.getTime();
        const timerId = `${task.id}-${primeMinutes}`;
        
        const timer = setTimeout(() => {
          // Double-check task is still incomplete
          const isTaskStillIncomplete = !task.done; // Note: This captures current state
          if (isTaskStillIncomplete) {
            toast(`⏰ ${task.emoji} ${task.title}`, {
              description: `Coming up in ${primeMinutes} minutes!`,
              duration: 5000,
              action: {
                label: 'Got it',
                onClick: () => {},
              },
            });
          }
          
          // Clean up this timer
          timersRef.current.delete(timerId);
        }, delay);
        
        timersRef.current.set(timerId, timer);
        
        // Log for debugging
        console.log(`Scheduled reminder for "${task.title}" at ${reminderTime.toLocaleTimeString()} (in ${Math.round(delay / 1000)}s)`);
      }
    });
  };

  // Schedule reminders for all tasks
  const scheduleAllReminders = () => {
    clearAllTimers();
    
    const incompleteTasks = tasks.filter(task => !task.done);
    incompleteTasks.forEach(scheduleTaskReminders);
    
    console.log(`Scheduled reminders for ${incompleteTasks.length} tasks`);
  };

  // Effect to schedule reminders when tasks change
  useEffect(() => {
    scheduleAllReminders();
    
    // Cleanup on unmount
    return () => {
      clearAllTimers();
    };
  }, [tasks]);

  // Manual trigger for testing
  const triggerTestReminder = (task: Task) => {
    toast(`🧪 Test: ${task.emoji} ${task.title}`, {
      description: 'This is a test reminder!',
      duration: 3000,
    });
  };

  return {
    scheduleAllReminders,
    clearAllReminders: clearAllTimers,
    triggerTestReminder,
    activeTimerCount: timersRef.current.size,
  };
};