import type { Task } from '@/types';
import { loadAppState, updateAppState } from './storage';

export const getTasks = async (routineId?: string): Promise<Task[]> => {
  await new Promise(resolve => setTimeout(resolve, 50)); // Simulate network delay
  const state = loadAppState();
  const tasks = routineId 
    ? state.tasks.filter(task => task.routineId === routineId)
    : state.tasks;
  return tasks.sort((a, b) => a.order - b.order);
};

export const createTask = async (taskData: Omit<Task, 'id' | 'updatedAt' | 'version'>): Promise<Task> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const state = loadAppState();
  const routineTasks = state.tasks.filter(t => t.routineId === taskData.routineId);
  const maxOrder = routineTasks.length > 0 ? Math.max(...routineTasks.map(t => t.order)) : 0;
  
  const newTask: Task = {
    ...taskData,
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