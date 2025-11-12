import type { Task } from '@/types';
import { loadAppState, updateAppState } from './storage';

// Simplified: generate daily tasks for all routines for a given date
const generateDailyTasksForDate = (date: string): void => {
  const state = loadAppState();
  
  // Check if we already have daily tasks for this date
  const existingDailyTasks = state.tasks.filter(task => 
    !task.isTemplate && task.date === date
  );
  
  if (existingDailyTasks.length > 0) {
    return; // Already have tasks for this date
  }
  
  // Get all template tasks
  const templates = state.tasks.filter(task => task.isTemplate);
  
  // Generate daily instances from all templates
  const dailyTasks = templates.map(template => ({
    ...template,
    id: `${template.id}_${date}`, // Create unique ID for daily instance
    date,
    done: false,
    isTemplate: false,
    updatedAt: new Date().toISOString(),
    version: 1,
  }));
  
  if (dailyTasks.length > 0) {
    updateAppState(currentState => ({
      ...currentState,
      tasks: [...currentState.tasks, ...dailyTasks],
    }));
  }
};

export const getTasks = async (routineId?: string, date?: string, childId?: string): Promise<Task[]> => {
  await new Promise(resolve => setTimeout(resolve, 50)); // Simulate network delay
  
  // If we have a date, ensure daily tasks exist for that date
  if (date) {
    generateDailyTasksForDate(date);
  }
  
  const currentState = loadAppState();
  const currentChildId = childId ?? currentState.settings.currentChildId;
  let tasks = currentState.tasks;
  
  // When filtering by date, only return non-template tasks
  if (date) {
    tasks = tasks.filter(task => !task.isTemplate && task.date === date);
  } else {
    // When no date filter, show templates (for editing/management)
    tasks = tasks.filter(task => task.isTemplate);
  }
  
  // Scope by active child if set
  if (currentChildId) {
    tasks = tasks.filter(task => task.childId === currentChildId);
  }

  // Filter by routineId if provided
  if (routineId) {
    tasks = tasks.filter(task => task.routineId === routineId);
  }
  
  return tasks.sort((a, b) => a.order - b.order);
};

export const createTask = async (taskData: Omit<Task, 'id' | 'updatedAt' | 'version'>): Promise<Task> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const state = loadAppState();
  // For templates, compare only routine and template status
  // For daily tasks, compare routine, date, and non-template status
  const routineTasks = state.tasks.filter(t => {
    if (taskData.isTemplate) {
      return t.routineId === taskData.routineId && t.isTemplate;
    } else {
      return t.routineId === taskData.routineId && t.date === taskData.date && !t.isTemplate;
    }
  });
  const maxOrder = routineTasks.length > 0 ? Math.max(...routineTasks.map(t => t.order)) : 0;
  
  const newTask: Task = {
    ...taskData,
    ownerId: state.parentUser.id,
    childId: state.settings.currentChildId || undefined,
    id: `t${Date.now()}`,
    order: maxOrder + 1,
    updatedAt: new Date().toISOString(),
    version: 1,
  };

  updateAppState(state => ({
    ...state,
    tasks: [...state.tasks, newTask],
  }));

  return newTask;
};

export const updateTask = async (id: string, updates: Partial<Task>): Promise<Task> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  let updatedTask: Task | null = null;

  updateAppState(state => {
    const taskIndex = state.tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) {
      throw new Error(`Task ${id} not found`);
    }

    updatedTask = {
      ...state.tasks[taskIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
      version: (state.tasks[taskIndex].version || 1) + 1,
    };

    const newTasks = [...state.tasks];
    newTasks[taskIndex] = updatedTask;

    return {
      ...state,
      tasks: newTasks,
    };
  });

  if (!updatedTask) {
    throw new Error(`Task ${id} not found`);
  }

  return updatedTask;
};

export const deleteTask = async (id: string): Promise<{ success: boolean }> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  updateAppState(state => ({
    ...state,
    tasks: state.tasks.filter(task => task.id !== id),
  }));

  return { success: true };
};

export const reorderTasks = async (routineId: string, taskIds: string[]): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  updateAppState(state => ({
    ...state,
    tasks: state.tasks.map(task => {
      if (task.routineId === routineId) {
        const newOrder = taskIds.indexOf(task.id);
        return newOrder >= 0 ? { ...task, order: newOrder + 1 } : task;
      }
      return task;
    }),
  }));
};

// Template management functions for API compatibility
export const getTemplates = async (routineId?: string): Promise<Task[]> => {
  await new Promise(resolve => setTimeout(resolve, 50));
  
  const currentState = loadAppState();
  let templates = currentState.tasks.filter(task => task.isTemplate);
  
  if (routineId) {
    templates = templates.filter(task => task.routineId === routineId);
  }
  
  return templates.sort((a, b) => a.order - b.order);
};

export const createTemplate = async (templateData: Omit<Task, 'id' | 'updatedAt' | 'version'>): Promise<Task> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const state = loadAppState();
  const routineTemplates = state.tasks.filter(t => 
    t.routineId === templateData.routineId && t.isTemplate
  );
  const maxOrder = routineTemplates.length > 0 ? Math.max(...routineTemplates.map(t => t.order)) : 0;
  
  const newTemplate: Task = {
    ...templateData,
    ownerId: state.parentUser.id,
    childId: state.settings.currentChildId || undefined,
    id: `tpl${Date.now()}`,
    order: maxOrder + 1,
    isTemplate: true,
    updatedAt: new Date().toISOString(),
    version: 1,
  };

  updateAppState(state => ({
    ...state,
    tasks: [...state.tasks, newTemplate],
  }));

  return newTemplate;
};

export const generateDailyTasks = async (date: string, routineIds?: string[]): Promise<Task[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // This function is handled internally by getTasks in local mode
  // But we provide it for API compatibility
  generateDailyTasksForDate(date);
  
  const currentState = loadAppState();
  let dailyTasks = currentState.tasks.filter(task => 
    !task.isTemplate && task.date === date
  );
  
  if (routineIds && routineIds.length > 0) {
    dailyTasks = dailyTasks.filter(task => routineIds.includes(task.routineId));
  }
  
  return dailyTasks.sort((a, b) => a.order - b.order);
};
