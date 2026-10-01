import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect } from 'react';
import { useUiStore } from '@/store/ui';

export const MicroCelebration = () => {
  const { showMicroCelebration, microEmoji, hideMicroCelebration } = useUiStore();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!showMicroCelebration) return;
    const timer = setTimeout(hideMicroCelebration, 1600);
    return () => clearTimeout(timer);
  }, [showMicroCelebration, hideMicroCelebration]);

  return (
    <AnimatePresence>
      {showMicroCelebration && (
        <motion.div
          key="micro-celebration"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.15 }}
          className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center p-4"
        >
          <motion.div
            initial={reduceMotion ? false : { scale: 0.6, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={reduceMotion ? undefined : { scale: 0.9 }}
            transition={{ duration: reduceMotion ? 0 : 0.35, ease: 'easeOut' }}
            className="bg-transparent"
          >
            <span aria-hidden="true" className="select-none text-7xl md:text-8xl">{microEmoji}</span>
            <span role="status" className="sr-only">Step complete!</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
