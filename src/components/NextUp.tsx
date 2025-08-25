import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNextTask } from '@/hooks/useTasks';
import { TaskCard } from './TaskCard';
import type { Task } from '@/types';

interface NextUpProps {
  task?: Task | null;
  onToggleTask: (id: string, done: boolean) => void;
  onEditTask?: (id: string) => void;
}

export const NextUp = ({ task: propTask, onToggleTask, onEditTask }: NextUpProps) => {
  const hookNextTask = useNextTask();
  const nextTask = propTask !== undefined ? propTask : hookNextTask;

  if (!nextTask) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-lg shadow-lg mb-6"
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
          <p className="text-green-100">
            Great job completing all your tasks for today!
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="mb-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2 mb-3"
      >
        <ArrowRight className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">
          Next Up
        </h2>
      </motion.div>
      
      <TaskCard
        task={nextTask}
        onToggle={onToggleTask}
        onEdit={onEditTask}
        isNextUp={true}
      />
    </div>
  );
};