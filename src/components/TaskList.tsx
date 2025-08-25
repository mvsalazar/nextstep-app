import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
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
  const tasks = propTasks !== undefined ? propTasks : hookTasks;
  const setTaskEditOpen = useUiStore((state) => state.setTaskEditOpen);
  const setSelectedTaskId = useUiStore((state) => state.setSelectedTaskId);
  
  // Initialize keyboard navigation
  const { selectedTaskId } = useKeyboardNavigation();

  const handleAddTask = () => {
    setSelectedTaskId(null);
    setTaskEditOpen(true);
  };

  const handleEditTask = (id: string) => {
    setSelectedTaskId(id);
    if (onEditTask) onEditTask(id);
  };

  const incompleteTasks = tasks.filter(task => !task.done);
  const completedTasks = tasks.filter(task => task.done);

  return (
    <div className="space-y-6">
      {/* Add Task Button */}
      <div className="text-center">
        <Button
          onClick={handleAddTask}
          variant="outline"
          className="gap-2 hover:bg-blue-50 hover:border-blue-300"
          aria-label="Add new task"
        >
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      {/* Incomplete Tasks */}
      {incompleteTasks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
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
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No tasks yet
          </h3>
          <p className="text-gray-600 mb-4">
            Add your first task to get started with your daily routine!
          </p>
          <Button
            onClick={handleAddTask}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Your First Task
          </Button>
        </motion.div>
      )}
    </div>
  );
};