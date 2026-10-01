import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, X, Clock, Bell, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateTask, useUpdateTask, useCreateTemplate, useDeleteTask } from '@/hooks/useTasks';
import { useSettings } from '@/hooks/useSettings';
import { toast } from 'sonner';

import type { Task, PrimeOffset } from '@/types';

const TASK_EMOJIS = [
  '🪥', '👕', '🥣', '🎒', '📚', '🧼', '🚿', '👘', '📖', '🛏️',
  '🍎', '🥛', '🧸', '🎯', '🎨', '🎵', '🏃', '🧘', '🌟', '⭐'
];

const PRIME_OPTIONS: { value: PrimeOffset; label: string }[] = [
  { value: 10, label: '10 minutes' },
  { value: 5, label: '5 minutes' },
  { value: 1, label: '1 minute' },
];

interface TaskEditModalProps {
  task?: Task | null;
  routineId: string;
  date: string;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskEditModal = ({ task, routineId, date, isOpen, onClose }: TaskEditModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    emoji: '🪥',
    dueTime: '',
    prime: [] as PrimeOffset[],
  });
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);

  const { data: settings } = useSettings();
  const createTask = useCreateTask();
  const createTemplate = useCreateTemplate();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  // const { selectedTaskId } = useUiStore(); // TODO: Use for task selection

  const isEditing = !!task;
  const isParentMode = settings?.userRole === 'parent' || settings?.userRole === 'guardian';

  // Initialize form data when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        emoji: task.emoji,
        dueTime: task.dueTime || '',
        prime: task.prime || [],
      });
    } else {
      setFormData({
        title: '',
        emoji: '🪥',
        dueTime: '',
        prime: [],
      });
    }
  }, [task]);

  const handleSave = async () => {
    if (!formData.title.trim() || !routineId) return;
    
    // Only allow parents/guardians to create new tasks
    if (!isEditing && !isParentMode) {
      toast.error('Only parents/guardians can create tasks');
      return;
    }
    
    const taskData = {
      title: formData.title.trim(),
      emoji: formData.emoji,
      dueTime: formData.dueTime || undefined,
      prime: formData.prime.length > 0 ? formData.prime : undefined,
      routineId: routineId,
      childId: settings?.currentChildId || undefined,
      date: date,
      done: false,
      isTemplate: false, // Daily tasks are not templates
      order: 999, // Will be reordered by the system
    };

    try {
      if (isEditing && task) {
        await updateTask.mutateAsync({
          id: task.id,
          updates: taskData,
        });
      } else {
        // Optionally create a template for future days
        if (saveAsTemplate) {
          const tplData = {
            title: formData.title.trim(),
            emoji: formData.emoji,
            dueTime: formData.dueTime || undefined,
            prime: formData.prime.length > 0 ? formData.prime : undefined,
            routineId: routineId,
            childId: settings?.currentChildId || undefined,
            done: false,
            isTemplate: true,
            order: 999,
          } as Omit<Task, 'id' | 'updatedAt' | 'version'>;
          try { await createTemplate.mutateAsync(tplData); } catch (e) { toast.warning('Template creation failed: ' + e); }
        }

        await createTask.mutateAsync(taskData);
      }
      onClose();
    } catch (error) {
      toast.error('Failed to save task: ' + error)
    }
  };

  const handleDelete = async () => {
    if (!task?.id) return;

    if (!isParentMode) {
      toast.warning('Only parents/guardians can delete tasks');
      return;
    }

    try {
      await deleteTask.mutateAsync(task.id);
      toast.success('Deleted Task: ' + task.title);
      onClose();
    } catch (error) {
      toast.error('Failed to delete task:' + error);
    }
  };

  const handlePrimeToggle = (primeValue: PrimeOffset) => {
    setFormData(prev => ({
      ...prev,
      prime: prev.prime.includes(primeValue)
        ? prev.prime.filter(p => p !== primeValue)
        : [...prev.prime, primeValue].sort((a, b) => b - a), // Sort desc: 10, 5, 1
    }));
  };

  const canSave = formData.title.trim().length > 0;

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{isEditing ? 'Edit Task' : 'Add New Task'}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Task Title */}
          <div className="space-y-2">
            <Label htmlFor="task-title">Task Name</Label>
            <Input
              id="task-title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Brush teeth"
              maxLength={50}
            />
          </div>

          {/* Emoji Selection */}
          <div className="space-y-2">
            <Label htmlFor="task-emoji">Emoji</Label>
            <Select 
              value={formData.emoji} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, emoji: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <div className="grid grid-cols-5 gap-1 p-2">
                  {TASK_EMOJIS.map(emoji => (
                    <SelectItem key={emoji} value={emoji} className="flex items-center justify-center">
                      <span className="text-xl">{emoji}</span>
                    </SelectItem>
                  ))}
                </div>
              </SelectContent>
            </Select>
          </div>

          {/* Due Time (Parent Mode Only) */}
          {isParentMode && (
            <div className="space-y-2">
              <Label htmlFor="task-due-time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Due Time (Optional)
              </Label>
              <Input
                id="task-due-time"
                type="time"
                value={formData.dueTime}
                onChange={(e) => setFormData(prev => ({ ...prev, dueTime: e.target.value }))}
              />
            </div>
          )}

          {/* Prime Reminders (Parent Mode Only) */}
          {isParentMode && formData.dueTime && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Remind Me Before
              </Label>
              <div className="flex flex-wrap gap-2">
                {PRIME_OPTIONS.map(option => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={formData.prime.includes(option.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePrimeToggle(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Save as Template Toggle */}
          {isParentMode && !isEditing && (
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <Label className="text-sm">Save as template (recurring)</Label>
                <p className="text-xs text-muted-foreground">Adds to this routine for future days</p>
              </div>
              <input
                type="checkbox"
                checked={saveAsTemplate}
                onChange={(e) => setSaveAsTemplate(e.target.checked)}
                aria-label="Save as template (recurring)"
                className="h-4 w-4 accent-primary"
              />
            </div>
          )}

          {/* Non-parent mode message */}
          {!isEditing && !isParentMode && (
            <div className="mt-4 rounded-md bg-muted p-3">
              <p className="text-sm text-muted-foreground">
                Only parents and guardians can create new tasks.
              </p>
            </div>
          )}
          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-4 sm:flex-row sm:flex-wrap">
            <Button
              onClick={handleSave}
              disabled={!canSave || createTask.isPending || createTemplate.isPending || updateTask.isPending || (!isEditing && !isParentMode)}
              className="w-full sm:flex-1"
            >
              {createTask.isPending || updateTask.isPending ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? 'Save Changes' : 'Add Task'}
                </>
              )}
            </Button>
            {isEditing && isParentMode && (
              <Button
                  variant="outline"
                  onClick={handleDelete}
                  disabled={deleteTask.isPending}
                  className="w-full text-red-600 hover:text-red-700 sm:w-auto"
                >
                  {deleteTask.isPending ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full"
                    />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Delete Task
                </Button>
            )}
              
            
            <Button
              variant="outline"
              onClick={onClose}
              disabled={createTask.isPending || updateTask.isPending}
              className="w-full sm:w-auto"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
