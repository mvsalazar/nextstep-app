import { http, HttpResponse } from 'msw';
import type { Task, RewardRule, Settings, Routine, ChildUser } from '@/types';
import { SEED_TASKS, SEED_REWARDS, DEFAULT_SETTINGS, SEED_ROUTINES, SEED_CHILDREN, SEED_TASK_TEMPLATES } from '@/lib/constants';

// Mock data store
let mockTasks: Task[] = [...SEED_TASKS];
let mockRewards: RewardRule[] = [...SEED_REWARDS];
let mockSettings: Settings = { ...DEFAULT_SETTINGS };
let mockRoutines: Routine[] = [...SEED_ROUTINES];
const mockStarsByChild: Record<string, number> = {};
let mockChildren: ChildUser[] = [...SEED_CHILDREN];
// In-memory mock session store for API mode
const mockSessions: Record<string, { id: string; email: string; name?: string; role: 'parent' | 'guardian' }> = {};

export const handlers = [
  // Auth endpoints (mocked)
  http.post('/api/v1/auth/signup', async ({ request }) => {
    const body = await request.json() as { email: string; password: string; name?: string };
    const token = `mock-token-${Math.random().toString(36).slice(2, 8)}`;
    const user = { id: 'parent-1', email: body.email, name: body.name || 'Parent', role: 'parent' as const };
    mockSessions[token] = user;
    // When logging in as parent, switch role in settings for UI
    mockSettings.userRole = 'parent';
    return HttpResponse.json({ token, user });
  }),
  http.post('/api/v1/auth/login', async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    // Accept any credentials in mock
    const token = `mock-token-${Math.random().toString(36).slice(2, 8)}`;
    const user = { id: 'parent-1', email: body.email, name: 'Parent', role: 'parent' as const };
    mockSessions[token] = user;
    mockSettings.userRole = 'parent';
    return HttpResponse.json({ token, user });
  }),
  http.post('/api/v1/auth/logout', async ({ request }) => {
    const auth = request.headers.get('authorization') || '';
    const token = auth.replace('Bearer ', '');
    delete mockSessions[token];
    return HttpResponse.json({ success: true });
  }),
  http.get('/api/v1/me', ({ request }) => {
    const auth = request.headers.get('authorization') || '';
    const token = auth.replace('Bearer ', '');
    const user = mockSessions[token];
    if (!user) return new HttpResponse('Unauthorized', { status: 401 });
    return HttpResponse.json(user);
  }),

  // Children management
  http.get('/api/v1/children', () => {
    return HttpResponse.json(mockChildren);
  }),
  http.post('/api/v1/children', async ({ request }) => {
    const { name, emoji } = await request.json() as { name: string; emoji?: string };
    const trimmed = (name || '').trim();
    if (!trimmed) return new HttpResponse('Invalid name', { status: 400 });
    const ts = Date.now();
    const newChild: ChildUser = {
      id: `c${ts}`,
      name: trimmed,
      emoji: emoji || '🧒',
      parentId: 'p1',
    };
    mockChildren.push(newChild);
    mockSettings.currentChildId = newChild.id;
    mockStarsByChild[newChild.id] = 0;

    // Clone seed routines for this child with new IDs
    const routineIdMap = new Map<string, string>();
    const clonedRoutines: Routine[] = SEED_ROUTINES.map((r, idx) => {
      const newId = `r${ts}_${idx + 1}`;
      routineIdMap.set(r.id, newId);
      return {
        ...r,
        id: newId,
        ownerId: 'p1',
        childId: newChild.id,
        updatedAt: new Date().toISOString(),
        version: 1,
      };
    });
    mockRoutines.push(...clonedRoutines);

    // Clone seed templates for this child, rewiring routineId
    const clonedTemplates: Task[] = SEED_TASK_TEMPLATES.map((t, idx) => ({
      ...t,
      id: `tpl${ts}_${idx + 1}`,
      ownerId: 'p1',
      childId: newChild.id,
      routineId: routineIdMap.get(t.routineId) || t.routineId,
      isTemplate: true,
      date: undefined,
      done: false,
      updatedAt: new Date().toISOString(),
      version: 1,
    }));
    mockTasks.push(...clonedTemplates);
    return HttpResponse.json(newChild, { status: 201 });
  }),
  http.delete('/api/v1/children/:id', ({ params }) => {
    const { id } = params as { id: string };
    const before = mockChildren.length;
    mockChildren = mockChildren.filter(c => c.id !== id);
    if (mockChildren.length === before) return new HttpResponse('Not found', { status: 404 });
    // cleanup associated data
    delete mockStarsByChild[id];
    mockTasks = mockTasks.filter(t => t.childId !== id);
    mockRoutines = mockRoutines.filter(r => r.childId !== id);
    if (mockSettings.currentChildId === id) {
      mockSettings.currentChildId = mockChildren[0]?.id || null;
    }
    return HttpResponse.json({ success: true });
  }),

  http.patch('/api/v1/children/:id', async ({ params, request }) => {
    const { id } = params as { id: string };
    const updates = await request.json() as Partial<ChildUser>;
    const idx = mockChildren.findIndex(c => c.id === id);
    if (idx === -1) return new HttpResponse('Not found', { status: 404 });
    mockChildren[idx] = { ...mockChildren[idx], ...updates };
    return HttpResponse.json(mockChildren[idx]);
  }),
  // Health check
  http.get('/api/health', () => {
    return HttpResponse.json({ ok: true });
  }),

  // Routines endpoints
  http.get('/api/v1/routines', ({ request }) => {
    const url = new URL(request.url);
    const childId = url.searchParams.get('childId');
    let routines = mockRoutines;
    if (childId) routines = routines.filter(r => r.childId === childId);
    return HttpResponse.json(routines.filter(r => r.active).sort((a, b) => a.order - b.order));
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

  // Template endpoints
  http.get('/api/v1/templates', ({ request }) => {
    const url = new URL(request.url);
    const routineId = url.searchParams.get('routineId');
    const childId = url.searchParams.get('childId');
    let templates = mockTasks.filter(task => task.isTemplate);
    if (childId) templates = templates.filter(t => t.childId === childId);
    if (routineId) {
      templates = templates.filter(task => task.routineId === routineId);
    }
    return HttpResponse.json(templates.sort((a, b) => a.order - b.order));
  }),

  http.post('/api/v1/templates', async ({ request }) => {
    const templateData = await request.json() as Omit<Task, 'id' | 'updatedAt' | 'version'>;
    const routineTemplates = mockTasks.filter(t => t.routineId === templateData.routineId && t.isTemplate);
    const maxOrder = routineTemplates.length > 0 ? Math.max(...routineTemplates.map(t => t.order)) : 0;
    
    const newTemplate: Task = {
      ...templateData,
      id: `template_${Date.now()}`,
      order: maxOrder + 1,
      isTemplate: true,
      updatedAt: new Date().toISOString(),
      version: 1,
    };
    mockTasks.push(newTemplate);
    return HttpResponse.json(newTemplate, { status: 201 });
  }),

  http.patch('/api/v1/templates/:id', async ({ params, request }) => {
    const { id } = params as { id: string };
    const updates = await request.json() as Partial<Task>;
    const idx = mockTasks.findIndex(t => t.id === id && t.isTemplate);
    if (idx === -1) return HttpResponse.json({ code: 'NOT_FOUND', message: 'Template not found' }, { status: 404 });
    mockTasks[idx] = {
      ...mockTasks[idx],
      ...updates,
      isTemplate: true,
      updatedAt: new Date().toISOString(),
      version: (mockTasks[idx].version || 1) + 1,
    };
    return HttpResponse.json(mockTasks[idx]);
  }),

  http.delete('/api/v1/templates/:id', ({ params }) => {
    const { id } = params as { id: string };
    const before = mockTasks.length;
    mockTasks = mockTasks.filter(t => !(t.id === id && t.isTemplate));
    if (mockTasks.length === before) return HttpResponse.json({ code: 'NOT_FOUND', message: 'Template not found' }, { status: 404 });
    return HttpResponse.json({ success: true });
  }),

  // Tasks endpoints (with date-based generation)
  http.get('/api/v1/tasks', ({ request }) => {
    const url = new URL(request.url);
    const routineId = url.searchParams.get('routineId');
    const date = url.searchParams.get('date');
    const childId = url.searchParams.get('childId');
    if (!date) {
      return HttpResponse.json({ code: 'BAD_REQUEST', message: 'date is required' }, { status: 400 });
    }

    // Ensure daily tasks exist (simulate backend logic)
    let existingDailyTasks = mockTasks.filter(task => !task.isTemplate && task.date === date);
    if (childId) existingDailyTasks = existingDailyTasks.filter(t => t.childId === childId);

    if (existingDailyTasks.length === 0) {
      let templates = mockTasks.filter(task => task.isTemplate);
      if (childId) templates = templates.filter(t => t.childId === childId);
      if (routineId) templates = templates.filter(t => t.routineId === routineId);
      const dailyTasks = templates.map(template => ({
        ...template,
        id: `${template.id}_${date}`,
        date,
        done: false,
        isTemplate: false,
        updatedAt: new Date().toISOString(),
        version: 1,
      }));
      mockTasks.push(...dailyTasks);
      existingDailyTasks = dailyTasks;
    } else {
      if (routineId) existingDailyTasks = existingDailyTasks.filter(t => t.routineId === routineId);
    }

    const tasks = existingDailyTasks.sort((a, b) => a.order - b.order);
    return HttpResponse.json(tasks);
  }),

  http.post('/api/v1/tasks/generate-daily', async ({ request }) => {
    const { date, routineIds, childId } = await request.json() as { date: string; routineIds?: string[]; childId?: string };
    
    let templates = mockTasks.filter(task => task.isTemplate);
    if (childId) templates = templates.filter(t => t.childId === childId);
    if (routineIds) {
      templates = templates.filter(task => routineIds.includes(task.routineId));
    }
    
    const dailyTasks = templates.map(template => ({
      ...template,
      id: `${template.id}_${date}`,
      date,
      done: false,
      isTemplate: false,
      updatedAt: new Date().toISOString(),
      version: 1,
    }));
    
    mockTasks.push(...dailyTasks);
    return HttpResponse.json(dailyTasks, { status: 201 });
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
    const { routineId, taskIds } = await request.json() as { routineId: string; taskIds: string[]; childId?: string };
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
  http.get('/api/v1/stars', ({ request }) => {
    const url = new URL(request.url);
    const childId = url.searchParams.get('childId') || 'c1';
    const stars = mockStarsByChild[childId] || 0;
    return HttpResponse.json({ stars });
  }),

  http.patch('/api/v1/stars', async ({ request }) => {
    const { delta, childId } = await request.json() as { delta: number; childId?: string };
    const id = childId || 'c1';
    const prev = mockStarsByChild[id] || 0;
    const next = Math.max(0, prev + delta);
    mockStarsByChild[id] = next;
    return HttpResponse.json({ stars: next });
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
