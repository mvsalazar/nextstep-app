import { motion } from 'framer-motion';
import { CheckCircle2, Clock } from 'lucide-react';
import type { Task } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { fireFeedback, shouldReduceMotion, playTada, haptic } from '@/lib/feedback';
import { useUiStore } from '@/store/ui';
import { useState } from 'react';

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
  const [showBurst, setShowBurst] = useState(false);
  const [iconPop, setIconPop] = useState(false);
  const [liveMsg, setLiveMsg] = useState('');
  const { triggerMicroCelebration } = useUiStore();
  const handleToggle = (buttonEl?: HTMLButtonElement | null) => {
    const next = !task.done;
    // Blur to avoid focus jumping to other elements
    buttonEl?.blur?.();
    // Trigger feedback and local animation before state update (so the card isn't removed immediately)
    if (next) {
      playTada();
      haptic([18, 20, 15]);
      triggerMicroCelebration('🎉');
    } else {
      fireFeedback(false);
    }
    setLiveMsg(`${task.title} ${next ? 'marked done' : 'marked not done'}`);
    const animateFirst = next && !shouldReduceMotion();
    if (animateFirst) {
      setShowBurst(true);
      setIconPop(true);
      setTimeout(() => setShowBurst(false), 500);
      setTimeout(() => setIconPop(false), 250);
    }
    // Slight delay lets animation/beep register before list re-renders
    const delay = animateFirst ? 140 : 0;
    setTimeout(() => onToggle(task.id, next), delay);
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
            <motion.div className="relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant={task.done ? 'outline' : 'outline'}
                size="sm"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  handleToggle(e.currentTarget);
                }}
                className={cn(
                  'ml-3 flex-shrink-0 rounded-md h-9 px-3 py-2 shadow-xs border focus-visible:ring-ring focus-visible:ring-[3px] focus-visible:ring-offset-2 focus-visible:outline-none',
                  task.done
                    ? 'bg-card text-success border-success hover:bg-success/10'
                    : 'bg-primary text-primary-foreground border-primary/70 hover:bg-primary/90'
                )}
                aria-pressed={task.done}
                aria-label={task.done ? `Mark ${task.title} as not done` : `Mark ${task.title} as done`}
              >
                <motion.span
                  initial={false}
                  animate={iconPop ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                  transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
                  className="inline-flex items-center"
                >
                  <CheckCircle2 
                    className={cn(
                      'h-4 w-4',
                      task.done ? 'text-success' : 'text-primary-foreground'
                    )} 
                    fill={'none'}
                  />
                </motion.span>
                {task.done ? 'Done' : 'Mark Done'}
              </Button>

              {showBurst && (
                <>
                  <motion.span
                    aria-hidden
                    initial={{ opacity: 0.35, scale: 0.9 }}
                    animate={{ opacity: 0, scale: 1.5 }}
                    transition={{ type: 'tween', duration: 0.4, ease: 'easeOut' }}
                    className={cn('pointer-events-none absolute inset-0 m-auto h-9 w-[5.5rem] rounded-md blur-sm',
                      task.done ? 'bg-success/20' : 'bg-primary/25'
                    )}
                  />
                  <motion.span
                    aria-hidden
                    initial={{ opacity: 0.6, scale: 0.8 }}
                    animate={{ opacity: 0, scale: 1.6 }}
                    transition={{ type: 'tween', duration: 0.45, ease: 'easeOut' }}
                    className={cn('pointer-events-none absolute inset-0 m-auto h-9 w-[5.5rem] rounded-md border-2',
                      task.done ? 'border-success/70' : 'border-primary/70'
                    )}
                  />
                </>
              )}
            </motion.div>
          </div>
        </CardContent>
      </Card>
      {/* SR live region for confirmation */}
      <span aria-live="polite" className="sr-only">{liveMsg}</span>
    </motion.div>
  );
};
