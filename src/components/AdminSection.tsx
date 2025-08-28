import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Plus, 
  Edit3, 
  Eye, 
  EyeOff,
  Settings,
  Users,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSettings, useUpdateSettings } from '@/hooks/useSettings';
import { useRoutines } from '@/hooks/useRoutines';
import { useTasks } from '@/hooks/useTasks';
import { useCurrentDate } from '@/hooks/useSettings';
import { useUiStore } from '@/store/ui';

interface AdminSectionProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSection = ({ isOpen, onClose }: AdminSectionProps) => {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [authError, setAuthError] = useState('');
  
  const { data: settings } = useSettings();
  const updateSettings = useUpdateSettings();
  const { routines } = useRoutines();
  const { currentDate } = useCurrentDate();
  const { data: allTasks = [] } = useTasks(undefined, currentDate);
  const { setRoutineManagerOpen, setSettingsOpen } = useUiStore();

  const handlePinSubmit = () => {
    const adminPin = settings?.adminPin || '1234'; // Default PIN
    
    if (pin === adminPin) {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Incorrect PIN');
      setPin('');
    }
  };

  const handleClose = () => {
    setIsAuthenticated(false);
    setPin('');
    setAuthError('');
    onClose();
  };

  const switchToParentMode = () => {
    updateSettings.mutate({ 
      userRole: 'parent',
      mode: 'adult' 
    });
    handleClose();
  };

  const handleAddRoutine = () => {
    setRoutineManagerOpen(true);
    handleClose();
  };

  const handleEditRoutines = () => {
    setRoutineManagerOpen(true);
    handleClose();
  };

  const handleAppSettings = () => {
    setSettingsOpen(true);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-600" />
            Admin Access
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!isAuthenticated ? (
            <motion.div
              key="auth"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="text-sm text-slate-600 mb-4">
                Enter the admin PIN to access parent controls
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="admin-pin">Admin PIN</Label>
                <div className="relative">
                  <Input
                    id="admin-pin"
                    type={showPin ? "text" : "password"}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()}
                    placeholder="Enter PIN"
                    maxLength={6}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPin(!showPin)}
                  >
                    {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {authError && (
                  <p className="text-sm text-red-600">{authError}</p>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={handlePinSubmit} className="flex-1">
                  Access Admin
                </Button>
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="grid gap-4">
                <Card className="p-4">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Management
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Current Role: {settings?.userRole}</span>
                      <span className="text-sm">Mode: {settings?.mode}</span>
                    </div>
                    
                    <Button
                      onClick={switchToParentMode}
                      variant="outline"
                      className="w-full"
                    >
                      Switch to Parent Mode
                    </Button>
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Routine Overview
                  </h3>
                  
                  <div className="space-y-2">
                    {routines.map(routine => {
                      const routineTasks = allTasks.filter(t => t.routineId === routine.id);
                      const completedTasks = routineTasks.filter(t => t.done).length;
                      
                      return (
                        <div key={routine.id} className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <span>{routine.emoji}</span>
                            {routine.name}
                          </span>
                          <span className="text-slate-600">
                            {completedTasks}/{routineTasks.length}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Quick Actions
                  </h3>
                  
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={handleAddRoutine}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Routine
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={handleEditRoutines}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Routines
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={handleAppSettings}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      App Settings
                    </Button>
                  </div>
                </Card>
              </div>

              <Button variant="outline" onClick={handleClose} className="w-full">
                Close Admin Panel
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
