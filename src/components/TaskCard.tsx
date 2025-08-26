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
  isEditable?: boolean; // New prop to control editability
  className?: string;
}

export const TaskCard = ({ 
  task, 
  onToggle, 
  onEdit, 
  isNextUp = false,
  isSelected = false,
  isEditable = true,
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
          'transition-all duration-200 bg-card border-border',
          isEditable && onEdit && 'cursor-pointer hover:shadow-md',
          !isEditable && 'cursor-default',
          isNextUp && 'ring-2 ring-primary bg-primary/5',
          isSelected && 'ring-2 ring-accent bg-accent/10',
          task.done && 'bg-success/10 border-success/30',
          'focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary'
        )}
        onClick={isEditable && onEdit ? () => onEdit(task.id) : undefined}
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
                  'text-lg font-medium leading-tight text-foreground',
                  task.done && 'line-through text-muted-foreground'
                )}>
                  {task.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  {task.dueTime && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(task.dueTime)}</span>
                    </div>
                  )}
                  {task.prime && task.prime.length > 0 && (
                    <div className="px-2 py-1 bg-warning/10 text-warning text-xs rounded-full">
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
                  task.done && 'bg-success hover:bg-success/90 text-white border-success'
                )}
                aria-label={task.done ? `Mark ${task.title} as not done` : `Mark ${task.title} as done`}
              >
                <CheckCircle2 
                  className={cn(
                    'h-4 w-4',
                    task.done ? 'text-white' : 'text-muted-foreground'
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