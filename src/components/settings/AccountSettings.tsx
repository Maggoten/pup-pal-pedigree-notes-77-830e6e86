
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserSettings } from '@/types/settings';
import { format } from 'date-fns';
import { AlertTriangle, CreditCard, Shield, Star } from 'lucide-react';

interface AccountSettingsProps {
  settings: UserSettings;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ settings }) => {
  // Function to handle subscription upgrade
  const handleUpgradeSubscription = () => {
    // In a real app, this would redirect to a payment page or open a payment modal
    alert('This would open a payment form in a real application.');
  };
  
  // Since we're refactoring the structure, we'll adapt to get subscription info if available
  // Assuming subscription_status from profile gives us basic info
  const subscriptionTier = settings.profile.subscription_status === 'premium' ? 'premium' : 
                          settings.profile.subscription_status === 'professional' ? 'professional' : 'free';
  
  // Function to format subscription end date
  const formatSubscriptionDate = (date?: Date) => {
    if (!date) return 'N/A';
    try {
      return format(new Date(date), 'MMMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  // Get subscription badge and color
  const getSubscriptionBadge = () => {
    switch (subscriptionTier) {
      case 'premium':
        return <Badge className="bg-amber-500">Premium</Badge>;
      case 'professional':
        return <Badge className="bg-indigo-600">Professional</Badge>;
      default:
        return <Badge variant="outline">Free</Badge>;
    }
  };
  
  // Get subscription features based on tier
  const getSubscriptionFeatures = () => {
    const features = {
      free: [
        'Up to 5 dogs',
        'Basic breeding records',
        'Limited calendar events'
      ],
      premium: [
        'Unlimited dogs',
        'Advanced breeding analysis',
        'Full calendar functionality',
        'Email notifications'
      ],
      professional: [
        'Everything in Premium',
        'Multi-user access',
        'Priority support',
        'Advanced reporting',
        'Data export'
      ]
    };
    
    return features[subscriptionTier as keyof typeof features] || features.free;
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>
                Manage your subscription and billing
              </CardDescription>
            </div>
            {getSubscriptionBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <div className="text-sm font-medium">Current Plan</div>
            <div className="flex items-center gap-2">
              {settings.subscriptionTier === 'free' ? (
                <Shield className="h-5 w-5 text-muted-foreground" />
              ) : settings.subscriptionTier === 'premium' ? (
                <Star className="h-5 w-5 text-amber-500" />
              ) : (
                <CreditCard className="h-5 w-5 text-indigo-600" />
              )}
              <span className="font-semibold capitalize">
                {settings.subscriptionTier || 'Free'} Plan
              </span>
            </div>
            
            {settings.subscriptionTier !== 'free' && settings.subscriptionEndsAt && (
              <div className="text-sm text-muted-foreground">
                Renews on {formatSubscriptionDate(settings.subscriptionEndsAt)}
              </div>
            )}
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Features included:</h4>
            <ul className="space-y-1">
              {getSubscriptionFeatures().map((feature, i) => (
                <li key={i} className="text-sm flex gap-2 items-center">
                  <span className="text-green-500">✓</span> {feature}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          {settings.subscriptionTier === 'free' ? (
            <Button onClick={handleUpgradeSubscription}>Upgrade Subscription</Button>
          ) : (
            <Button variant="outline">Manage Billing</Button>
          )}
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Account Security</CardTitle>
          <CardDescription>
            Manage your account security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium">Password</h4>
              <p className="text-sm text-muted-foreground mt-1">
                It's a good idea to use a strong password that you don't use elsewhere.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t pt-4">
          <Button variant="outline">Change Password</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AccountSettings;
