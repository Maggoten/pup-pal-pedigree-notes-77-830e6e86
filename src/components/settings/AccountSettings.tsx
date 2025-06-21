
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/AuthProvider';
import DeleteAccountSection from './DeleteAccountSection';
import SubscriptionSettings from '@/components/subscription/SubscriptionSettings';
import ChangePasswordForm from './ChangePasswordForm';

const AccountSettings: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Manage your account settings and user preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-1">
            <p className="text-sm font-medium">Email</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium">Name</p>
            <p className="text-sm text-muted-foreground">
              {user?.firstName} {user?.lastName}
            </p>
          </div>
          
          <Button variant="outline" onClick={handleLogout}>
            Sign out
          </Button>
        </CardContent>
      </Card>
      
      <SubscriptionSettings />
      
      <ChangePasswordForm />
      
      <DeleteAccountSection />
    </div>
  );
};

export default AccountSettings;
