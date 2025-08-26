import { useState } from 'react';
import { Download, Upload } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSettings, useUpdateSettings } from '@/hooks/useSettings';
import { useUiStore } from '@/store/ui';
import { toast } from 'sonner';
import { loadAppState, saveAppState } from '@/adapters/local/storage';

export const SettingsSheet = () => {
  const { data: settings } = useSettings();
  const updateSettings = useUpdateSettings();
  const { isSettingsOpen, setSettingsOpen } = useUiStore();
  const [importing, setImporting] = useState(false);

  const handleModeChange = (isChild: boolean) => {
    updateSettings.mutate({ mode: isChild ? 'child' : 'adult' });
  };

  const handleThemeChange = (theme: 'light' | 'lowstim') => {
    updateSettings.mutate({ theme });
  };

  const handleStorageModeChange = (storageMode: 'api' | 'local') => {
    updateSettings.mutate({ storageMode });
    toast.info(`Switched to ${storageMode} mode. Refresh the page to see changes.`);
  };

  const handleRoleChange = (userRole: 'child' | 'parent' | 'guardian') => {
    updateSettings.mutate({ 
      userRole,
      mode: userRole === 'child' ? 'child' : 'adult' // Auto-set mode based on role
    });
    if (userRole === 'child') {
      toast.success('Switched back to child mode');
    }
  };

  const handleExport = () => {
    try {
      const appState = loadAppState();
      const dataStr = JSON.stringify(appState, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `nextstep-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setImporting(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          saveAppState(data);
          toast.success('Data imported successfully! Refreshing page...');
          setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
          console.error('Import error:', error);
          toast.error('Invalid backup file format');
        } finally {
          setImporting(false);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  if (!settings) return null;

  return (
    <Sheet open={isSettingsOpen} onOpenChange={setSettingsOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-6 px-6">
          {/* User Role */}
          <div className="space-y-3">
            <Label className="text-base font-medium">User Role</Label>
            <Select value={settings.userRole} onValueChange={handleRoleChange}>
              <SelectTrigger>
                <SelectValue>
                  {settings.userRole === 'child' && 'Child'}
                  {settings.userRole === 'parent' && 'Parent'}
                  {settings.userRole === 'guardian' && 'Guardian'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="child">Child</SelectItem>
                <SelectItem value="parent">Parent</SelectItem>
                <SelectItem value="guardian">Guardian</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              {settings.userRole === 'child' 
                ? 'Child interface with rewards and simple controls' 
                : 'Parent/Guardian interface with full management access'
              }
            </p>
          </div>

          {/* Mode Toggle (only for non-child users) */}
          {settings.userRole !== 'child' && (
            <div className="space-y-3">
              <Label className="text-base font-medium">Interface Mode</Label>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-600">
                    {settings.mode === 'child' ? 'Child Mode' : 'Adult Mode'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {settings.mode === 'child' 
                      ? 'Shows stars and celebrations' 
                      : 'Minimal interface without rewards'
                    }
                  </p>
                </div>
                <Switch
                  checked={settings.mode === 'child'}
                  onCheckedChange={handleModeChange}
                  aria-label="Toggle between child and adult mode"
                  className="flex-shrink-0"
                />
              </div>
            </div>
          )}

          {/* Theme Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Visual Theme</Label>
            <Select value={settings.theme} onValueChange={handleThemeChange}>
              <SelectTrigger>
                <SelectValue>
                  {settings.theme === 'light' && 'Light Theme'}
                  {settings.theme === 'lowstim' && 'Low-Stim Theme'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light Theme</SelectItem>
                <SelectItem value="lowstim">Low-Stim Theme</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              {settings.theme === 'light' 
                ? 'Standard colorful interface' 
                : 'Muted colors with reduced animations'
              }
            </p>
          </div>

          {/* Storage Mode */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Data Storage</Label>
            <Select value={settings.storageMode} onValueChange={handleStorageModeChange}>
              <SelectTrigger>
                <SelectValue>
                  {settings.storageMode === 'local' && 'Local Storage'}
                  {settings.storageMode === 'api' && 'API Server'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local">Local Storage</SelectItem>
                <SelectItem value="api">API Server</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              {settings.storageMode === 'local' 
                ? 'Data saved in browser storage' 
                : 'Data synced with remote server'
              }
            </p>
          </div>

          {/* Import/Export */}
          {settings.storageMode === 'local' && (
            <div className="space-y-3">
              <Label className="text-base font-medium">Backup & Restore</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="flex-1 gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleImport}
                  disabled={importing}
                  className="flex-1 gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {importing ? 'Importing...' : 'Import'}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Export your data as a backup or import from a previous backup
              </p>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSettingsOpen(false)}
          className="absolute right-4 top-4 p-2"
          aria-label="Close settings"
        >
        </Button>
      </SheetContent>
    </Sheet>
  );
};