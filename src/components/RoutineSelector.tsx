import { motion } from 'framer-motion';
import { useRoutines } from '@/hooks/useRoutines';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RoutineSelectorProps {
  currentRoutineId: string;
  onRoutineChange: (routineId: string) => void;
  smartSelected?: boolean; // indicates if this was auto-selected
}

export const RoutineSelector = ({ currentRoutineId, onRoutineChange }: RoutineSelectorProps) => {
  const { routines, isLoading } = useRoutines();
  
  if (isLoading || routines.length === 0) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="h-8 w-32 animate-pulse rounded-md bg-muted" />
      </div>
    );
  }

  return (
    <nav className="-mx-4 overflow-x-auto px-4 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0" aria-label="Choose a routine">
      <div className="flex w-max min-w-full items-center gap-2 sm:w-auto">
        {routines.map((routine) => {
          const isActive = routine.id === currentRoutineId;
          return (
            <motion.div key={routine.id} className="shrink-0" whileTap={{ scale: 0.98 }}>
              <Button
                variant="ghost"
                onClick={() => onRoutineChange(routine.id)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'h-12 gap-2 rounded-full border px-4 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-primary/20 bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'border-border/70 bg-background/70 text-muted-foreground hover:border-primary/25 hover:bg-primary/5 hover:text-foreground'
                )}
              >
                <span className="text-lg" aria-hidden="true">{routine.emoji}</span>
                <span>{routine.name}</span>

              </Button>
            </motion.div>
          );
        })}
      </div>
    </nav>
  );
};
