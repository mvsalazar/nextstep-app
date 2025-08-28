import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
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
}

export const TaskList = ({ tasks: propTasks, onToggleTask, onEditTask }: TaskListProps) => {
  const { data: hookTasks = [] } = useTasks();
  const { data: settings } = useSettings();
  const tasks = propTasks !== undefined ? propTasks : hookTasks;
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
    if (onEditTask) onEditTask(id);
  };

  const incompleteTasks = tasks.filter(task => !task.done);
  const completedTasks = tasks.filter(task => task.done);

  return (
    <div className="space-y-6">
      {/* Add Task Button - Only for Parents/Guardians */}
      {isParentMode && (
        <div className="text-center">
          <Button
            onClick={handleAddTask}
            variant="outline"
            className="gap-2 hover:bg-primary/10 hover:border-primary/30"
            aria-label="Add new task"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        </div>
      )}

      {/* Incomplete Tasks */}
      {incompleteTasks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">
            To Do ({incompleteTasks.length})
          </h3>
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
      {completedTasks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">
            Completed ({completedTasks.length})
          </h3>
          <div className="space-y-3">
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
      {tasks.length === 0 && (
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
    </div>
  );
};
