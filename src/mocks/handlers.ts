import { http, HttpResponse } from 'msw';
import type { Task, RewardRule, Settings, Routine } from '@/types';
import { SEED_TASKS, SEED_REWARDS, DEFAULT_SETTINGS, SEED_ROUTINES } from '@/lib/constants';

// Mock data store
let mockTasks: Task[] = [...SEED_TASKS];
let mockRewards: RewardRule[] = [...SEED_REWARDS];
let mockSettings: Settings = { ...DEFAULT_SETTINGS };
let mockRoutines: Routine[] = [...SEED_ROUTINES];
let mockStars = 0;

export const handlers = [
  // Health check
  http.get('/api/health', () => {
    return HttpResponse.json({ ok: true });
  }),

  // Routines endpoints
  http.get('/api/v1/routines', () => {
    return HttpResponse.json(mockRoutines.filter(r => r.active).sort((a, b) => a.order - b.order));
  }),

  http.get('/api/v1/routines/:id', ({ params }) => {
    const { id } = params;
    const routine = mockRoutines.find(r => r.id === id);
    if (!routine) {
      return HttpResponse.json(
        { code: 'NOT_FOUND', message: 'Routine not found' },
        { status: 404 }
      );
    }
    return HttpResponse.json(routine);
  }),

  http.post('/api/v1/routines', async ({ request }) => {
    const routineData = await request.json() as Omit<Routine, 'id' | 'updatedAt' | 'version'>;
    const newRoutine: Routine = {
      ...routineData,
      id: `r${Date.now()}`,
      updatedAt: new Date().toISOString(),
      version: 1,
    };
    mockRoutines.push(newRoutine);
    return HttpResponse.json(newRoutine, { status: 201 });
  }),

  http.patch('/api/v1/routines/:id', async ({ params, request }) => {
    const { id } = params;
    const updates = await request.json() as Partial<Routine>;
    
    const routineIndex = mockRoutines.findIndex(routine => routine.id === id);
    if (routineIndex === -1) {
      return HttpResponse.json(
        { code: 'NOT_FOUND', message: 'Routine not found' },
        { status: 404 }
      );
    }

    mockRoutines[routineIndex] = {
      ...mockRoutines[routineIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
      version: (mockRoutines[routineIndex].version || 1) + 1,
    };

    return HttpResponse.json(mockRoutines[routineIndex]);
  }),

  http.delete('/api/v1/routines/:id', ({ params }) => {
    const { id } = params;
    const initialLength = mockRoutines.length;
    mockRoutines = mockRoutines.filter(routine => routine.id !== id);
    // Also remove associated tasks
    mockTasks = mockTasks.filter(task => task.routineId !== id);
    
    if (mockRoutines.length === initialLength) {
      return HttpResponse.json(
        { code: 'NOT_FOUND', message: 'Routine not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({ success: true });
  }),

  http.post('/api/v1/routines/reorder', async ({ request }) => {
    const { routineIds } = await request.json() as { routineIds: string[] };
    mockRoutines = mockRoutines.map(routine => {
      const newOrder = routineIds.indexOf(routine.id);
      return newOrder >= 0 ? { ...routine, order: newOrder + 1 } : routine;
    });
    return HttpResponse.json({ success: true });
  }),

  // Tasks endpoints
  http.get('/api/v1/tasks', ({ request }) => {
    const url = new URL(request.url);
    const routineId = url.searchParams.get('routineId');
    let tasks = routineId 
      ? mockTasks.filter(task => task.routineId === routineId)
      : mockTasks;
    return HttpResponse.json(tasks.sort((a, b) => a.order - b.order));
  }),

  http.post('/api/v1/tasks', async ({ request }) => {
    const taskData = await request.json() as Omit<Task, 'id' | 'updatedAt' | 'version'>;
    
    // Calculate proper order for the routine
    const routineTasks = mockTasks.filter(t => t.routineId === taskData.routineId);
    const maxOrder = routineTasks.length > 0 ? Math.max(...routineTasks.map(t => t.order)) : 0;
    
    const newTask: Task = {
      ...taskData,
      id: `t${Date.now()}`,
      order: maxOrder + 1,
      updatedAt: new Date().toISOString(),
      version: 1,
    };
    mockTasks.push(newTask);
    return HttpResponse.json(newTask, { status: 201 });
  }),

  http.patch('/api/v1/tasks/:id', async ({ params, request }) => {
    const { id } = params;
    const updates = await request.json() as Partial<Task>;
    
    const taskIndex = mockTasks.findIndex(task => task.id === id);
    if (taskIndex === -1) {
      return HttpResponse.json(
        { code: 'NOT_FOUND', message: 'Task not found' },
        { status: 404 }
      );
    }

    mockTasks[taskIndex] = {
      ...mockTasks[taskIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
      version: (mockTasks[taskIndex].version || 1) + 1,
    };

    return HttpResponse.json(mockTasks[taskIndex]);
  }),

  http.delete('/api/v1/tasks/:id', ({ params }) => {
    const { id } = params;
    const initialLength = mockTasks.length;
    mockTasks = mockTasks.filter(task => task.id !== id);
    
    if (mockTasks.length === initialLength) {
      return HttpResponse.json(
        { code: 'NOT_FOUND', message: 'Task not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({ success: true });
  }),

  http.post('/api/v1/tasks/reorder', async ({ request }) => {
    const { routineId, taskIds } = await request.json() as { routineId: string; taskIds: string[] };
    mockTasks = mockTasks.map(task => {
      if (task.routineId === routineId) {
        const newOrder = taskIds.indexOf(task.id);
        return newOrder >= 0 ? { ...task, order: newOrder + 1 } : task;
      }
      return task;
    });
    return HttpResponse.json({ success: true });
  }),

  // Rewards endpoints
  http.get('/api/v1/rewards', () => {
    return HttpResponse.json(mockRewards);
  }),

  http.post('/api/v1/rewards', async ({ request }) => {
    const rewardData = await request.json() as Omit<RewardRule, 'id'>;
    const newReward: RewardRule = {
      ...rewardData,
      id: `r${Date.now()}`,
    };
    mockRewards.push(newReward);
    return HttpResponse.json(newReward, { status: 201 });
  }),

  http.patch('/api/v1/rewards/:id', async ({ params, request }) => {
    const { id } = params;
    const updates = await request.json() as Partial<RewardRule>;
    
    const rewardIndex = mockRewards.findIndex(reward => reward.id === id);
    if (rewardIndex === -1) {
      return HttpResponse.json(
        { code: 'NOT_FOUND', message: 'Reward not found' },
        { status: 404 }
      );
    }

    mockRewards[rewardIndex] = { ...mockRewards[rewardIndex], ...updates };
    return HttpResponse.json(mockRewards[rewardIndex]);
  }),

  http.delete('/api/v1/rewards/:id', ({ params }) => {
    const { id } = params;
    const initialLength = mockRewards.length;
    mockRewards = mockRewards.filter(reward => reward.id !== id);
    
    if (mockRewards.length === initialLength) {
      return HttpResponse.json(
        { code: 'NOT_FOUND', message: 'Reward not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({ success: true });
  }),

  // Stars endpoints
  http.get('/api/v1/stars', () => {
    return HttpResponse.json({ stars: mockStars });
  }),

  http.patch('/api/v1/stars', async ({ request }) => {
    const { delta } = await request.json() as { delta: number };
    mockStars = Math.max(0, mockStars + delta);
    return HttpResponse.json({ stars: mockStars });
  }),

  // Settings endpoints
  http.get('/api/v1/settings', () => {
    return HttpResponse.json(mockSettings);
  }),

  http.patch('/api/v1/settings', async ({ request }) => {
    const updates = await request.json() as Partial<Settings>;
    mockSettings = { ...mockSettings, ...updates };
    return HttpResponse.json(mockSettings);
  }),
];