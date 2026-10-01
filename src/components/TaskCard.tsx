import { motion } from 'framer-motion';
import { Bell, Check, CheckCircle2, ChevronRight, Circle, Clock } from 'lucide-react';
import { formatTaskTime } from '@/lib/taskTime';
import type { Task } from '@/types';
import { cn } from '@/lib/utils';
import { fireFeedback } from '@/lib/feedback';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string, done: boolean) => void;
  onEdit?: (id: string) => void;
  isNextUp?: boolean;
  isSelected?: boolean;
  isEditable?: boolean;
  className?: string;
}
export const TaskCard = ({ task, onToggle, onEdit, isNextUp = false, isSelected = false, isEditable = true, className }: TaskCardProps) => {
  const toggle = () => { fireFeedback(!task.done); onToggle(task.id, !task.done); };
  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className={cn('flex items-center gap-4 rounded-xl border border-border p-4 sm:p-5', isNextUp ? 'grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3 gap-y-5 border-0 bg-transparent p-0 sm:flex sm:flex-wrap sm:items-center sm:gap-4 sm:p-0' : task.done ? 'bg-muted/30' : 'bg-card', isSelected && 'ring-2 ring-primary', className)} data-task-id={task.id}>
      {!isNextUp && <button onClick={toggle} aria-pressed={task.done} aria-label={`Mark ${task.title} as ${task.done ? 'not done' : 'done'}`} className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-full', task.done ? 'bg-success text-white' : 'text-muted-foreground')}>
        {task.done ? <Check className="h-5 w-5" /> : <Circle className="h-7 w-7" />}
      </button>}
      <span aria-hidden="true" className={cn('grid shrink-0 place-items-center rounded-2xl bg-primary/5', isNextUp ? 'h-12 w-12 text-3xl sm:h-24 sm:w-24 sm:text-5xl' : 'h-14 w-14 text-3xl')}>{task.emoji}</span>
      <div className="min-w-0 flex-1">
        <h3 className={cn('font-bold text-foreground', isNextUp ? 'break-words text-xl sm:text-3xl' : 'text-lg', task.done && 'text-muted-foreground line-through')}>{task.title}</h3>
        <div className={cn("mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground", isNextUp && "flex-col items-start gap-y-2 sm:flex-row sm:items-center sm:gap-y-1")}>
          {task.dueTime && <span className="inline-flex items-center gap-2 [&>svg]:shrink-0"><Clock className="h-4 w-4" />{formatTaskTime(task.dueTime)}</span>}
          {!!task.prime?.length && <span className="inline-flex items-center gap-2 [&>svg]:shrink-0"><Bell className="h-4 w-4" />Reminder {task.prime.join(', ')} min before</span>}
        </div>
      </div>
      {isNextUp ? <button onClick={toggle} className="col-span-2 flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-primary px-7 py-4 text-lg font-semibold text-primary-foreground shadow-lg shadow-primary/10 hover:bg-primary/90 sm:w-auto"><CheckCircle2 className="h-6 w-6" />Mark Done</button> : isEditable && onEdit && <button onClick={() => onEdit(task.id)} aria-label={`Edit ${task.title}`} className="rounded-lg p-2 text-muted-foreground hover:bg-muted"><ChevronRight className="h-5 w-5" /></button>}
    </motion.div>
  );
};
