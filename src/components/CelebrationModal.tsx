import { motion, AnimatePresence } from 'framer-motion';
import { Star, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUiStore } from '@/store/ui';
import { useSettings } from '@/hooks/useSettings';

export const CelebrationModal = () => {
  const { showCelebration, celebrationStars, hideCelebration } = useUiStore();
  const { data: settings } = useSettings();

  const isLowStim = settings?.theme === 'lowstim';

  const getMessage = (stars: number) => {
    if (stars >= 50) return "Incredible! You're on fire! 🔥";
    if (stars >= 20) return "Amazing work! You're a superstar! ⭐";
    if (stars >= 10) return "Fantastic! Keep it up! 🌟";
    if (stars >= 5) return "Great job! You earned a reward! 🎉";
    return "Well done! 👏";
  };

  const getRewardMessage = (stars: number) => {
    if (stars >= 20) return "You've unlocked something extra special!";
    if (stars >= 10) return "Time for an awesome reward!";
    if (stars >= 5) return "You've earned your first reward!";
    return "Keep going for more rewards!";
  };

  return (
    <Dialog open={showCelebration} onOpenChange={hideCelebration}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            🎉 Celebration Time! 🎉
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center py-6">
          <AnimatePresence>
            {!isLowStim && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ 
                  scale: [0, 1.2, 1],
                  rotate: [0, 180, 360]
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ 
                  duration: 0.6,
                  times: [0, 0.6, 1],
                  type: "spring",
                  stiffness: 200
                }}
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-4"
              >
                <Star className="h-10 w-10 text-white" fill="currentColor" />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-gray-900 mb-2"
          >
            {celebrationStars} Stars Reached!
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-gray-700 mb-2"
          >
            {getMessage(celebrationStars)}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-gray-600 mb-6"
          >
            {getRewardMessage(celebrationStars)}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              onClick={hideCelebration}
              className="px-8 py-2"
              autoFocus
            >
              Awesome! 
            </Button>
          </motion.div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={hideCelebration}
          className="absolute right-4 top-4 p-2"
          aria-label="Close celebration"
        >
          <X className="h-4 w-4" />
        </Button>
      </DialogContent>
    </Dialog>
  );
};