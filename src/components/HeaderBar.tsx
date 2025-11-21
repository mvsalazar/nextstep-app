import { Star, Settings, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useStars } from '@/hooks/useRewards';
import { useSettings } from '@/hooks/useSettings';
import { useUiStore } from '@/store/ui';
import { KeyboardHelp } from './KeyboardHelp';
import { cn } from '@/lib/utils';
import nextstepLogo from '@/assets/next_step_logo.png';
import { HeaderMenu } from '@/components/HeaderMenu';

export const HeaderBar = () => {
  const { data: settings } = useSettings();
  const isChildMode = settings?.mode === 'child';
  const { data: stars = 0 } = useStars({ enabled: isChildMode });
  const { setSettingsOpen, setRewardsOpen, setAdminOpen } = useUiStore();

  const isLowStim = settings?.theme === 'lowstim';
  const canAccessAdmin = settings?.userRole === 'parent' || settings?.userRole === 'guardian'; // Parents/guardians can access admin

  return (
    <div className="sticky top-0 z-10 bg-card border-b border-border">
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
          {/* Child Switcher */}
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
                    ? 'bg-muted text-muted-foreground hover:bg-slate-200' 
                    : 'bg-warning/10 text-warning hover:bg-warning/20'
                )}
                role="button"
                aria-label={`You have ${stars} stars. Click to view rewards.`}
              >
                <Star 
                  className={cn(
                    'h-4 w-4',
                    isLowStim ? 'text-muted-foreground' : 'text-warning'
                  )} 
                  fill="currentColor" 
                />
                <span className="font-semibold tabular-nums">{stars}</span>
              </motion.button>
            </>
          )}

          {canAccessAdmin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAdminOpen(true)}
              className="p-2 text-warning hover:text-warning hover:bg-warning/10 hidden sm:inline-flex"
              aria-label="Admin access"
            >
              <Shield className="h-5 w-5" />
            </Button>
          )}

          <div className="hidden sm:block">
            <KeyboardHelp />
          </div>
          
          {/* Sign out removed from main header; available in Settings and Menu */}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSettingsOpen(true)}
            className="p-2 hidden sm:inline-flex"
            aria-label="Open settings"
          >
            <Settings className="h-5 w-5" />
          </Button>

          {/* Hamburger menu (mobile) */}
          <HeaderMenu />
        </div>
      </div>
    </header>
  </div>
  );
};
