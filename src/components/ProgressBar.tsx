import { BarChart3, Star, Trophy } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useStars } from '@/hooks/useRewards';
import { useSettings } from '@/hooks/useSettings';
import { useUiStore } from '@/store/ui';
interface ProgressBarProps { className?: string; progress: number; completedCount: number; totalCount: number; }
export const ProgressBar = ({ className = '', progress, completedCount, totalCount }: ProgressBarProps) => {
  const { data: settings } = useSettings();
  const childMode = settings?.mode === 'child';
  const { data: stars = 0 } = useStars({ enabled: childMode });
  const setRewardsOpen = useUiStore(s => s.setRewardsOpen);
  return <section aria-label="Today's progress" className={`rounded-2xl border border-border bg-card p-6 ${className}`}>
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="flex items-center gap-3 text-xl font-bold"><BarChart3 className="h-7 w-7 text-primary" />Today’s Progress</h2><span className="text-sm">{completedCount} of {totalCount} complete</span></div>
    <Progress value={progress} className="mt-6 h-5 bg-muted [&_[data-slot=progress-indicator]]:bg-success" aria-label={`${progress}% complete`} />
    <div className="my-5 flex items-center justify-between"><strong className="text-4xl tracking-tight">{progress}%</strong>{childMode && <button onClick={() => setRewardsOpen(true)} className="flex items-center gap-2 rounded-xl bg-muted/50 px-4 py-3 text-sm font-semibold"><Star className="h-6 w-6 text-warning" fill="currentColor" />{stars} points</button>}</div>
    <div className="flex items-center gap-4 rounded-2xl bg-success/10 p-4"><Trophy className="h-9 w-9 shrink-0 text-success" /><div><p className="font-bold">{completedCount ? 'Great job!' : 'You’ve got this!'}</p><p className="mt-1 text-sm text-muted-foreground">{completedCount ? 'Keep your streak moving.' : 'Start with one small step.'}</p></div></div>
  </section>;
};
