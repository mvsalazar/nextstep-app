import { useState } from 'react';
import { Gift, Plus, Trash2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useRewards, useStars, useCreateReward, useDeleteReward, useUpdateStars } from '@/hooks/useRewards';
import { useSettings } from '@/hooks/useSettings';

import { useUiStore } from '@/store/ui';
import { toast } from 'sonner';

export const RewardsPanel = () => {
  const { data: rewards = [] } = useRewards();
  const { data: settings } = useSettings();
  const { data: stars = 0 } = useStars();
  const createReward = useCreateReward();
  const deleteReward = useDeleteReward();
  const updateStars = useUpdateStars();
  const { isRewardsOpen, setRewardsOpen } = useUiStore();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRewardName, setNewRewardName] = useState('');
  const [newRewardCost, setNewRewardCost] = useState('5');

  const canAccessAdmin = settings?.userRole === 'parent' || settings?.userRole === 'guardian'; // Parents/guardians can access admin

  const handleAddReward = async () => {
    const cost = parseInt(newRewardCost);
    if (!newRewardName.trim() || isNaN(cost) || cost <= 0) {
      toast.error('Please provide a valid reward name and cost');
      return;
    }

    try {
      await createReward.mutateAsync({
        name: newRewardName.trim(),
        cost,
      });
      
      setNewRewardName('');
      setNewRewardCost('5');
      setShowAddForm(false);
      toast.success('Reward added!');
    } catch (error) {
      toast.error('Failed to add reward. ' + error);
    }
  };

  const handleDeleteReward = async (id: string, name: string) => {
    try {
      await deleteReward.mutateAsync(id);
      toast.success(`"${name}" reward removed`);
    } catch (error) {
      toast.error('Failed to remove reward. ' + error);
    }
  };

  const handleRedeemReward = async (reward: any) => {
    if (stars < reward.cost) {
      toast.error(`You need ${reward.cost - stars} more stars for this reward!`);
      return;
    }

    try {
      await updateStars.mutateAsync(-reward.cost);
      toast.success(`🎉 You redeemed "${reward.name}"! Enjoy!`);
    } catch (error) {
      toast.error('Failed to redeem reward. ' + error);
    }
  };

  return (
    <>
      <Sheet open={isRewardsOpen} onOpenChange={setRewardsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Rewards ({stars} ⭐)
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-4 py-6 px-6">
            {canAccessAdmin && (
              <Button
                onClick={() => setShowAddForm(true)}
                variant="outline"
                className="w-full gap-2"
              >
                <Plus className="h-4 w-4" />
                Add New Reward
              </Button>
            )}

            {rewards.length === 0 ? (
              <div className="text-center py-8">
                <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No rewards yet
                </h3>
                <p className="text-muted-foreground text-sm">
                  Add some rewards to motivate completing tasks!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {rewards.map((reward) => (
                  <Card key={reward.id} className="relative">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground truncate">
                            {reward.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {reward.cost} ⭐
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            size="sm"
                            onClick={() => handleRedeemReward(reward)}
                            disabled={stars < reward.cost}
                            className="flex-shrink-0"
                          >
                            {stars >= reward.cost ? 'Redeem' : 'Need More ⭐'}
                          </Button>
                          {canAccessAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteReward(reward.id, reward.name)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                              aria-label={`Delete ${reward.name} reward`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Add Reward Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Reward</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reward-name">Reward Name</Label>
              <Input
                id="reward-name"
                value={newRewardName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewRewardName(e.target.value)}
                placeholder="e.g., Choose a snack"
                maxLength={50}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reward-cost">Star Cost</Label>
              <Input
                id="reward-cost"
                type="number"
                value={newRewardCost}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewRewardCost(e.target.value)}
                min="1"
                max="100"
              />
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleAddReward}
                disabled={createReward.isPending}
                className="flex-1"
              >
                {createReward.isPending ? 'Adding...' : 'Add Reward'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};