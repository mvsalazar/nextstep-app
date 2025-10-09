import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

interface ProgressBarProps {
  className?: string;
  progress: number;
  completedCount: number;
  totalCount: number;
}

export const ProgressBar = ({ className, progress, completedCount, totalCount }: ProgressBarProps) => {

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-foreground">
          Daily Progress
        </span>
        <span className="text-sm text-muted-foreground">
          {completedCount} of {totalCount} complete
        </span>
      </div>
      <div className="relative">
        <Progress 
          value={progress} 
          className="h-3"
          aria-label={`Progress: ${progress}% complete, ${completedCount} of ${totalCount} tasks done`}
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-success rounded-full opacity-80"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="text-center mt-2">
        <motion.span
          key={progress}
          initial={{ scale: 0.9, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-lg font-bold text-foreground"
        >
          {progress}%
        </motion.span>
      </div>
    </div>
  );
};
