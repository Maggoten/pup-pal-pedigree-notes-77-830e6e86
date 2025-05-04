
import React, { Suspense } from 'react';
import { Bell, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CardContent } from '@/components/ui/card';
import { lazy } from 'react';
import { RemindersData } from './types';
import { useDisplayReminders } from './useDisplayReminders';
import RemindersListSkeleton from './RemindersListSkeleton';

const RemindersList = lazy(() => import('../reminders/RemindersList'));

interface RemindersContentProps {
  showContent: boolean;
  hasError: boolean;
  remindersData: RemindersData;
  onOpenDialog: () => void;
}

const RemindersContent: React.FC<RemindersContentProps> = ({
  showContent,
  hasError,
  remindersData,
  onOpenDialog
}) => {
  const { reminders, handleMarkComplete } = remindersData;
  const { displayReminders, hasReminders } = useDisplayReminders(reminders);

  if (!showContent) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <span className="text-sm text-muted-foreground">Loading reminders...</span>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertDescription>
            There was a problem loading your reminders. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
        <Suspense fallback={<RemindersListSkeleton />}>
          <RemindersList 
            reminders={displayReminders} 
            onComplete={handleMarkComplete} 
            compact={true} 
          />
        </Suspense>
      </div>
      
      <div className="p-3 text-center">
        <Button
          variant="ghost"
          size="sm" 
          onClick={onOpenDialog}
          className="text-xs text-primary hover:text-primary/70 font-medium flex items-center gap-1"
        >
          <Bell className="h-3 w-3" />
          View All Reminders {reminders?.length > 0 && `(${reminders.length})`}
        </Button>
      </div>
    </>
  );
};

export default RemindersContent;
