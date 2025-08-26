import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  GripVertical,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRoutines } from '@/hooks/useRoutines';
import { useTasks } from '@/hooks/useTasks';
import type { Routine } from '@/types';

interface RoutineManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RoutineFormData {
  name: string;
  emoji: string;
  color: string;
  active: boolean;
}

const ROUTINE_COLORS = [
  '#fbbf24', // amber
  '#60a5fa', // blue  
  '#a78bfa', // purple
  '#34d399', // emerald
  '#f87171', // red
  '#fb923c', // orange
  '#06b6d4', // cyan
  '#8b5cf6', // violet
];

const ROUTINE_EMOJIS = [
  '🌅', '🏠', '🌙', '🍽️', '📚', '🧘', '🏃', '🎯', 
  '🌟', '⭐', '🎨', '🎵', '🚿', '🧼', '👶', '🎪'
];

export const RoutineManager = ({ isOpen, onClose }: RoutineManagerProps) => {
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<RoutineFormData>({
    name: '',
    emoji: '🌅',
    color: '#fbbf24',
    active: true,
  });

  const { routines, createRoutine, updateRoutine, deleteRoutine } = useRoutines();
  const { data: allTasks = [] } = useTasks();

  const handleCreateNew = () => {
    setIsCreating(true);
    setFormData({
      name: '',
      emoji: '🌅',
      color: '#fbbf24',
      active: true,
    });
  };

  const handleEdit = (routine: Routine) => {
    setEditingRoutine(routine);
    setFormData({
      name: routine.name,
      emoji: routine.emoji,
      color: routine.color || '#fbbf24',
      active: routine.active,
    });
  };

  const handleSave = () => {
    if (!formData.name.trim()) return;

    if (isCreating) {
      createRoutine({
        ...formData,
        order: routines.length + 1,
      });
      setIsCreating(false);
    } else if (editingRoutine) {
      updateRoutine({ 
        id: editingRoutine.id, 
        updates: formData 
      });
      setEditingRoutine(null);
    }

    setFormData({
      name: '',
      emoji: '🌅',
      color: '#fbbf24',
      active: true,
    });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingRoutine(null);
    setFormData({
      name: '',
      emoji: '🌅',
      color: '#fbbf24',
      active: true,
    });
  };

  const handleDelete = (routineId: string) => {
    if (window.confirm('Are you sure you want to delete this routine? All associated tasks will also be deleted.')) {
      deleteRoutine(routineId);
    }
  };

  const getRoutineStats = (routineId: string) => {
    const routineTasks = allTasks.filter(task => task.routineId === routineId);
    const completedTasks = routineTasks.filter(task => task.done).length;
    return { total: routineTasks.length, completed: completedTasks };
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Manage Routines
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Create/Edit Form */}
          <AnimatePresence>
            {(isCreating || editingRoutine) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <Card className="p-4 border-dashed border-2">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="routine-name">Routine Name</Label>
                        <Input
                          id="routine-name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Morning Routine"
                        />
                      </div>
                      <div>
                        <Label htmlFor="routine-emoji">Emoji</Label>
                        <Select 
                          value={formData.emoji} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, emoji: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROUTINE_EMOJIS.map(emoji => (
                              <SelectItem key={emoji} value={emoji}>
                                <span className="text-xl">{emoji}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Color Theme</Label>
                      <div className="flex gap-2 mt-2">
                        {ROUTINE_COLORS.map(color => (
                          <button
                            key={color}
                            onClick={() => setFormData(prev => ({ ...prev, color }))}
                            className={`w-8 h-8 rounded-full border-2 transition-all ${
                              formData.color === color ? 'border-slate-800 scale-110' : 'border-slate-300'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleSave} size="sm">
                        <Save className="h-4 w-4 mr-2" />
                        {isCreating ? 'Create Routine' : 'Save Changes'}
                      </Button>
                      <Button variant="outline" onClick={handleCancel} size="sm">
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Add New Button */}
          {!isCreating && !editingRoutine && (
            <Button onClick={handleCreateNew} variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add New Routine
            </Button>
          )}

          {/* Routines List */}
          <div className="space-y-3">
            {routines.map((routine) => {
              const stats = getRoutineStats(routine.id);
              const progress = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

              return (
                <motion.div
                  key={routine.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group"
                >
                  <Card className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="cursor-grab">
                        <GripVertical className="h-5 w-5 text-slate-400" />
                      </div>

                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                        style={{ backgroundColor: `${routine.color}20`, color: routine.color }}
                      >
                        {routine.emoji}
                      </div>

                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{routine.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span>{stats.total} tasks</span>
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>{stats.completed} completed</span>
                          </div>
                          <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500 transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(routine)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(routine.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {routines.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No routines yet. Create your first routine to get started!
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};