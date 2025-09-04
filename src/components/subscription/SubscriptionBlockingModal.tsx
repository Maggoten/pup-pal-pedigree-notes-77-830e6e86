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
  const { logout, user, subscriptionStatus, trialEndDate, stripeCustomerId, checkSubscription } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [customerData, setCustomerData] = useState<any>(null);

  // Helper function to check if customer has default payment method
  const hasDefaultPaymentMethod = (customer: any) => {
    return customer?.invoice_settings?.default_payment_method || customer?.default_source;
  };

  // Handle success callbacks from setup mode
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const setupSuccess = urlParams.get('setup');
    
    if (setupSuccess === 'success') {
      toast.success('Payment method added successfully!');
      checkSubscription?.();
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [checkSubscription]);

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
        console.log('[SubscriptionBlockingModal] Starting activation process:', { 
          subscriptionStatus, 
          hasStripeCustomerId: !!stripeCustomerId 
        });
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('You must be logged in to manage your subscription');
        return;
      }

      // 1. If no stripeCustomerId -> open Checkout (mode: 'subscription')
      if (!stripeCustomerId) {
        if (import.meta.env.DEV) {
          console.log('[SubscriptionBlockingModal] No Stripe customer, routing to subscription checkout');
        }
        
        const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('create-registration-checkout', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (checkoutError) {
          toast.error('Unable to start trial setup. Please try again.');
          return;
        }

        if (checkoutData?.checkout_url) {
          window.open(checkoutData.checkout_url, '_blank');
          toast.success('Please complete your registration in the opened tab');
          return;
        } else {
          toast.error('No checkout URL received');
          return;
        }
      }

      // 2. If status in ['active','trialing'] -> check payment method and route accordingly
      if (subscriptionStatus === 'active' || subscriptionStatus === 'trialing') {
        if (import.meta.env.DEV) {
          console.log('[SubscriptionBlockingModal] Active/trialing customer, checking payment method');
        }

        const { data, error } = await supabase.functions.invoke('customer-portal', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: {
            checkPaymentMethod: true,
            returnUrl: `${window.location.origin}/settings`
          }
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
          
          if (data.flowType === 'setup_mode') {
            toast.success('Please add your payment method in the opened tab');
          } else if (data.flowType === 'payment_method_update') {
            toast.success('Please update your payment method in the opened tab');
          } else {
            toast.success('Opening subscription management');
          }
        } else {
          toast.error('No portal URL received');
        }
        return;
      }

      // 3. Else (has customer but no active subscription) -> open Checkout (mode: 'subscription')
      if (import.meta.env.DEV) {
        console.log('[SubscriptionBlockingModal] Existing customer without active subscription, routing to subscription checkout');
      }
      
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('create-registration-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (checkoutError) {
        toast.error('Unable to start subscription setup. Please try again.');
        return;
      }

      if (checkoutData?.checkout_url) {
        window.open(checkoutData.checkout_url, '_blank');
        toast.success('Please complete your subscription in the opened tab');
      } else {
        toast.error('No checkout URL received');
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