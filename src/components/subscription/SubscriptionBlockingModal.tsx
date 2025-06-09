import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SubscriptionBlockingModalProps {
  isOpen: boolean;
}

const SubscriptionBlockingModal: React.FC<SubscriptionBlockingModalProps> = ({ isOpen }) => {
  const { logout } = useAuth();

  const handleActivateSubscription = async () => {
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
            >
              Activate Subscription
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