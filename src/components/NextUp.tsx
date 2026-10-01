import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { useNextTask } from '@/hooks/useTasks';
import { useSettings } from '@/hooks/useSettings';
import { useUiStore } from '@/store/ui';
import { formatTaskTime } from '@/lib/taskTime';
import { TaskCard } from './TaskCard';
import type { Task } from '@/types';

interface NextUpProps {
  task?: Task | null;
  onToggleTask: (id: string, done: boolean) => void;
  onEditTask?: (id: string) => void;
  taskCount?: number; // total tasks for the current context
}

export const NextUp = ({ task: propTask, onToggleTask, onEditTask, taskCount }: NextUpProps) => {
  const hookNextTask = useNextTask();
  const { data: settings } = useSettings();
  const setTaskEditOpen = useUiStore((state) => state.setTaskEditOpen);
  const setSelectedTaskId = useUiStore((state) => state.setSelectedTaskId);
  const nextTask = propTask !== undefined ? propTask : hookNextTask;
  const hasTasks = taskCount === undefined ? true : taskCount > 0;
  
  // Check if user is parent/guardian
  const isParentMode = settings?.userRole === 'parent' || settings?.userRole === 'guardian';

  const handleEditTask = (id: string) => {
    // Only allow parents/guardians to edit tasks
    if (!isParentMode) {
      return;
    }
    setSelectedTaskId(id);
    setTaskEditOpen(true);
    if (onEditTask) onEditTask(id);
  };

  if (!nextTask) {
    // If there are no tasks, do not show the All Done badge
    if (!hasTasks) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 rounded-lg border border-success/20 bg-success/10 p-6 text-foreground"
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-3"
          >
            🎉
          </motion.div>
          <h2 className="text-xl font-bold mb-2">All Done!</h2>
          <p className="text-muted-foreground">
            Great job completing all your tasks for today!
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <section>
      <div className="rounded-2xl border border-blue-200/70 bg-blue-50/70 p-5 dark:border-primary/30 dark:bg-primary/10 low-stim:bg-muted sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-3 text-lg font-bold uppercase tracking-wider text-blue-700 dark:text-primary low-stim:text-primary"><Zap className="h-7 w-7" fill="currentColor" />Next Up</h2>
          {nextTask.dueTime && <span className="hidden rounded-full bg-warning/15 sm:inline-flex px-4 py-2 text-sm font-medium text-foreground">Due at {formatTaskTime(nextTask.dueTime)}</span>}
        </div>
        <TaskCard
          task={nextTask}
          onToggle={onToggleTask}
          onEdit={handleEditTask}
          isNextUp={true}
          isEditable={isParentMode}
        />
      </div>
    </section>
  );
};
