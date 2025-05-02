
import React, { useState, memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BellRing, PawPrint, Loader2, Bell } from 'lucide-react';
import RemindersList from './reminders/RemindersList';
import RemindersDialog from './reminders/RemindersDialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Reminder } from '@/types/reminders';
import { Button } from './ui/button';

interface RemindersData {
  reminders: Reminder[];
  isLoading: boolean;
  hasError: boolean;
  handleMarkComplete: (id: string) => void;
}

interface BreedingRemindersProps {
  remindersData?: RemindersData;
}

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
  const displayReminders = [
    ...highPriorityReminders,
    ...mediumPriorityReminders,
    ...lowPriorityReminders
  ];
  
  // If no active reminders, show completed ones
  if (displayReminders.length === 0 && reminders.length > 0) {
    const completedReminders = reminders
      .filter(r => r.isCompleted)
      .slice(0, 3);
    
    displayReminders.push(...completedReminders);
  }
  
  const hasReminders = displayReminders.length > 0;
  
  return (
    <>
      <Card className="border-greige-300 shadow-sm overflow-hidden transition-shadow hover:shadow-md h-full relative bg-greige-50 flex flex-col">
        {/* Decorative background elements */}
        <div className="absolute top-1 right-1 opacity-5 pointer-events-none">
          <PawPrint className="h-40 w-40 text-primary transform rotate-12" />
        </div>
        
        <CardHeader className="bg-gradient-to-r from-greige-100 to-transparent border-b border-greige-200 pb-3 relative flex-shrink-0">
          <div className="absolute top-6 right-6 pointer-events-none">
            <div className="relative">
              <div className="absolute animate-ping w-3 h-3 rounded-full bg-primary/30"></div>
              <div className="w-3 h-3 rounded-full bg-primary/60"></div>
            </div>
          </div>
          
          <CardTitle className="flex items-center gap-2 text-primary">
            <BellRing className="h-5 w-5" />
            Breeding Reminders
          </CardTitle>
          <CardDescription>
            {hasReminders 
              ? "Important tasks and upcoming events" 
              : "All tasks completed - great job!"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 flex flex-col flex-grow overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center flex-grow py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <span className="text-sm text-muted-foreground">Loading reminders...</span>
            </div>
          ) : hasError ? (
            <div className="p-4 flex-grow">
              <Alert variant="destructive">
                <AlertDescription>
                  There was a problem loading your reminders. Please try again later.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <>
              <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                <RemindersList 
                  reminders={displayReminders} 
                  onComplete={handleMarkComplete} 
                  compact={true} 
                />
              </div>
              
              <div className="p-3 text-center mt-auto flex-shrink-0">
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
      
      <RemindersDialog 
        open={remindersDialogOpen} 
        onOpenChange={setRemindersDialogOpen} 
      />
    </>
  );
});

BreedingReminders.displayName = 'BreedingReminders';

export default BreedingReminders;
