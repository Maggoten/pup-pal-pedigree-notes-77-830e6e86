
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserSettings } from '@/types/settings';

interface AccountSettingsProps {
  settings: UserSettings | null;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ settings }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [password, setPassword] = useState('');
  
  // Get necessary functions and state from useSettings hook
  const { deleteAccount, cancelSubscription, isCancellingSubscription, isDeletingAccount } = useSettings();
  
  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!password.trim()) return;
    
    const success = await deleteAccount(password);
    if (success) {
      // Redirect to login or show success message
      // This will happen automatically if the hook is set up correctly
    }
    
    // Reset form regardless of outcome
    setPassword('');
    setShowDeleteConfirm(false);
  };
  
  if (!settings) {
    return <div className="text-center p-4">Loading account settings...</div>;
  }
  
  return (
    <div className="space-y-6">
      {/* Subscription Information */}
      <div>
        <h3 className="text-lg font-medium">Subscription</h3>
        <div className="mt-4 p-4 border rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <p>Current Plan: <span className="font-medium capitalize">{settings.subscriptionTier}</span></p>
              <p className="text-sm text-muted-foreground">
                Renews on {settings.subscriptionEndsAt.toLocaleDateString()}
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => cancelSubscription()}
              disabled={isCancellingSubscription || settings.subscriptionTier === 'free'}
            >
              {isCancellingSubscription ? 'Processing...' : 'Cancel Subscription'}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Danger Zone - Delete Account */}
      <div>
        <h3 className="text-lg font-medium text-red-500">Danger Zone</h3>
        <div className="mt-4 p-4 border border-red-200 rounded-md bg-red-50">
          {showDeleteConfirm ? (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertDescription>
                  This action cannot be undone. All your data will be permanently deleted.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Enter your password to confirm</Label>
                <Input 
                  id="confirm-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAccount}
                  disabled={!password.trim() || isDeletingAccount}
                >
                  {isDeletingAccount ? 'Deleting...' : 'Confirm Delete'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setPassword('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p>Delete your account and all associated data</p>
              <Button 
                variant="destructive" 
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete Account
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Import at the top of the file
import { useSettings } from '@/hooks/useSettings';

export default AccountSettings;
