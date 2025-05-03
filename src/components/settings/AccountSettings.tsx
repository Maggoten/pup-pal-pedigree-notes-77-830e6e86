
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserSettings } from '@/types/settings';
import { format } from 'date-fns';
import { UserSettings } from '@/types/settings';
import { format } from 'date-fns';
import { AlertTriangle, CreditCard, Shield, Star, AlertCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface AccountSettingsProps {
  settings: UserSettings;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ settings }) => {
  const { user, logout } = useAuth();
  const [cancelSubscriptionDialogOpen, setCancelSubscriptionDialogOpen] = useState(false);
  const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Function to handle subscription upgrade
  const handleUpgradeSubscription = () => {
    // In a real app, this would redirect to a payment page or open a payment modal
    alert('This would open a payment form in a real application.');
  };
  
  // Function to handle subscription cancellation
  const handleCancelSubscription = async () => {
    setIsProcessing(true);
    try {
      // This would connect to a Supabase edge function to cancel subscription
      // For now we'll just simulate success
      setTimeout(() => {
        toast({
          title: "Subscription cancelled",
          description: "Your subscription has been cancelled. You'll still have access until the end of your billing period.",
        });
        setCancelSubscriptionDialogOpen(false);
        setIsProcessing(false);
      }, 1000);
    } catch (error) {
      toast({
        title: "Error cancelling subscription",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };
  
  // Function to handle account deletion
  const handleDeleteAccount = async () => {
    setIsProcessing(true);
    try {
      // This would connect to a Supabase function to delete account data
      // For now we'll just simulate success
      setTimeout(() => {
        toast({
          title: "Account deleted",
          description: "Your account has been deleted. You will be logged out.",
        });
        setDeleteAccountDialogOpen(false);
        setIsProcessing(false);
        // Log the user out after account deletion
        setTimeout(() => {
          logout();
        }, 2000);
      }, 1000);
    } catch (error) {
      toast({
        title: "Error deleting account",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };
  
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
    switch (settings.subscriptionTier) {
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
    
    return features[settings.subscriptionTier || 'free'] || features.free;
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
        <CardFooter className="flex flex-wrap gap-2 border-t pt-4">
          {settings.subscriptionTier === 'free' ? (
            <Button onClick={handleUpgradeSubscription}>Upgrade Subscription</Button>
          ) : (
            <>
              <Button variant="outline">Manage Billing</Button>
              <Button 
                variant="outline" 
                className="text-amber-600 border-amber-600 hover:bg-amber-50" 
                onClick={() => setCancelSubscriptionDialogOpen(true)}
              >
                Cancel Subscription
              </Button>
            </>
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
      
      {/* Danger Zone Card */}
      <Card className="border-red-200">
        <CardHeader className="border-b border-red-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <CardTitle className="text-red-500">Danger Zone</CardTitle>
          </div>
          <CardDescription>
            Actions in this zone can't be undone
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="rounded-md border border-red-200 p-4 bg-red-50">
            <div className="flex flex-col gap-2">
              <h4 className="text-sm font-medium">Delete Your Account</h4>
              <p className="text-sm text-muted-foreground">
                Once you delete your account, all of your data will be permanently removed. 
                This action cannot be undone.
              </p>
              <div className="mt-2">
                <Button 
                  variant="outline" 
                  className="text-red-600 border-red-600 hover:bg-red-50"
                  onClick={() => setDeleteAccountDialogOpen(true)}
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Cancel Subscription Dialog */}
      <AlertDialog open={cancelSubscriptionDialogOpen} onOpenChange={setCancelSubscriptionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your {settings.subscriptionTier} subscription? 
              You'll still have access until {formatSubscriptionDate(settings.subscriptionEndsAt)}, 
              after which you'll be downgraded to the free plan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <p className="text-sm text-muted-foreground mb-4">
              Type "cancel" to confirm:
            </p>
            <Input 
              value={confirmText} 
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="cancel"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (confirmText.toLowerCase() === 'cancel') {
                  handleCancelSubscription();
                } else {
                  toast({
                    title: "Confirmation failed",
                    description: 'Please type "cancel" to confirm',
                    variant: "destructive",
                  });
                }
              }}
              className="bg-amber-600 hover:bg-amber-700"
              disabled={isProcessing || confirmText.toLowerCase() !== 'cancel'}
            >
              {isProcessing ? "Processing..." : "Cancel Subscription"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Delete Account Dialog */}
      <AlertDialog open={deleteAccountDialogOpen} onOpenChange={setDeleteAccountDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Delete Your Account</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Enter your password to confirm:
              </p>
              <Input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Your password"
              />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Type "DELETE MY ACCOUNT" to confirm:
              </p>
              <Input 
                value={confirmText} 
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE MY ACCOUNT"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (confirmPassword.length > 0 && confirmText === 'DELETE MY ACCOUNT') {
                  handleDeleteAccount();
                } else {
                  toast({
                    title: "Confirmation failed",
                    description: 'Please enter your password and type "DELETE MY ACCOUNT" to confirm',
                    variant: "destructive",
                  });
                }
              }}
              className="bg-red-600 hover:bg-red-700"
              disabled={isProcessing || confirmPassword.length === 0 || confirmText !== 'DELETE MY ACCOUNT'}
            >
              {isProcessing ? "Processing..." : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AccountSettings;
