
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import PersonalSettings from './PersonalSettings';
import AccountSettings from './AccountSettings';
import SharingSettings from './SharingSettings';

const SettingsTabs = () => {
  return (
    <Tabs defaultValue="personal" className="w-full">
      <TabsList className="grid grid-cols-3 mb-6">
        <TabsTrigger value="personal">Personal</TabsTrigger>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="sharing">Sharing</TabsTrigger>
      </TabsList>
      
      <TabsContent value="personal" className="space-y-4">
        <PersonalSettings />
      </TabsContent>
      
      <TabsContent value="account" className="space-y-4">
        <AccountSettings />
      </TabsContent>
      
      <TabsContent value="sharing" className="space-y-4">
        <SharingSettings />
      </TabsContent>
    </Tabs>
  );
};

export default SettingsTabs;
