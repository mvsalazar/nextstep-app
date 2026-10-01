import { HelpCircle, Keyboard } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUiStore } from '@/store/ui';

const shortcuts = [
  { key: '↑/↓ or j/k', description: 'Navigate through tasks' },
  { key: 'Enter/Space', description: 'Toggle selected task completion' },
  { key: 'Escape', description: 'Clear task selection' },
  { key: 's or ,', description: 'Open settings' },
  { key: 'r', description: 'Open rewards panel' },
  { key: 'n', description: 'Add new task' },
  { key: '?', description: 'Show keyboard shortcuts' },
];

export const KeyboardHelp = () => {
  const { isKeyboardHelpOpen, setKeyboardHelpOpen } = useUiStore();
  return (
    <Dialog open={isKeyboardHelpOpen} onOpenChange={setKeyboardHelpOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="p-2" aria-label="Show keyboard shortcuts" onClick={() => setKeyboardHelpOpen(true)}>
          <HelpCircle className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Use these shortcuts to navigate NextStep more efficiently:
          </p>
          
          <div className="space-y-3">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{shortcut.description}</span>
                <code className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded font-mono">
                  {shortcut.key}
                </code>
              </div>
            ))}
          </div>
          
          <div className="mt-6 rounded-md bg-primary/5 p-3">
            <p className="text-xs text-primary">
              <strong>Tip:</strong> Keyboard shortcuts work when you're not typing in a text field.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
