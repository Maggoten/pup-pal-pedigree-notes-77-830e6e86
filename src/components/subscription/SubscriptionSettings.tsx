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
import SubscriptionDebugPanel from './SubscriptionDebugPanel';

const SubscriptionSettings: React.FC = () => {
  const { checkSubscription } = useAuth();
  
  // Refresh subscription status when component mounts to ensure accuracy
  React.useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);
  const {
    hasAccess,
    subscriptionStatus,
    hasPaid,
    friend,
    daysRemaining,
    isTrialActive,
    isExpired,
    trialEndDate,
    currentPeriodEnd
  } = useSubscriptionAccess();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleManageSubscription = async () => {
    setIsLoading(true);
    
    console.log('[SubscriptionSettings] Starting manage subscription process');
    
    try {
      // Step 1: Validate session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error('[SubscriptionSettings] Session validation failed:', sessionError);
        toast.error('Authentication required. Please sign in and try again.');
        return;
      }
      
      console.log('[SubscriptionSettings] Session validated for user:', session.user?.id);

      // Step 2: Check if user has stripe_customer_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('stripe_customer_id, email')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('[SubscriptionSettings] Failed to fetch user profile:', profileError);
        toast.error('Unable to verify subscription details. Please try again.');
        return;
      }

      console.log('[SubscriptionSettings] Profile data:', {
        hasStripeCustomerId: !!profile?.stripe_customer_id,
        email: profile?.email
      });

      if (!profile?.stripe_customer_id) {
        console.warn('[SubscriptionSettings] No Stripe customer ID found for user');
        toast.error('No subscription found. Please activate a subscription first.');
        return;
      }

      // Step 3: Call customer portal with detailed logging
      console.log('[SubscriptionSettings] Calling customer-portal edge function');
      
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      console.log('[SubscriptionSettings] Customer portal response:', { data, error });

      if (error) {
        console.error('[SubscriptionSettings] Edge function error:', error);
        
        // Provide specific error messages based on error content
        if (error.message?.includes('No Stripe customer found')) {
          toast.error('No subscription found. Please activate a subscription first.');
        } else if (error.message?.includes('Authentication error')) {
          toast.error('Authentication failed. Please sign out and sign in again.');
        } else {
          toast.error(`Subscription management failed: ${error.message || 'Unknown error'}`);
        }
        return;
      }

      if (!data?.url) {
        console.error('[SubscriptionSettings] No URL returned from customer portal');
        toast.error('Unable to open subscription management. Please try again or contact support.');
        return;
      }

      console.log('[SubscriptionSettings] Opening customer portal URL');
      window.open(data.url, '_blank');
      toast.success('Opening subscription management...');
      
    } catch (error) {
      console.error('[SubscriptionSettings] Unexpected error:', error);
      toast.error('An unexpected error occurred. Please try again or contact support if the issue persists.');
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
    
    console.log('[SubscriptionSettings] Starting reactivate subscription process');
    
    try {
      // Step 1: Validate session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error('[SubscriptionSettings] Session validation failed for reactivation:', sessionError);
        toast.error('Authentication required. Please sign in and try again.');
        return;
      }

      console.log('[SubscriptionSettings] Session validated for reactivation:', session.user?.id);

      // Step 2: Check if user has stripe_customer_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('stripe_customer_id, email')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('[SubscriptionSettings] Failed to fetch profile for reactivation:', profileError);
        toast.error('Unable to verify subscription details. Please try again.');
        return;
      }

      if (!profile?.stripe_customer_id) {
        console.warn('[SubscriptionSettings] No Stripe customer ID found for reactivation');
        toast.error('No previous subscription found. Please start a new subscription instead.');
        return;
      }

      // Step 3: Call customer portal for reactivation
      console.log('[SubscriptionSettings] Calling customer-portal for reactivation');
      
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      console.log('[SubscriptionSettings] Reactivation portal response:', { data, error });

      if (error) {
        console.error('[SubscriptionSettings] Reactivation error:', error);
        
        if (error.message?.includes('No Stripe customer found')) {
          toast.error('No previous subscription found. Please start a new subscription instead.');
        } else if (error.message?.includes('Authentication error')) {
          toast.error('Authentication failed. Please sign out and sign in again.');
        } else {
          toast.error(`Reactivation failed: ${error.message || 'Unknown error'}`);
        }
        return;
      }

      if (!data?.url) {
        console.error('[SubscriptionSettings] No URL returned for reactivation');
        toast.error('Unable to open subscription reactivation. Please try again or contact support.');
        return;
      }

      console.log('[SubscriptionSettings] Opening reactivation portal');
      window.open(data.url, '_blank');
      toast.success('Please complete reactivation in the opened tab');
      
    } catch (error) {
      console.error('[SubscriptionSettings] Unexpected reactivation error:', error);
      toast.error('An unexpected error occurred during reactivation. Please try again or contact support.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (friend) {
      return <Badge className="bg-purple-100 text-purple-800">Friend Access</Badge>;
    }
    if (subscriptionStatus === 'active_until_period_end') {
      return <Badge className="bg-orange-100 text-orange-800">Cancelled - Expires Soon</Badge>;
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
    if (subscriptionStatus === 'active_until_period_end') {
      return 'Your subscription is cancelled and will end at the current billing period. You can reactivate it anytime.';
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
    
    // Show period end date for cancelled subscriptions
    if (subscriptionStatus === 'active_until_period_end' && currentPeriodEnd) {
      dates.push({
        label: 'Subscription End Date',
        date: new Date(currentPeriodEnd),
        type: 'cancelled'
      });
    }
    
    return dates;
  };

  const isCancelled = subscriptionStatus === 'canceled' || subscriptionStatus === 'active_until_period_end';
  const showCancelButton = hasPaid && !isCancelled && !friend;
  const showReactivateButton = isCancelled && !friend;

  return (
    <div className="space-y-4">
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
                    <span className={
                      dateInfo.type === 'trial' ? 'text-blue-600' : 
                      dateInfo.type === 'cancelled' ? 'text-orange-600 font-medium' : 
                      'text-foreground'
                    }>
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
          {subscriptionStatus === 'active_until_period_end' && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
              <p className="text-sm text-orange-800">
                <strong>Subscription Cancelled:</strong> Your access continues until your current billing period ends. You can reactivate anytime before then.
              </p>
            </div>
          )}
          
          {isCancelled && subscriptionStatus === 'canceled' && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                Your subscription is cancelled but remains active until the end of your current billing period. You can reactivate it anytime.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Debug Panel (only shows in development) */}
      <SubscriptionDebugPanel />
    </div>
  );
};

export default SubscriptionSettings;