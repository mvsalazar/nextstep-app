import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRoutines } from '@/hooks/useRoutines';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RoutineSelectorProps {
  currentRoutineId: string;
  onRoutineChange: (routineId: string) => void;
  smartSelected?: boolean; // indicates if this was auto-selected
}

export const RoutineSelector = ({ currentRoutineId, onRoutineChange, smartSelected = false }: RoutineSelectorProps) => {
  const { routines, isLoading } = useRoutines();
  
  const currentIndex = routines.findIndex(r => r.id === currentRoutineId);
  
  const goToPrevious = () => {
    if (routines.length === 0) return;
    const prevIndex = currentIndex <= 0 ? routines.length - 1 : currentIndex - 1;
    onRoutineChange(routines[prevIndex].id);
  };
  
  const goToNext = () => {
    if (routines.length === 0) return;
    const nextIndex = currentIndex >= routines.length - 1 ? 0 : currentIndex + 1;
    onRoutineChange(routines[nextIndex].id);
  };

  if (isLoading || routines.length === 0) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="h-8 w-32 bg-slate-200 rounded-lg animate-pulse" />
      </div>
    );
  }

  const currentRoutine = routines[currentIndex];

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white/80 backdrop-blur-sm border-b border-slate-200">
      <Button
        variant="ghost"
        size="sm"
        onClick={goToPrevious}
        disabled={routines.length <= 1}
        className="p-2"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center gap-2">
        {currentRoutine && (
          <motion.div
            key={currentRoutine.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2"
          >
            <span 
              className="text-2xl"
              style={{ color: currentRoutine.color }}
            >
              {currentRoutine.emoji}
            </span>
            <span className="font-medium text-lg text-slate-800">
              {currentRoutine.name}
              {smartSelected && (
                <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  Auto
                </span>
              )}
            </span>
          </motion.div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={goToNext}
          disabled={routines.length <= 1}
          className="p-2"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        {/* Settings button removed for now */}
      </div>
      
      {/* Routine dots indicator */}
      {routines.length > 1 && (
        <div className="absolute left-1/2 transform -translate-x-1/2 bottom-0 flex gap-1 pb-1">
          {routines.map((routine, index) => (
            <button
              key={routine.id}
              onClick={() => onRoutineChange(routine.id)}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                index === currentIndex 
                  ? "bg-slate-600" 
                  : "bg-slate-300 hover:bg-slate-400"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};