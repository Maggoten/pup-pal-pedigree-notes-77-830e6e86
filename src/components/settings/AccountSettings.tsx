
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, AlertTriangle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const AccountSettings = () => {
  const { user } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = React.useState<'active' | 'inactive' | 'loading'>('loading');
  
  React.useEffect(() => {
    // Mock loading subscription status
    const timer = setTimeout(() => {
      // In a real app, this would be fetched from your backend
      setSubscriptionStatus('inactive');
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleSubscribe = () => {
    // Mock subscription process
    // In a real app, this would redirect to payment form
    toast({
      title: "Subscription",
      description: "Redirecting to payment page...",
    });
    
    // Mock successful subscription
    setTimeout(() => {
      setSubscriptionStatus('active');
      toast({
        title: "Subscribed!",
        description: "Thank you for subscribing to Breeding Journey Premium!",
      });
    }, 2000);
  };
  
  const handleManageSubscription = () => {
    toast({
      title: "Manage Subscription",
      description: "Opening subscription management...",
    });
  };
  
  const handleCancelSubscription = () => {
    if (confirm("Are you sure you want to cancel your subscription?")) {
      // In a real app, this would call your backend
      setSubscriptionStatus('inactive');
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled. You'll have access until the end of your billing period.",
      });
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Management</CardTitle>
        <CardDescription>
          Manage your subscription to Breeding Journey
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center p-4 border rounded-md bg-background">
          <div className="mr-4">
            <CreditCard className="h-10 w-10 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium">
              {subscriptionStatus === 'loading' && 'Checking subscription status...'}
              {subscriptionStatus === 'active' && 'Breeding Journey Premium'}
              {subscriptionStatus === 'inactive' && 'No Active Subscription'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {subscriptionStatus === 'loading' && 'Please wait...'}
              {subscriptionStatus === 'active' && 'Your subscription is active. You have access to all premium features.'}
              {subscriptionStatus === 'inactive' && 'Subscribe to unlock premium features like sharing your kennel with co-owners.'}
            </p>
          </div>
          <div>
            {subscriptionStatus === 'loading' && (
              <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
            )}
            {subscriptionStatus === 'active' && (
              <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                Active
              </div>
            )}
            {subscriptionStatus === 'inactive' && (
              <div className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded">
                Inactive
              </div>
            )}
          </div>
        </div>
        
        {subscriptionStatus === 'inactive' && (
          <div className="p-4 border rounded-md bg-primary/5 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium mb-1">Premium Features Locked</h4>
              <p className="text-sm text-muted-foreground">
                Without a subscription, you cannot invite co-owners to your kennel or access premium breeding tools.
              </p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        {subscriptionStatus === 'inactive' && (
          <Button onClick={handleSubscribe}>
            <CreditCard className="mr-2 h-4 w-4" />
            Subscribe Now ($2.99/month)
          </Button>
        )}
        
        {subscriptionStatus === 'active' && (
          <>
            <Button variant="outline" onClick={handleManageSubscription}>
              Manage Subscription
            </Button>
            <Button variant="destructive" onClick={handleCancelSubscription}>
              Cancel Subscription
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default AccountSettings;
