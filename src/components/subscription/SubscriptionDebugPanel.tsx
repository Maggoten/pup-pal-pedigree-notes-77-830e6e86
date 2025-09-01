import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, RefreshCw } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useSubscriptionAccess } from '@/hooks/useSubscriptionAccess';
import { supabase } from '@/integrations/supabase/client';

const SubscriptionDebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { session, user, checkSubscription } = useAuth();
  const subscriptionAccess = useSubscriptionAccess();

  const collectDebugInfo = async () => {
    setIsLoading(true);
    const info: any = {
      timestamp: new Date().toISOString(),
      auth: {
        hasSession: !!session,
        hasUser: !!user,
        userId: user?.id || 'none',
        email: user?.email || 'none'
      },
      subscription: subscriptionAccess,
      profile: null,
      errors: []
    };

    // Try to fetch profile data
    if (session?.user?.id) {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('stripe_customer_id, subscription_status, has_paid, friend, trial_end_date')
          .eq('id', session.user.id)
          .single();

        if (error) {
          info.errors.push(`Profile fetch error: ${error.message}`);
        } else {
          info.profile = {
            hasStripeCustomerId: !!profile?.stripe_customer_id,
            stripeCustomerIdLength: profile?.stripe_customer_id?.length || 0,
            subscriptionStatus: profile?.subscription_status,
            hasPaid: profile?.has_paid,
            friend: profile?.friend,
            trialEndDate: profile?.trial_end_date
          };
        }
      } catch (error) {
        info.errors.push(`Profile fetch exception: ${error}`);
      }
    }

    setDebugInfo(info);
    setIsLoading(false);
  };

  const handleRefreshSubscription = async () => {
    setIsLoading(true);
    try {
      await checkSubscription();
      await collectDebugInfo();
    } catch (error) {
      console.error('Error refreshing subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Only show in development mode
  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-yellow-100 transition-colors">
            <CardTitle className="flex items-center justify-between text-sm text-yellow-800">
              <span>🐛 Subscription Debug Panel</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button 
                onClick={collectDebugInfo}
                disabled={isLoading}
                size="sm"
                variant="outline"
              >
                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Collect Debug Info'}
              </Button>
              <Button 
                onClick={handleRefreshSubscription}
                disabled={isLoading}
                size="sm"
                variant="outline"
              >
                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Refresh Subscription'}
              </Button>
            </div>

            {debugInfo && (
              <div className="space-y-3 text-xs">
                <div>
                  <Badge variant="outline">Auth Status</Badge>
                  <pre className="mt-1 p-2 bg-white rounded text-xs overflow-auto">
                    {JSON.stringify(debugInfo.auth, null, 2)}
                  </pre>
                </div>

                <div>
                  <Badge variant="outline">Subscription Access</Badge>
                  <pre className="mt-1 p-2 bg-white rounded text-xs overflow-auto">
                    {JSON.stringify(debugInfo.subscription, null, 2)}
                  </pre>
                </div>

                {debugInfo.profile && (
                  <div>
                    <Badge variant="outline">Profile Data</Badge>
                    <pre className="mt-1 p-2 bg-white rounded text-xs overflow-auto">
                      {JSON.stringify(debugInfo.profile, null, 2)}
                    </pre>
                  </div>
                )}

                {debugInfo.errors.length > 0 && (
                  <div>
                    <Badge variant="destructive">Errors</Badge>
                    <pre className="mt-1 p-2 bg-red-50 text-red-800 rounded text-xs overflow-auto">
                      {debugInfo.errors.join('\n')}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default SubscriptionDebugPanel;