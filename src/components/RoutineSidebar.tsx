import { useEffect, useState } from 'react';
import { ChevronRight, Copy, Heart, List, Pencil, Settings, Timer } from 'lucide-react';
import { useUiStore } from '@/store/ui';
import { useRoutines } from '@/hooks/useRoutines';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export const RoutineSidebar = ({ canEdit, routineId, onEditRoutine, onViewRoutines }: { canEdit: boolean; routineId: string; onEditRoutine: () => void; onViewRoutines: () => void }) => {
  const { setSettingsOpen } = useUiStore();
  const { routines } = useRoutines();
  const [viewAll, setViewAll] = useState(false);
  const [breakOpen, setBreakOpen] = useState(false);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(300);
  useEffect(() => {
    if (!breakOpen || !endTime) return;
    const tick = () => setRemaining(Math.max(0, Math.ceil((endTime - Date.now()) / 1000)));
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [breakOpen, endTime]);
  const startBreak = () => { setRemaining(300); setEndTime(Date.now() + 300000); setBreakOpen(true); };
  const actionClass = 'flex min-h-14 w-full items-center gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3 sm:gap-5 sm:px-5 text-left hover:bg-muted/60';
  return <>
    <section className="rounded-2xl border border-border bg-card p-4 sm:p-6">
      <h2 className="mb-4 flex items-center gap-3 text-lg font-bold"><List className="h-5 w-5 shrink-0" />Routine Actions</h2>
      <div className="space-y-3">
        {canEdit && <button className={actionClass} disabled={!routineId} onClick={onEditRoutine}><Pencil className="h-5 w-5 shrink-0" />Edit Routine<ChevronRight className="ml-auto h-5 w-5 shrink-0" /></button>}
        <button className={actionClass} onClick={() => canEdit ? onViewRoutines() : setViewAll(true)}><Copy className="h-5 w-5 shrink-0" />View All Routines<ChevronRight className="ml-auto h-5 w-5 shrink-0" /></button>
        <button className={actionClass} onClick={() => setSettingsOpen(true)}><Settings className="h-5 w-5 shrink-0" />Settings<ChevronRight className="ml-auto h-5 w-5 shrink-0" /></button>
      </div>
    </section>
    <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-blue-50/70 p-6 dark:bg-primary/10 low-stim:bg-muted">
      <div><h2 className="flex items-center gap-3 font-bold"><Heart className="h-6 w-6 text-rose-500" fill="currentColor" />Need a break?</h2><p className="mt-3 text-sm text-muted-foreground">It’s okay to take a short break.<br />You can do this!</p></div>
      <button onClick={startBreak} className="flex items-center gap-2 rounded-full bg-blue-100 px-4 py-3 text-sm font-medium text-blue-700 dark:bg-primary/20 dark:text-foreground low-stim:bg-muted low-stim:text-foreground"><Timer className="h-5 w-5 shrink-0" />Take a Break</button>
    </section>
    <Dialog open={breakOpen} onOpenChange={setBreakOpen}><DialogContent className="max-w-sm text-center"><DialogHeader><DialogTitle>{remaining ? 'Time for a little break' : 'Ready for your next step?'}</DialogTitle><DialogDescription>Stretch, take a breath, or get a drink of water.</DialogDescription></DialogHeader><p className="py-6 text-6xl font-bold tabular-nums" role="timer" aria-label="Break time remaining">{Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}</p><p role="status">{remaining === 0 ? 'Your five-minute break is complete.' : 'Your tasks will be here when you’re ready.'}</p><button className="rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground" onClick={() => setBreakOpen(false)}>Back to my routine</button></DialogContent></Dialog>
    <Dialog open={viewAll} onOpenChange={setViewAll}><DialogContent><DialogHeader><DialogTitle>Your routines</DialogTitle><DialogDescription>Choose a routine from the tabs at the top of your day.</DialogDescription></DialogHeader>{routines.map(r => <div key={r.id} className="rounded-xl border p-4">{r.emoji} {r.name}</div>)}</DialogContent></Dialog>
  </>;
};
