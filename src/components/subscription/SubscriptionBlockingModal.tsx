import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SubscriptionBlockingModalProps {
  isOpen: boolean;
}

const SubscriptionBlockingModal: React.FC<SubscriptionBlockingModalProps> = ({ isOpen }) => {
  const { logout, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleActivateSubscription = async () => {
    setIsLoading(true);
    
    try {
      if (import.meta.env.DEV) {
        console.log('[SubscriptionBlockingModal] Starting activation process');
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('You must be logged in to manage your subscription');
        return;
      }

      // Check if user has a stripe_customer_id first
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', user?.id)
        .single();

      if (profileError) {
        if (import.meta.env.DEV) {
          console.error('[SubscriptionBlockingModal] Error fetching profile:', profileError);
        }
        toast.error('Unable to retrieve account information');
        return;
      }

      // If no stripe_customer_id, try to create subscription first
      if (!profile?.stripe_customer_id) {
        if (import.meta.env.DEV) {
          console.log('[SubscriptionBlockingModal] No stripe_customer_id found, creating subscription');
        }
        
        const { data: subscriptionData, error: subscriptionError } = await supabase.functions.invoke('create-subscription', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (subscriptionError) {
          if (import.meta.env.DEV) {
            console.error('[SubscriptionBlockingModal] Error creating subscription:', subscriptionError);
          }
          toast.error('Unable to create subscription. Please try again.');
          return;
        }

        if (import.meta.env.DEV) {
          console.log('[SubscriptionBlockingModal] Subscription created successfully');
        }
      }

      // Now try to open customer portal
      if (import.meta.env.DEV) {
        console.log('[SubscriptionBlockingModal] Opening customer portal');
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
            Your free trial has ended
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center py-6">
          <p className="text-brown-600 mb-6">
            To continue using Breeding Journey, please activate your subscription.
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={handleActivateSubscription}
              className="w-full bg-warmgreen-600 hover:bg-warmgreen-700 text-white"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "Opening..." : "Activate Subscription"}
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