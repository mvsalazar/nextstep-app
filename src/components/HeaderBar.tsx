import { Star, Settings, Gift, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useStars } from '@/hooks/useRewards';
import { useSettings } from '@/hooks/useSettings';
import { useUiStore } from '@/store/ui';
import { KeyboardHelp } from './KeyboardHelp';
import { cn } from '@/lib/utils';
import nextstepLogo from '@/assets/next_step_logo.png';

export const HeaderBar = () => {
  const { data: stars = 0 } = useStars();
  const { data: settings } = useSettings();
  const { setSettingsOpen, setRewardsOpen, setAdminOpen } = useUiStore();

  const isChildMode = settings?.mode === 'child';
  const isLowStim = settings?.theme === 'lowstim';
  const canAccessAdmin = settings?.userRole === 'parent' || settings?.userRole === 'guardian'; // Parents/guardians can access admin

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
      <header className="px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => {
                // Could add navigation to today or home view here if needed
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
              aria-label="NextStep Home"
            >
              <img 
                src={nextstepLogo} 
                alt="NextStep Logo" 
                className="h-10 w-auto hover:opacity-90 transition-opacity"
              />
            </button>
          </div>

        <div className="flex items-center gap-2">
          {isChildMode && (
            <>
              <motion.button
                key={stars}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                onClick={() => setRewardsOpen(true)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-full transition-colors',
                  isLowStim 
                    ? 'bg-low-stim-200 text-low-stim-800 hover:bg-low-stim-300' 
                    : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                )}
                role="button"
                aria-label={`You have ${stars} stars. Click to view rewards.`}
              >
                <Star 
                  className={cn(
                    'h-4 w-4',
                    isLowStim ? 'text-low-stim-600' : 'text-yellow-600'
                  )} 
                  fill="currentColor" 
                />
                <span className="font-semibold tabular-nums">{stars}</span>
              </motion.button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRewardsOpen(true)}
                className="p-2"
                aria-label="View rewards"
              >
                <Gift className="h-5 w-5" />
              </Button>
            </>
          )}

          {canAccessAdmin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAdminOpen(true)}
              className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
              aria-label="Admin access"
            >
              <Shield className="h-5 w-5" />
            </Button>
          )}

          <KeyboardHelp />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSettingsOpen(true)}
            className="p-2"
            aria-label="Open settings"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  </div>
  );
};