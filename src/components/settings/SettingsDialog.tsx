
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import PersonalSettings from './PersonalSettings';
import AccountSettings from './AccountSettings';
import SharingSettings from './SharingSettings';
import { useSettings } from '@/hooks/useSettings';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({ open, onOpenChange }) => {
  const { settings, isLoading } = useSettings();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Settings</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : settings ? (
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="sharing">Sharing</TabsTrigger>
            </TabsList>
            
            <TabsContent value="personal" className="space-y-4">
              <PersonalSettings settings={settings} />
            </TabsContent>
            
            <TabsContent value="account" className="space-y-4">
              <AccountSettings settings={settings} />
            </TabsContent>
            
            <TabsContent value="sharing" className="space-y-4">
              <SharingSettings settings={settings} />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="p-6 text-center text-muted-foreground">
            Settings could not be loaded. Please try again later.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
