
import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import SettingsTabs from '@/components/settings/SettingsTabs';

const Settings = () => {
  return (
    <PageLayout
      title="Settings"
      description="Manage your account, subscription and sharing preferences"
      icon={<SettingsIcon className="h-6 w-6" />}
    >
      <div className="max-w-3xl mx-auto">
        <SettingsTabs />
      </div>
    </PageLayout>
  );
};

export default Settings;
