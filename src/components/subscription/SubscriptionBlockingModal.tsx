import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SubscriptionBlockingModalProps {
  isOpen: boolean;
}

interface ModalMessage {
  title: string;
  description: string;
  buttonText: string;
}

const SubscriptionBlockingModal: React.FC<SubscriptionBlockingModalProps> = ({ isOpen }) => {
  const { logout, user, subscriptionStatus, trialEndDate, stripeCustomerId } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Pre-calculate modal message based on subscription status and trial end date
  const modalMessage: ModalMessage = useMemo(() => {
    if (import.meta.env.DEV) {
      console.log('[SubscriptionBlockingModal] Computing modal message:', { 
        subscriptionStatus, 
        trialEndDate,
        hasTrialEndDate: !!trialEndDate
      });
    }

    if (subscriptionStatus === 'canceled') {
      return {
        title: 'Subscription Cancelled',
        description: 'Your subscription was cancelled and your trial period has ended. To continue using Breeding Journey, please reactivate your subscription.',
        buttonText: 'Manage Subscription'
      };
    } else if (subscriptionStatus === 'past_due') {
      return {
        title: 'Payment Required',
        description: 'Your payment is past due. Please update your payment method to continue using Breeding Journey.',
        buttonText: 'Manage Subscription'
      };
    } else if (subscriptionStatus === 'inactive' || !subscriptionStatus) {
      return {
        title: 'Complete Your Registration',
        description: 'To access Breeding Journey, please complete your payment setup and start your 30-day free trial.',
        buttonText: trialEndDate ? 'Manage Subscription' : 'Start Free Trial'
      };
    } else {
      // Default message for trial ended
      return {
        title: 'Your free trial has ended',
        description: 'To continue using Breeding Journey, please activate your subscription.',
        buttonText: 'Manage Subscription'
      };
    }
  }, [subscriptionStatus, trialEndDate]);

  // Remove content delay - show immediately when modal opens

  const handleActivateSubscription = async () => {
    setIsLoading(true);
    
    try {
      if (import.meta.env.DEV) {
        console.log('[SubscriptionBlockingModal] Starting activation process for status:', subscriptionStatus);
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('You must be logged in to manage your subscription');
        return;
      }

      // Use pre-calculated stripeCustomerId instead of fetching
      if (!stripeCustomerId) {
        if (import.meta.env.DEV) {
          console.log('[SubscriptionBlockingModal] No stripeCustomerId found, redirecting to registration checkout');
        }
        
        const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('create-registration-checkout', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (checkoutError) {
          if (import.meta.env.DEV) {
            console.error('[SubscriptionBlockingModal] Error creating registration checkout:', checkoutError);
          }
          toast.error('Unable to start trial setup. Please try again.');
          return;
        }

        if (checkoutData?.checkout_url) {
          if (import.meta.env.DEV) {
            console.log('[SubscriptionBlockingModal] Opening Stripe checkout for trial setup');
          }
          window.open(checkoutData.checkout_url, '_blank');
          toast.success('Please complete your registration in the opened tab');
          return;
        } else {
          toast.error('No checkout URL received');
          return;
        }
      }

      // User has stripeCustomerId, open customer portal for subscription management
      if (import.meta.env.DEV) {
        console.log('[SubscriptionBlockingModal] Opening customer portal for existing customer');
      }

      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        if (import.meta.env.DEV) {
          console.error('[SubscriptionBlockingModal] Customer portal error:', error);
        }
        toast.error('Failed to open subscription management');
        return;
      }

      if (data?.url) {
        if (import.meta.env.DEV) {
          console.log('[SubscriptionBlockingModal] Opening portal URL:', data.url);
        }
        window.open(data.url, '_blank');
      } else {
        toast.error('No portal URL received');
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[SubscriptionBlockingModal] Unexpected error:', error);
      }
      toast.error('Failed to open subscription management');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md [&>button]:hidden">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl font-semibold text-brown-800">
            {modalMessage.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center py-6">
          <p className="text-brown-600 mb-6">
            {modalMessage.description}
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={handleActivateSubscription}
              className="w-full bg-warmgreen-600 hover:bg-warmgreen-700 text-white"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "Opening..." : modalMessage.buttonText}
            </Button>
            
            <Button 
              onClick={handleSignOut}
              variant="outline"
              className="w-full border-warmbeige-300 text-brown-700 hover:bg-warmbeige-100"
              size="lg"
            >
              Sign out
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionBlockingModal;