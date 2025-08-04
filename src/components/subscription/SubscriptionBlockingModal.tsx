import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SubscriptionBlockingModalProps {
  isOpen: boolean;
}

const SubscriptionBlockingModal: React.FC<SubscriptionBlockingModalProps> = ({ isOpen }) => {
  const { logout, user, subscriptionStatus, trialEndDate } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState({
    title: 'Your free trial has ended',
    description: 'To continue using Breeding Journey, please activate your subscription.',
    buttonText: 'Activate Subscription'
  });

  // Update modal message based on subscription status and customer profile
  useEffect(() => {
    if (!isOpen) return;

    const updateModalMessage = async () => {
      if (import.meta.env.DEV) {
        console.log('[SubscriptionBlockingModal] Current subscription status:', { 
          subscriptionStatus, 
          trialEndDate 
        });
      }

      // Check if user has existing Stripe customer ID to determine button text
      let hasStripeCustomer = false;
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('stripe_customer_id')
          .eq('id', user?.id)
          .single();
        
        hasStripeCustomer = !!profile?.stripe_customer_id;
      } catch (error) {
        if (import.meta.env.DEV) {
          console.log('[SubscriptionBlockingModal] Could not fetch profile, assuming new user');
        }
      }

      if (subscriptionStatus === 'canceled') {
        setModalMessage({
          title: 'Subscription Cancelled',
          description: 'Your subscription was cancelled and your trial period has ended. To continue using Breeding Journey, please reactivate your subscription.',
          buttonText: 'Manage Subscription'
        });
      } else if (subscriptionStatus === 'past_due') {
        setModalMessage({
          title: 'Payment Required',
          description: 'Your payment is past due. Please update your payment method to continue using Breeding Journey.',
          buttonText: 'Manage Subscription'
        });
      } else if (subscriptionStatus === 'inactive' || !subscriptionStatus) {
        setModalMessage({
          title: 'Complete Your Registration',
          description: 'To access Breeding Journey, please complete your payment setup and start your 30-day free trial.',
          buttonText: hasStripeCustomer ? 'Manage Subscription' : 'Start Free Trial'
        });
      } else {
        // Default message for trial ended
        setModalMessage({
          title: 'Your free trial has ended',
          description: 'To continue using Breeding Journey, please activate your subscription.',
          buttonText: 'Manage Subscription'
        });
      }
    };

    updateModalMessage();
  }, [isOpen, subscriptionStatus, trialEndDate, user?.id]);

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

      // Check if user has a stripe_customer_id first
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('stripe_customer_id, subscription_status')
        .eq('id', user?.id)
        .single();

      if (profileError) {
        if (import.meta.env.DEV) {
          console.error('[SubscriptionBlockingModal] Error fetching profile:', profileError);
        }
        toast.error('Unable to retrieve account information');
        return;
      }

      // If no stripe_customer_id, use registration checkout for payment collection
      if (!profile?.stripe_customer_id) {
        if (import.meta.env.DEV) {
          console.log('[SubscriptionBlockingModal] No stripe_customer_id found, redirecting to registration checkout');
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

      // User has stripe_customer_id, open customer portal for subscription management
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