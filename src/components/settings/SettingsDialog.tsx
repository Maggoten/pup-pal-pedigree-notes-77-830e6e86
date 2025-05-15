
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AccountSettings from './AccountSettings';
import PersonalSettings from './PersonalSettings';
import SharingSettings from './SharingSettings';
import { useSettings } from '@/hooks/useSettings';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({ open, onOpenChange }) => {
  const [activeTab, setActiveTab] = useState('personal');
  const { settings, error, isLoading } = useSettings();
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="pt-2 pb-6">
          {isLoading ? (
            <div className="p-4 text-center">Loading settings...</div>
          ) : error ? (
            <div className="p-4 text-red-500 text-center">{error}</div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="sharing">Sharing</TabsTrigger>
                <TabsTrigger value="account">Account</TabsTrigger>
              </TabsList>
              <TabsContent value="personal" className="py-6">
                <PersonalSettings settings={settings} />
              </TabsContent>
              <TabsContent value="sharing" className="py-6">
                <SharingSettings />
              </TabsContent>
              <TabsContent value="account" className="py-6">
                <AccountSettings settings={settings} />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
