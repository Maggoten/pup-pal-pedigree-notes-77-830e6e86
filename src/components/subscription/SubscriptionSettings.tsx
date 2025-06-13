import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useSubscriptionAccess } from '@/hooks/useSubscriptionAccess';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

const SubscriptionSettings: React.FC = () => {
  const { checkSubscription } = useAuth();
  const {
    hasAccess,
    subscriptionStatus,
    hasPaid,
    friend,
    daysRemaining,
    isTrialActive,
    isExpired,
    trialEndDate
  } = useSubscriptionAccess();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleManageSubscription = async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('You must be logged in to cancel your subscription');
        return;
      }

      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error cancelling subscription:', error);
        toast.error('Failed to cancel subscription');
        return;
      }

      if (data?.success) {
        toast.success('Subscription will be cancelled at the end of your current billing period');
        // Refresh subscription status
        await checkSubscription();
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Failed to cancel subscription');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('You must be logged in to reactivate your subscription');
        return;
      }

      // For reactivation, we use the customer portal which allows users to resubscribe
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error opening customer portal for reactivation:', error);
        toast.error('Failed to open subscription reactivation');
        return;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
        toast.success('Please complete reactivation in the opened tab');
      }
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      toast.error('Failed to reactivate subscription');
    } finally {
      setIsLoading(false);
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
    if (subscriptionStatus === 'canceled' && hasPaid) {
      return 'Your subscription is cancelled and will end at the current billing period.';
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

  const getSubscriptionDates = () => {
    const dates = [];
    
    if (isTrialActive && trialEndDate) {
      dates.push({
        label: 'Trial End Date',
        date: new Date(trialEndDate),
        type: 'trial'
      });
    }
    
    // Note: We would need to add billing period dates from Stripe data
    // This would require enhancing the check-subscription function to return more detailed info
    
    return dates;
  };

  const isCancelled = subscriptionStatus === 'canceled';
  const showCancelButton = hasPaid && !isCancelled && !friend;
  const showReactivateButton = isCancelled && !friend;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
        <CardDescription>
          Manage your Breeding Journey subscription
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Status</p>
              {getStatusBadge()}
            </div>
            <p className="text-sm text-muted-foreground">
              {getStatusDescription()}
            </p>
          </div>

          {/* Subscription Dates */}
          {getSubscriptionDates().length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Important Dates</p>
              {getSubscriptionDates().map((dateInfo) => (
                <div key={dateInfo.label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{dateInfo.label}:</span>
                  <span className={dateInfo.type === 'trial' ? 'text-blue-600' : 'text-foreground'}>
                    {format(dateInfo.date, 'MMM dd, yyyy')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Manage Subscription Button */}
          {(hasPaid || isTrialActive || isExpired) && !friend && (
            <Button 
              onClick={handleManageSubscription}
              disabled={isLoading}
              className="w-full bg-warmgreen-600 hover:bg-warmgreen-700 text-white"
            >
              {isLoading ? "Opening..." : (isExpired ? 'Activate Subscription' : 'Manage Subscription')}
            </Button>
          )}

          {/* Reactivate Button (for cancelled subscriptions) */}
          {showReactivateButton && (
            <Button 
              onClick={handleReactivateSubscription}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? "Opening..." : "Reactivate Subscription"}
            </Button>
          )}

          {/* Cancel Button (for active subscriptions) */}
          {showCancelButton && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline"
                  className="w-full border-red-300 text-red-700 hover:bg-red-50"
                  disabled={isCancelling}
                >
                  {isCancelling ? "Cancelling..." : "Cancel Subscription"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel your subscription? Your access will continue until the end of your current billing period, and you can reactivate anytime before then.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancelSubscription}
                    className="bg-red-600 hover:bg-red-700"
                    disabled={isCancelling}
                  >
                    {isCancelling ? "Cancelling..." : "Yes, Cancel"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Trial Warning */}
        {isTrialActive && daysRemaining !== null && daysRemaining <= 7 && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
            <p className="text-sm text-orange-800">
              Your trial expires soon. Consider activating your subscription to avoid interruption.
            </p>
          </div>
        )}

        {/* Cancelled Subscription Info */}
        {isCancelled && hasPaid && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              Your subscription is cancelled but remains active until the end of your current billing period. You can reactivate it anytime.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionSettings;