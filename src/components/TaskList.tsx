import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Plus, List, CheckCircle2, ChevronUp, ChevronDown } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/button';
import { TaskCard } from './TaskCard';
import { useUiStore } from '@/store/ui';
import type { Task } from '@/types';

interface TaskListProps {
  tasks?: Task[];
  onToggleTask: (id: string, done: boolean) => void;
  onEditTask?: (id: string) => void;
  isLoading?: boolean;
}

export const TaskList = ({ tasks: propTasks, onToggleTask, onEditTask, isLoading: propLoading }: TaskListProps) => {
  const [showCompleted, setShowCompleted] = useState(true);
  const { data: hookTasks = [], isLoading: hookLoading } = useTasks();
  const { data: settings } = useSettings();
  const tasks = propTasks !== undefined ? propTasks : hookTasks;
  const isLoading = propLoading ?? hookLoading;
  const setTaskEditOpen = useUiStore((state) => state.setTaskEditOpen);
  const setSelectedTaskId = useUiStore((state) => state.setSelectedTaskId);
  
  // Initialize keyboard navigation
  const { selectedTaskId } = useKeyboardNavigation(tasks);
  
  // Check if user is parent/guardian
  const isParentMode = settings?.userRole === 'parent' || settings?.userRole === 'guardian';

  const handleAddTask = () => {
    setSelectedTaskId(null);
    setTaskEditOpen(true);
  };

  const handleEditTask = (id: string) => {
    // Only allow parents/guardians to edit tasks
    if (!isParentMode) {
      return;
    }
    setSelectedTaskId(id);
    setTaskEditOpen(true);
    if (onEditTask) onEditTask(id);
  };

  const incompleteTasks = tasks.filter(task => !task.done);
  const completedTasks = tasks.filter(task => task.done);

  return (
    <section className="space-y-6" aria-busy={isLoading || undefined}>
      {/* Loading skeletons */}
      {isLoading && (
        <div className="space-y-3" aria-hidden>
          {[1,2,3].map((i) => (
            <div key={i} className="animate-pulse rounded-md border border-input bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="h-8 w-8 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-40 bg-muted rounded" />
                    <div className="h-3 w-24 bg-muted rounded" />
                  </div>
                </div>
                <div className="h-9 w-24 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      )}
      {isLoading && (
        <span className="sr-only" role="status" aria-live="polite">Loading tasks…</span>
      )}
      {/* Add Task Button - Only for Parents/Guardians */}
      {isParentMode && (
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Today</p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-foreground">Your steps</h2>
          </div>
          <Button
            onClick={handleAddTask}
            className="h-10 gap-2 rounded-full px-4"
            aria-label="Add new task"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        </div>
      )}

      {/* Incomplete Tasks */}
      {!isLoading && incompleteTasks.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between gap-3"><h3 className="flex items-center gap-3 text-lg font-bold"><List className="h-5 w-5" />Up Next</h3><span className="text-sm text-muted-foreground">{incompleteTasks.length} {incompleteTasks.length === 1 ? 'task' : 'tasks'} remaining</span></div>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {incompleteTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={onToggleTask}
                  onEdit={handleEditTask}
                  isSelected={selectedTaskId === task.id}
                  isEditable={isParentMode}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {!isLoading && completedTasks.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between gap-3"><h3 className="flex items-center gap-3 text-lg font-bold"><CheckCircle2 className="h-7 w-7 text-success" />Completed ({completedTasks.length})</h3><button onClick={() => setShowCompleted(!showCompleted)} aria-expanded={showCompleted} aria-controls="completed-tasks" className="flex items-center gap-2 rounded-md p-1 text-sm text-blue-700 dark:text-primary low-stim:text-primary">{showCompleted ? 'Hide' : 'Show'} completed{showCompleted ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</button></div>
          <div id="completed-tasks" hidden={!showCompleted} className="space-y-2">
            <AnimatePresence mode="popLayout">
              {completedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={onToggleTask}
                  onEdit={handleEditTask}
                  isEditable={isParentMode}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && tasks.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No tasks yet
          </h3>
          <p className="text-muted-foreground mb-4">
            {isParentMode 
              ? "Add your first task to get started with your daily routine!"
              : "Ask your parent or guardian to add tasks for you!"
            }
          </p>
          {isParentMode && (
            <Button
              onClick={handleAddTask}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Your First Task
            </Button>
          )}
        </motion.div>
      )}
    </section>
  );
};
