import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscriptionAccess } from '@/hooks/useSubscriptionAccess';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const SubscriptionSettings: React.FC = () => {
  const {
    hasAccess,
    subscriptionStatus,
    hasPaid,
    friend,
    daysRemaining,
    isTrialActive,
    isExpired
  } = useSubscriptionAccess();

  const handleManageSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('You must be logged in to manage your subscription');
        return;
      }

      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error creating customer portal session:', error);
        toast.error('Failed to open subscription management');
        return;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error('Failed to open subscription management');
    }
  };

  const getStatusBadge = () => {
    if (friend) {
      return <Badge className="bg-purple-100 text-purple-800">Friend Access</Badge>;
    }
    if (hasPaid) {
      return <Badge className="bg-green-100 text-green-800">Active Subscription</Badge>;
    }
    if (isTrialActive) {
      return <Badge className="bg-blue-100 text-blue-800">Free Trial</Badge>;
    }
    if (isExpired) {
      return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
  };

  const getStatusDescription = () => {
    if (friend) {
      return 'You have special friend access to Breeding Journey.';
    }
    if (hasPaid) {
      return 'You have an active subscription to Breeding Journey.';
    }
    if (isTrialActive && daysRemaining !== null) {
      const daysText = daysRemaining === 1 ? 'day' : 'days';
      return `Your free trial expires in ${daysRemaining} ${daysText}.`;
    }
    if (isExpired) {
      return 'Your free trial has expired. Activate your subscription to continue.';
    }
    return 'No active subscription found.';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
        <CardDescription>
          Manage your Breeding Journey subscription
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Status</p>
            {getStatusBadge()}
          </div>
          <p className="text-sm text-muted-foreground">
            {getStatusDescription()}
          </p>
        </div>

        {(hasPaid || isTrialActive || isExpired) && (
          <Button 
            onClick={handleManageSubscription}
            className="w-full bg-warmgreen-600 hover:bg-warmgreen-700 text-white"
          >
            {isExpired ? 'Activate Subscription' : 'Manage Subscription'}
          </Button>
        )}

        {isTrialActive && daysRemaining !== null && daysRemaining <= 7 && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
            <p className="text-sm text-orange-800">
              Your trial expires soon. Consider activating your subscription to avoid interruption.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionSettings;