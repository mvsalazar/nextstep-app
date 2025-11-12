import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTemplates } from '@/hooks/useTemplates';
import { useReorderTasks } from '@/hooks/useTasks';
import { useSettings } from '@/hooks/useSettings';
import type { PrimeOffset, Task } from '@/types';

const EMOJIS = ['🪥','👕','🥣','🎒','📚','🧼','🚿','👘','📖','🛏️','🍎','🧸','🎯','🎨','🎵','🏃','🧘','⭐'];
const PRIME_OPTIONS: { value: PrimeOffset; label: string }[] = [
  { value: 10, label: '10 minutes' },
  { value: 5, label: '5 minutes' },
  { value: 1, label: '1 minute' },
];

interface TemplateManagerProps {
  isOpen: boolean;
  routineId: string | null;
  onClose: () => void;
}

export const TemplateManager = ({ isOpen, routineId, onClose }: TemplateManagerProps) => {
  const { templates, isLoading, createTemplate, updateTemplate, deleteTemplate, isCreating, isDeleting } = useTemplates(routineId || undefined);
  const { data: settings } = useSettings();
  const [newTpl, setNewTpl] = useState<{ title: string; emoji: string; dueTime: string; prime: PrimeOffset[] }>({ title: '', emoji: '🪥', dueTime: '', prime: [] });
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const reorder = useReorderTasks();

  const handlePrimeToggle = (p: PrimeOffset) => {
    setNewTpl((prev) => ({ ...prev, prime: prev.prime.includes(p) ? prev.prime.filter(v => v !== p) : [...prev.prime, p].sort((a,b)=>b-a) }));
  };

  const handleAdd = async () => {
    if (!routineId || !newTpl.title.trim()) return;
    const tpl: Omit<Task,'id'|'updatedAt'|'version'> = {
      title: newTpl.title.trim(),
      emoji: newTpl.emoji,
      dueTime: newTpl.dueTime || undefined,
      prime: newTpl.prime.length ? newTpl.prime : undefined,
      routineId,
      childId: settings?.currentChildId || undefined,
      done: false,
      isTemplate: true,
      order: (templates?.length || 0) + 1,
    };
    await createTemplate(tpl);
    setNewTpl({ title: '', emoji: '🪥', dueTime: '', prime: [] });
  };

  const handleUpdate = async (id: string, updates: Partial<Task>) => {
    await updateTemplate({ id, updates });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this template?')) return;
    await deleteTemplate(id);
  };

  // Drag & drop reordering (keyboard and mouse accessible)
  const onDragStart = (index: number) => setDragIndex(index);
  const onDragOver = (e: React.DragEvent) => e.preventDefault();
  const onDrop = async (toIndex: number) => {
    if (dragIndex === null || dragIndex === toIndex || !routineId) { setDragIndex(null); return; }
    const ordered = [...templates].sort((a,b)=>a.order-b.order);
    const moved = ordered.splice(dragIndex, 1)[0];
    ordered.splice(toIndex, 0, moved);
    const taskIds = ordered.map(t => t.id);
    // Persist new order (MSW updates order for all tasks under routineId)
    reorder.mutate({ routineId, taskIds });
    setDragIndex(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Templates</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add new template */}
          <div className="rounded-lg border p-4 bg-card">
            <h3 className="text-sm font-semibold mb-3 text-foreground">Add Template</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div className="space-y-1 sm:col-span-2">
                <Label>Title</Label>
                <Input value={newTpl.title} onChange={(e) => setNewTpl(v => ({ ...v, title: e.target.value }))} placeholder="e.g., Brush teeth" />
              </div>
              <div className="space-y-1">
                <Label>Emoji</Label>
                <Select value={newTpl.emoji} onValueChange={(v) => setNewTpl(prev => ({ ...prev, emoji: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EMOJIS.map(e => (<SelectItem key={e} value={e}>{e}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Due time (optional)</Label>
                <Input type="time" value={newTpl.dueTime} onChange={(e) => setNewTpl(v => ({ ...v, dueTime: e.target.value }))} />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label>Prime reminders</Label>
                <div className="flex flex-wrap gap-2">
                  {PRIME_OPTIONS.map(o => (
                    <Button key={o.value} type="button" variant={newTpl.prime.includes(o.value) ? 'default' : 'outline'} size="sm" onClick={() => handlePrimeToggle(o.value)}>
                      {o.label}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="sm:col-span-3">
                <Button onClick={handleAdd} disabled={!newTpl.title.trim() || isCreating}>Add Template</Button>
              </div>
            </div>
          </div>

          {/* Existing templates */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Templates ({templates.length})</h3>
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Loading templates…</div>
            ) : templates.length === 0 ? (
              <div className="text-sm text-muted-foreground">No templates yet. Add recurring steps above.</div>
            ) : (
              <div className="space-y-2">
                {templates.sort((a,b) => a.order - b.order).map((t, idx) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 rounded-md border bg-card p-3"
                    draggable
                    onDragStart={() => onDragStart(idx)}
                    onDragOver={onDragOver}
                    onDrop={() => onDrop(idx)}
                    role="listitem"
                    aria-grabbed={dragIndex === idx}
                  >
                    <span className="text-xl">{t.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <Input value={t.title} onChange={(e) => handleUpdate(t.id, { title: e.target.value })} className="h-8" />
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Label className="text-xs">Time</Label>
                          <Input type="time" value={t.dueTime || ''} onChange={(e) => handleUpdate(t.id, { dueTime: e.target.value })} className="h-7 w-28" />
                        </div>
                        <div className="flex items-center gap-1">
                          <Label className="text-xs">Prime</Label>
                          <span>{t.prime?.join(', ') || '—'}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(t.id)} disabled={isDeleting}>Delete</Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
