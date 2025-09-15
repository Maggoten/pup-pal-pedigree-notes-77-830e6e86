
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/AuthProvider';
import { useTranslation } from 'react-i18next';
import DeleteAccountSection from './DeleteAccountSection';
import SubscriptionSettings from '@/components/subscription/SubscriptionSettings';
import ChangePasswordForm from './ChangePasswordForm';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import SharingSettings from './SharingSettings';
import { useSettings } from '@/hooks/useSettings';

const AccountSettings: React.FC = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation('settings');
  const { settings } = useSettings();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('account.title')}</CardTitle>
          <CardDescription>
            {t('account.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-1">
            <p className="text-sm font-medium">{t('account.fields.email')}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium">{t('account.fields.name')}</p>
            <p className="text-sm text-muted-foreground">
              {user?.firstName} {user?.lastName}
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">{t('account.fields.language')}</p>
            <LanguageSwitcher />
          </div>
          
          <Button variant="outline" onClick={handleLogout}>
            {t('account.actions.logout')}
          </Button>
        </CardContent>
      </Card>
      
      <SubscriptionSettings />
      
      <ChangePasswordForm />
      
      {settings && <SharingSettings settings={settings} />}
      
      <DeleteAccountSection />
    </div>
  );
};

export default AccountSettings;
