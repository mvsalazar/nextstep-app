import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, X, Clock, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateTask, useUpdateTask } from '@/hooks/useTasks';
import { useSettings } from '@/hooks/useSettings';
import { useUiStore } from '@/store/ui';
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
  isOpen: boolean;
  onClose: () => void;
}

export const TaskEditModal = ({ task, isOpen, onClose }: TaskEditModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    emoji: '🪥',
    dueTime: '',
    prime: [] as PrimeOffset[],
  });

  const { data: settings } = useSettings();
  const currentRoutineId = settings?.currentRoutineId;
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const { selectedTaskId } = useUiStore();

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
    if (!formData.title.trim() || !currentRoutineId) return;

    const taskData = {
      title: formData.title.trim(),
      emoji: formData.emoji,
      dueTime: formData.dueTime || undefined,
      prime: formData.prime.length > 0 ? formData.prime : undefined,
      routineId: currentRoutineId,
      done: false,
      order: 999, // Will be reordered by the system
    };

    try {
      if (isEditing && task) {
        await updateTask.mutateAsync({
          id: task.id,
          updates: taskData,
        });
      } else {
        await createTask.mutateAsync(taskData);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save task:', error);
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

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={!canSave || createTask.isPending || updateTask.isPending}
              className="flex-1"
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
            
            <Button
              variant="outline"
              onClick={onClose}
              disabled={createTask.isPending || updateTask.isPending}
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