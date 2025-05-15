
import React, { useState, memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BellRing, PawPrint, Loader2, Bell } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Reminder } from '@/types/reminders';
import { Button } from './ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import RemindersList from './reminders/RemindersList';
import RemindersDialog from './reminders/RemindersDialog';

interface RemindersData {
  reminders: Reminder[];
  isLoading: boolean;
  hasError: boolean;
  handleMarkComplete: (id: string) => void;
}

interface BreedingRemindersProps {
  remindersData?: RemindersData;
}

// Skeleton component for reminders list
const RemindersListSkeleton = () => (
  <div className="p-4 space-y-4">
    {Array(3).fill(0).map((_, i) => (
      <div key={i} className="flex items-center space-x-4">
        <Skeleton className="h-5 w-5 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

// Use memo to prevent unnecessary re-renders
const BreedingReminders: React.FC<BreedingRemindersProps> = memo(({ remindersData }) => {
  const [remindersDialogOpen, setRemindersDialogOpen] = useState(false);
  
  // Use provided data or empty defaults
  const { 
    reminders = [], 
    isLoading = false, 
    hasError = false, 
    handleMarkComplete = () => {} 
  } = remindersData || {};
  
  // Memoize the priority filtering logic to avoid recalculating on every render
  const displayReminders = React.useMemo(() => {
    // First prioritize active high priority reminders
    const highPriorityReminders = reminders
      .filter(r => r.priority === 'high' && !r.isCompleted)
      .slice(0, 3);
    
    // Then medium priority reminders if we need more
    const mediumPriorityReminders = reminders
      .filter(r => r.priority === 'medium' && !r.isCompleted)
      .slice(0, 3 - highPriorityReminders.length);
      
    // Finally low priority if needed
    const lowPriorityReminders = reminders
      .filter(r => r.priority === 'low' && !r.isCompleted)
      .slice(0, 3 - highPriorityReminders.length - mediumPriorityReminders.length);
    
    // Combine all reminders in priority order
    const result = [
      ...highPriorityReminders,
      ...mediumPriorityReminders,
      ...lowPriorityReminders
    ];
    
    // If no active reminders, show completed ones
    if (result.length === 0 && reminders.length > 0) {
      const completedReminders = reminders
        .filter(r => r.isCompleted)
        .slice(0, 3);
      
      result.push(...completedReminders);
    }

    return result;
  }, [reminders]);
  
  const hasReminders = displayReminders.length > 0;
  
  return (
    <>
      <Card className="border-warmbeige-300 shadow-sm overflow-hidden transition-shadow hover:shadow-md relative bg-warmbeige-50 flex flex-col">
        {/* Decorative background elements */}
        <div className="absolute top-1 right-1 opacity-5 pointer-events-none">
          <PawPrint className="h-40 w-40 text-primary transform rotate-12" />
        </div>
        
        <CardHeader className="bg-gradient-to-r from-warmbeige-100 to-transparent border-b border-warmbeige-200 pb-3 relative">
          <div className="absolute top-6 right-6 pointer-events-none">
            <div className="relative">
              <div className="absolute animate-ping w-3 h-3 rounded-full bg-primary/30"></div>
              <div className="w-3 h-3 rounded-full bg-primary/60"></div>
            </div>
          </div>
          
          <CardTitle className="flex items-center gap-2 text-primary">
            <BellRing className="h-5 w-5" />
            Reminders
          </CardTitle>
          <CardDescription>
            {hasReminders 
              ? "Important tasks and upcoming events" 
              : "All tasks completed - great job!"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 flex flex-col overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <span className="text-sm text-muted-foreground">Loading reminders...</span>
            </div>
          ) : hasError ? (
            <div className="p-4">
              <Alert variant="destructive">
                <AlertDescription>
                  There was a problem loading your reminders. Please try again later.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <>
              <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                {isLoading ? <RemindersListSkeleton /> : (
                  <RemindersList 
                    reminders={displayReminders} 
                    onComplete={handleMarkComplete} 
                    compact={true} 
                  />
                )}
              </div>
              
              <div className="p-3 text-center">
                <Button
                  variant="ghost"
                  size="sm" 
                  onClick={() => setRemindersDialogOpen(true)}
                  className="text-xs text-primary hover:text-primary/70 font-medium flex items-center gap-1"
                >
                  <Bell className="h-3 w-3" />
                  View All Reminders {reminders.length > 0 && `(${reminders.length})`}
                </Button>
              </div>
            </>
          )}
        </CardContent>
        
        {/* Paw print indicator at the bottom */}
        <div className="absolute bottom-2 right-2 opacity-30 pointer-events-none">
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <div 
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-primary"
                style={{ opacity: 0.5 + (i * 0.25) }}
              ></div>
            ))}
          </div>
        </div>
      </Card>
      
      {/* Only render dialog when it's open */}
      {remindersDialogOpen && (
        <RemindersDialog 
          open={remindersDialogOpen} 
          onOpenChange={setRemindersDialogOpen} 
        />
      )}
    </>
  );
});

BreedingReminders.displayName = 'BreedingReminders';

export default BreedingReminders;
