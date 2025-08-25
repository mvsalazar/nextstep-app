import { motion } from 'framer-motion';
import { CheckCircle2, Clock } from 'lucide-react';
import type { Task } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string, done: boolean) => void;
  onEdit?: (id: string) => void;
  isNextUp?: boolean;
  isSelected?: boolean;
  className?: string;
}

export const TaskCard = ({ 
  task, 
  onToggle, 
  onEdit, 
  isNextUp = false,
  isSelected = false,
  className 
}: TaskCardProps) => {
  const handleToggle = () => {
    onToggle(task.id, !task.done);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <Card
        className={cn(
          'transition-all duration-200 cursor-pointer hover:shadow-md',
          isNextUp && 'ring-2 ring-blue-500 bg-blue-50',
          isSelected && 'ring-2 ring-purple-500 bg-purple-50',
          task.done && 'bg-green-50 border-green-200',
          'focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500'
        )}
        onClick={onEdit ? () => onEdit(task.id) : undefined}
        data-task-id={task.id}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-2xl flex-shrink-0" role="img" aria-label={task.title}>
                {task.emoji}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className={cn(
                  'text-lg font-medium leading-tight',
                  task.done && 'line-through text-gray-500'
                )}>
                  {task.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  {task.dueTime && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(task.dueTime)}</span>
                    </div>
                  )}
                  {task.prime && task.prime.length > 0 && (
                    <div className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
                      Reminders: {task.prime.join(', ')}min
                    </div>
                  )}
                </div>
              </div>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant={task.done ? 'default' : 'outline'}
                size="sm"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  handleToggle();
                }}
                className={cn(
                  'ml-3 flex-shrink-0',
                  task.done && 'bg-green-600 hover:bg-green-700 text-white'
                )}
                aria-label={task.done ? `Mark ${task.title} as not done` : `Mark ${task.title} as done`}
              >
                <CheckCircle2 
                  className={cn(
                    'h-4 w-4',
                    task.done ? 'text-white' : 'text-gray-500'
                  )} 
                />
                {task.done ? 'Done' : 'Mark Done'}
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};