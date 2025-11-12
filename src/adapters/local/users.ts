import { loadAppState, updateAppState } from './storage';
import type { ChildUser, Routine, Task } from '@/types';
import { SEED_ROUTINES, SEED_TASK_TEMPLATES } from '@/lib/constants';

export const getChildren = async (): Promise<ChildUser[]> => {
  await new Promise((r) => setTimeout(r, 50));
  const state = loadAppState();
  return state.children || [];
};

export const createChild = async (name: string, emoji?: string): Promise<ChildUser> => {
  await new Promise((r) => setTimeout(r, 100));
  const state = loadAppState();
  const newChild: ChildUser = {
    id: `c${Date.now()}`,
    name: name.trim(),
    emoji: emoji || '🧒',
    parentId: state.parentUser.id,
  };
  updateAppState((s) => {
    // Create child-specific routines cloned from seeds with unique IDs
    const ts = Date.now();
    const routineIdMap = new Map<string, string>();
    const clonedRoutines: Routine[] = SEED_ROUTINES.map((r, idx) => {
      const newId = `r${ts}_${idx + 1}`;
      routineIdMap.set(r.id, newId);
      return {
        ...r,
        id: newId,
        ownerId: s.parentUser.id,
        childId: newChild.id,
        updatedAt: new Date().toISOString(),
        version: 1,
      };
    });

    // Clone task templates for the new child, rewiring routineId
    const clonedTemplates: Task[] = SEED_TASK_TEMPLATES.map((t, idx) => ({
      ...t,
      id: `tpl${ts}_${idx + 1}`,
      ownerId: s.parentUser.id,
      childId: newChild.id,
      routineId: routineIdMap.get(t.routineId) || t.routineId,
      isTemplate: true,
      updatedAt: new Date().toISOString(),
      version: 1,
      done: false,
      date: undefined,
    }));

    return {
      ...s,
      children: [...(s.children || []), newChild],
      starsByChild: { ...(s.starsByChild || {}), [newChild.id]: 0 },
      routines: [...s.routines, ...clonedRoutines],
      tasks: [...s.tasks, ...clonedTemplates],
    };
  });
  return newChild;
};

export const deleteChild = async (childId: string): Promise<void> => {
  await new Promise((r) => setTimeout(r, 100));
  updateAppState((s) => {
    const filteredChildren = (s.children || []).filter((c) => c.id !== childId);
    const restStars = { ...(s.starsByChild || {}) };
    delete restStars[childId];
    // Remove tasks and routines for that child
    return {
      ...s,
      children: filteredChildren,
      starsByChild: restStars,
      tasks: s.tasks.filter((t) => t.childId !== childId),
      routines: s.routines.filter((r) => r.childId !== childId),
      settings: {
        ...s.settings,
        currentChildId: s.settings.currentChildId === childId ? (filteredChildren[0]?.id || null) : s.settings.currentChildId,
      },
    };
  });
};

export const updateChild = async (childId: string, updates: { name?: string; emoji?: string }): Promise<ChildUser> => {
  await new Promise((r) => setTimeout(r, 80));
  let updated: ChildUser | null = null;
  updateAppState((s) => {
    const children = (s.children || []).map((c) => {
      if (c.id !== childId) return c;
      updated = { ...c, ...updates };
      return updated;
    });
    return { ...s, children };
  });
  if (!updated) throw new Error('Child not found');
  return updated;
};
