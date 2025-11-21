import { useEffect, useCallback } from 'react';
import type { Task } from '@/types';
import { useUiStore } from '@/store/ui';
import { useSettings } from './useSettings';

export const useKeyboardNavigation = (tasks: Task[] = []) => {
  const { 
    selectedTaskId, 
    setSelectedTaskId, 
    setSettingsOpen, 
    setRewardsOpen, 
    setTaskEditOpen,
    setKeyboardHelpOpen,
    isTaskEditOpen,
  } = useUiStore();
  const { data: settings } = useSettings();
  const isChildMode = settings?.mode === 'child';

  const incompleteTasks = tasks.filter(task => !task.done);
  const currentIndex = incompleteTasks.findIndex(task => task.id === selectedTaskId);

  const selectNext = useCallback(() => {
    if (incompleteTasks.length === 0) return;
    
    const nextIndex = currentIndex < incompleteTasks.length - 1 ? currentIndex + 1 : 0;
    setSelectedTaskId(incompleteTasks[nextIndex].id);
  }, [currentIndex, incompleteTasks, setSelectedTaskId]);

  const selectPrevious = useCallback(() => {
    if (incompleteTasks.length === 0) return;
    
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : incompleteTasks.length - 1;
    setSelectedTaskId(incompleteTasks[prevIndex].id);
  }, [currentIndex, incompleteTasks, setSelectedTaskId]);

  const selectFirst = useCallback(() => {
    if (incompleteTasks.length > 0) {
      setSelectedTaskId(incompleteTasks[0].id);
    }
  }, [incompleteTasks, setSelectedTaskId]);

  const clearSelection = useCallback(() => {
    setSelectedTaskId(null);
  }, [setSelectedTaskId]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if user is typing in an input/textarea
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target as Element)?.getAttribute('contenteditable') === 'true'
      ) {
        return;
      }

      switch (event.key) {
        case 'ArrowDown':
        case 'j':
          event.preventDefault();
          if (selectedTaskId === null) {
            selectFirst();
          } else {
            selectNext();
          }
          break;

        case 'ArrowUp':
        case 'k':
          event.preventDefault();
          if (selectedTaskId === null) {
            selectFirst();
          } else {
            selectPrevious();
          }
          break;

        case 'Enter':
        case ' ':
          event.preventDefault();
          if (selectedTaskId) {
            // Trigger task toggle by dispatching a click event on the task's button
            const taskElement = document.querySelector(`[data-task-id="${selectedTaskId}"] button`);
            if (taskElement) {
              (taskElement as HTMLButtonElement).click();
            }
          }
          break;

        case 'Escape':
          event.preventDefault();
          clearSelection();
          break;

        case ',':
        case 's':
          event.preventDefault();
          setSettingsOpen(true);
          break;

        case 'r':
          if (isChildMode) {
            event.preventDefault();
            setRewardsOpen(true);
          }
          break;

        case 'n':
          event.preventDefault();
          setTaskEditOpen(true);
          break;

        case '?':
          event.preventDefault();
          setKeyboardHelpOpen(true);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedTaskId,
    selectNext,
    selectPrevious,
    selectFirst,
    clearSelection,
    setSettingsOpen,
    setRewardsOpen,
    setTaskEditOpen,
    setKeyboardHelpOpen,
    isChildMode,
  ]);

  // Auto-select first task if none selected and tasks exist
  useEffect(() => {
    // Avoid auto-selecting while the Add/Edit Task modal is open
    if (isTaskEditOpen) return;
    if (selectedTaskId === null && incompleteTasks.length > 0) {
      // Don't auto-select immediately to avoid conflicts with UI interactions
      const timer = setTimeout(() => {
        setSelectedTaskId(incompleteTasks[0].id);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedTaskId, incompleteTasks, setSelectedTaskId, isTaskEditOpen]);

  return {
    selectedTaskId,
    selectNext,
    selectPrevious,
    selectFirst,
    clearSelection,
  };
};
