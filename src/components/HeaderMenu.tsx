import { useState } from 'react';
import { Menu, Settings, Shield, HelpCircle, LogOut, Star } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useUiStore } from '@/store/ui';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/hooks/useSettings';
import { useStars } from '@/hooks/useRewards';

export const HeaderMenu = () => {
  const [open, setOpen] = useState(false);
  const { data: settings } = useSettings();
  const { storageMode, isAuthenticated, logout } = useAuth();
  const { setSettingsOpen, setRewardsOpen, setAdminOpen } = useUiStore();

  const isChildMode = settings?.mode === 'child';
  const { data: stars = 0 } = useStars({ enabled: isChildMode });
  const canAccessAdmin = settings?.userRole === 'parent' || settings?.userRole === 'guardian';

  const onOpenChange = (val: boolean) => setOpen(val);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="p-2 sm:hidden"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-xs">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-2 py-4" aria-label="Header menu">
            {isChildMode && (
              <Button
                variant="ghost"
                className="justify-between gap-2"
                onClick={() => { setRewardsOpen(true); setOpen(false); }}
                aria-label={`Open rewards. You have ${stars} stars.`}
              >
                <span className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Rewards
                </span>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-semibold bg-warning/10 text-warning"
                  aria-live="polite"
                >
                  {stars}
                </span>
              </Button>
            )}

            {canAccessAdmin && (
              <Button
                variant="ghost"
                className="justify-start gap-2"
                onClick={() => { setAdminOpen(true); setOpen(false); }}
                aria-label="Open admin"
              >
                <Shield className="h-4 w-4" />
                Admin
              </Button>
            )}

            <Button
              variant="ghost"
              className="justify-start gap-2"
              onClick={() => { setSettingsOpen(true); setOpen(false); }}
              aria-label="Open settings"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>

            {/* Keyboard shortcuts hint: open via '?' key or keep Help button in header on larger screens */}
            <div className="mt-4 text-xs text-muted-foreground flex items-center gap-2 pl-2">
              <HelpCircle className="h-4 w-4" />
              Press ? for keyboard shortcuts
            </div>

            {storageMode === 'api' && isAuthenticated && (
              <Button
                variant="outline"
                size="sm"
                className="justify-center gap-2 mt-4 w-auto mx-auto"
                onClick={() => { logout(); setOpen(false); }}
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
};
