import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { useUiStore } from '@/store/ui';
import { shouldReduceMotion } from '@/lib/feedback';

export const MicroCelebration = () => {
  const { showMicroCelebration, microEmoji, hideMicroCelebration } = useUiStore();

  useEffect(() => {
    if (!showMicroCelebration) return;
    const t = setTimeout(hideMicroCelebration, 600);
    return () => clearTimeout(t);
  }, [showMicroCelebration, hideMicroCelebration]);

  if (shouldReduceMotion()) return null;

  return (
    <AnimatePresence>
      {showMicroCelebration && (
        <motion.div
          key="micro-celebration"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.6, rotate: -10, opacity: 0.9 }}
            animate={{ scale: 1.2, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            aria-hidden
          >
            <span className="text-7xl md:text-8xl select-none">{microEmoji}</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
