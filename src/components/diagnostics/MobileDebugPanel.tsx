
import React, { useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useBreedingStats } from '@/hooks/useBreedingStats';
import { useCalendarContext } from '@/context/CalendarContext';
import { useReminders } from '@/context/RemindersContext'; 
import { Separator } from '@/components/ui/separator';

const MobileDebugPanel: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { stats, isLoading: statsLoading } = useBreedingStats();
  const { 
    events, 
    addEvent, 
    updateEvent, 
    deleteEvent, 
    getEventsForDay,
    isLoading: eventsLoading 
  } = useCalendarContext();
  
  const { 
    reminders, 
    isLoading: remindersLoading, 
    handleMarkComplete,
    remindersSummary
  } = useReminders();

  const togglePanel = () => {
    setOpen(prev => !prev);
  };

  // Function to refresh each data source
  const refreshCalendarData = () => {
    console.log("Refreshing calendar data...");
    // If the calendar context has a refresh function, call it
    if ('refreshEvents' in useCalendarContext()) {
      (useCalendarContext() as any).refreshEvents();
    }
  };

  // Function to manually refresh reminders data - stub since it doesn't exist in context
  const refreshReminderData = () => {
    console.log("Refreshing reminder data...");
    // If the reminders context has a refresh function, call it
    if ('refreshReminders' in useReminders()) {
      (useReminders() as any).refreshReminders();
    }
  };

  // Function to refresh breeding stats
  const refreshBreedingStats = () => {
    console.log("Refreshing breeding stats...");
    // If the breeding stats hook has a refresh function, call it
    if ('refreshStats' in useBreedingStats()) {
      (useBreedingStats() as any).refreshStats();
    }
  };

  if (!open) {
    return (
      <Button 
        className="fixed bottom-4 left-4 z-50 h-10 w-10 rounded-full p-2 text-xs"
        variant="secondary"
        onClick={togglePanel}
      >
        Debug
      </Button>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-secondary text-secondary-foreground border-t border-muted/50">
      <div className="flex items-center justify-between p-4">
        <h4 className="text-sm font-bold">Mobile Debug Panel</h4>
        <Button variant="outline" size="sm" onClick={togglePanel}>
          Close
        </Button>
      </div>
      <Separator />
      <ScrollArea className="max-h-64">
        <div className="p-4 space-y-4">
          <div>
            <h5 className="text-xs font-bold">Breeding Stats</h5>
            <p className="text-xs">Is Loading: {String(statsLoading)}</p>
            {stats && (
              <pre className="text-xs">{JSON.stringify(stats, null, 2)}</pre>
            )}
            <Button variant="outline" size="sm" onClick={refreshBreedingStats}>
              Refresh Stats
            </Button>
          </div>
          <Separator />
          <div>
            <h5 className="text-xs font-bold">Calendar Events</h5>
            <p className="text-xs">Is Loading: {String(eventsLoading)}</p>
            {events && (
              <pre className="text-xs">{JSON.stringify(events, null, 2)}</pre>
            )}
            <Button variant="outline" size="sm" onClick={refreshCalendarData}>
              Refresh Calendar
            </Button>
          </div>
          <Separator />
          <div>
            <h5 className="text-xs font-bold">Reminders</h5>
            <p className="text-xs">Is Loading: {String(remindersLoading)}</p>
            {reminders && (
              <pre className="text-xs">{JSON.stringify(reminders, null, 2)}</pre>
            )}
            <Button variant="outline" size="sm" onClick={refreshReminderData}>
              Refresh Reminders
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default MobileDebugPanel;
