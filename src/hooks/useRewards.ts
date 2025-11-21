import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { RewardRule } from '@/types';
import { useSettings } from './useSettings';
import { STAR_THRESHOLDS } from '@/lib/constants';
import { useUiStore } from '@/store/ui';

// Import adapters
import * as localRewards from '@/adapters/local/rewards';
import * as apiRewards from '@/adapters/api/rewards';

type RewardsQueryOptions = {
  enabled?: boolean;
};

export const useRewards = (options: RewardsQueryOptions = {}) => {
  const { enabled = true } = options;
  const { data: settings } = useSettings();
  const storageMode = settings?.storageMode || 'local';
  const adapter = storageMode === 'api' ? apiRewards : localRewards;

  return useQuery({
    queryKey: ['rewards'],
    queryFn: adapter.getRewards,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled,
  });
};

type StarsQueryOptions = {
  enabled?: boolean;
};

export const useStars = (options: StarsQueryOptions = {}) => {
  const { enabled = true } = options;
  const { data: settings } = useSettings();
  const storageMode = settings?.storageMode || 'local';
  const adapter = storageMode === 'api' ? apiRewards : localRewards;
  const childId = settings?.currentChildId || 'default-child';

  return useQuery({
    queryKey: ['stars', childId],
    queryFn: () => adapter.getStars(childId),
    staleTime: 1000 * 30, // 30 seconds
    enabled,
  });
};

export const useUpdateStars = () => {
  const queryClient = useQueryClient();
  const { data: settings } = useSettings();
  const storageMode = settings?.storageMode || 'local';
  const adapter = storageMode === 'api' ? apiRewards : localRewards;
  const showCelebrationModal = useUiStore((state) => state.showCelebrationModal);

  return useMutation({
    mutationFn: (delta: number) => adapter.updateStars(delta, settings?.currentChildId || undefined),
    onMutate: async (_delta) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['stars', settings?.currentChildId] });
      const previousStars = queryClient.getQueryData(['stars', settings?.currentChildId]) as number;
      const newStars = Math.max(0, previousStars + _delta);
      
      queryClient.setQueryData(['stars', settings?.currentChildId], newStars);
      
      // Check for celebration thresholds (only for positive deltas in child mode)
      if (_delta > 0 && settings?.mode === 'child') {
        const crossedThreshold = STAR_THRESHOLDS.find(
          threshold => previousStars < threshold && newStars >= threshold
        );
        
        if (crossedThreshold) {
          setTimeout(() => showCelebrationModal(crossedThreshold), 500);
        }
      }
      
      return { previousStars };
    },
    onError: (error, _delta, context) => {
      // Rollback on error
      if (context?.previousStars !== undefined) {
        queryClient.setQueryData(['stars', settings?.currentChildId], context.previousStars);
      }
      console.error('Failed to update stars:', error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['stars'] });
    },
  });
};

export const useCreateReward = () => {
  const queryClient = useQueryClient();
  const { data: settings } = useSettings();
  const storageMode = settings?.storageMode || 'local';
  const adapter = storageMode === 'api' ? apiRewards : localRewards;

  return useMutation({
    mutationFn: (rewardData: Omit<RewardRule, 'id'>) => adapter.createReward(rewardData),
    onSuccess: (newReward) => {
      queryClient.setQueryData(['rewards'], (old: RewardRule[] = []) => [...old, newReward]);
    },
    onError: (error) => {
      console.error('Failed to create reward:', error);
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
    },
  });
};

export const useUpdateReward = () => {
  const queryClient = useQueryClient();
  const { data: settings } = useSettings();
  const storageMode = settings?.storageMode || 'local';
  const adapter = storageMode === 'api' ? apiRewards : localRewards;

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<RewardRule> }) =>
      adapter.updateReward(id, updates),
    onSuccess: (updatedReward) => {
      queryClient.setQueryData(['rewards'], (old: RewardRule[] = []) =>
        old.map(reward => reward.id === updatedReward.id ? updatedReward : reward)
      );
    },
    onError: (error) => {
      console.error('Failed to update reward:', error);
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
    },
  });
};

export const useDeleteReward = () => {
  const queryClient = useQueryClient();
  const { data: settings } = useSettings();
  const storageMode = settings?.storageMode || 'local';
  const adapter = storageMode === 'api' ? apiRewards : localRewards;

  return useMutation({
    mutationFn: (id: string) => adapter.deleteReward(id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(['rewards'], (old: RewardRule[] = []) =>
        old.filter(reward => reward.id !== deletedId)
      );
    },
    onError: (error) => {
      console.error('Failed to delete reward:', error);
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
    },
  });
};
