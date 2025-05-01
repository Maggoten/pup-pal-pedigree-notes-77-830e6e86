
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BellRing, PawPrint, Loader2 } from 'lucide-react';
import RemindersList from './reminders/RemindersList';
import { useBreedingReminders } from '@/hooks/reminders';
import RemindersDialog from './reminders/RemindersDialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

const BreedingReminders: React.FC = () => {
  const { reminders, isLoading, hasError, handleMarkComplete, refreshReminders } = useBreedingReminders();
  const [remindersDialogOpen, setRemindersDialogOpen] = useState(false);
  
  // Take only the top 3 high priority reminders for compact view
  const highPriorityReminders = useMemo(() => {
    return reminders
      .filter(r => r.priority === 'high')
      .slice(0, 3);
  }, [reminders]);
  
  // Determine which reminders to display
  const displayReminders = useMemo(() => {
    if (highPriorityReminders.length > 0) {
      return highPriorityReminders;
    } 
    return reminders.slice(0, 3);
  }, [highPriorityReminders, reminders]);
  
  return (
    <>
      <Card className="border-greige-300 shadow-sm overflow-hidden transition-shadow hover:shadow-md h-full relative bg-greige-50">
        {/* Decorative background elements */}
        <div className="absolute top-1 right-1 opacity-5">
          <PawPrint className="h-40 w-40 text-primary transform rotate-12" />
        </div>
        
        <CardHeader className="bg-gradient-to-r from-greige-100 to-transparent border-b border-greige-200 pb-3 relative">
          <div className="absolute top-6 right-6">
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
            Important tasks and upcoming events
          </CardDescription>
        </CardHeader>
        
        {/* Fixed height container to prevent layout shifts */}
        <div className="h-[500px] relative">
          <CardContent className="p-0 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                <span className="text-sm text-muted-foreground">Loading reminders...</span>
                
                {/* Add skeleton loaders to maintain layout */}
                <div className="absolute inset-0 opacity-30 p-4">
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center gap-3 p-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : hasError ? (
              <Alert variant="destructive" className="m-4">
                <AlertDescription>
                  There was a problem loading your reminders. Please try again later.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="opacity-100 transition-opacity duration-300">
                <RemindersList 
                  reminders={displayReminders} 
                  onComplete={handleMarkComplete} 
                  compact={true} 
                />
                
                <div className="p-3 text-center">
                  <button 
                    onClick={() => setRemindersDialogOpen(true)}
                    className="text-xs text-primary hover:text-primary/70 font-medium"
                  >
                    View All Reminders
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </div>
        
        {/* Paw print indicator at the bottom */}
        <div className="absolute bottom-2 right-2 opacity-30">
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
};

export default BreedingReminders;
