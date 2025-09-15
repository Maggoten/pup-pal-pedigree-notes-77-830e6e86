import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useBreedingReminders } from '@/hooks/useBreedingReminders';

const ForceRemindersRefresh: React.FC = () => {
  const { refreshReminderData } = useBreedingReminders();

  const handleForceRefresh = () => {
    console.log('[ForceRemindersRefresh] User clicked force refresh button');
    refreshReminderData();
  };

  return (
    <div className="p-4 border rounded-lg bg-muted/50">
      <h3 className="text-sm font-medium mb-2">Debug: Force Reminders Refresh</h3>
      <p className="text-xs text-muted-foreground mb-3">
        Click to force regeneration of reminders with proper translation data.
      </p>
      <Button 
        onClick={handleForceRefresh}
        variant="outline" 
        size="sm"
        className="w-full"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Force Refresh Reminders
      </Button>
    </div>
  );
};

export default ForceRemindersRefresh;