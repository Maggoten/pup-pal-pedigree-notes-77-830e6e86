import React, { useState } from 'react';
import { CalendarEvent } from './types';
import { Dog } from '@/context/DogsContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Heart, Calendar, Clock, StopCircle, Trash2 } from 'lucide-react';
import { markHeatAsStarted, deleteEventFromSupabase } from '@/services/CalendarEventService';
import { toast } from '@/hooks/use-toast';
import { HeatService } from '@/services/HeatService';
import { HeatCalendarSyncService } from '@/services/HeatCalendarSyncService';
import EndHeatCycleDialog from '@/components/dogs/heat-tracking/EndHeatCycleDialog';
import DeleteConfirmationDialog from '@/components/litters/puppies/DeleteConfirmationDialog';
import type { Database } from '@/integrations/supabase/types';

type HeatCycle = Database['public']['Tables']['heat_cycles']['Row'];

interface HeatEventControlProps {
  event: CalendarEvent;
  dogs: Dog[];
  onEventUpdate: () => void;
}

const HeatEventControl: React.FC<HeatEventControlProps> = ({ 
  event, 
  dogs, 
  onEventUpdate 
}) => {
  const [isStarting, setIsStarting] = useState(false);
  const [isEndDialogOpen, setIsEndDialogOpen] = useState(false);
  const [activeHeatCycle, setActiveHeatCycle] = useState<HeatCycle | null>(null);
  const [isLoadingHeatCycle, setIsLoadingHeatCycle] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Only show heat controls for heat type events
  if (event.type !== 'heat' && event.type !== 'heat-active') {
    return null;
  }
  
  const isHeatActive = event.status === 'active' || event.type === 'heat-active';
  const isHeatPredicted = event.status === 'predicted';
  
  const handleHeatStarted = async () => {
    if (!isHeatPredicted) return;
    
    setIsStarting(true);
    try {
      const success = await markHeatAsStarted(event.id, dogs);
      if (success) {
        onEventUpdate(); // Refresh the calendar
        toast({
          title: 'Heat Started',
          description: `${event.dogName}'s heat cycle is now active. Check the calendar for ovulation prediction and fertility window.`,
        });
      }
    } catch (error) {
      console.error('Error marking heat as started:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark heat as started. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsStarting(false);
    }
  };

  const getHeatPhaseInfo = () => {
    if (!isHeatActive) return null;
    
    const startDate = new Date(event.startDate || event.date);
    const today = new Date();
    const dayInCycle = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    let phase = 'Proestrus';
    let description = 'Early heat phase - not yet fertile';
    let phaseColor = 'text-rose-600';
    
    if (dayInCycle > 9 && dayInCycle <= 16) {
      phase = 'Estrus';
      description = 'Peak fertility window - optimal for breeding';
      phaseColor = 'text-red-600 font-semibold';
    } else if (dayInCycle > 16) {
      phase = 'Metestrus';
      description = 'Late heat phase - fertility declining';
      phaseColor = 'text-rose-500';
    }
    
    return { phase, description, dayInCycle, phaseColor };
  };

  const handleEndHeatClick = async () => {
    if (!event.dogId) return;
    
    setIsLoadingHeatCycle(true);
    try {
      let heatCycle = await HeatService.getActiveHeatCycle(event.dogId);
      
      // If no heat cycle found but calendar shows active heat (legacy case)
      if (!heatCycle && isHeatActive) {
        console.log('No heat cycle found, attempting to create from calendar event (legacy support)');
        toast({
          title: 'Creating Heat Cycle',
          description: 'Creating heat cycle from calendar data...',
        });
        
        try {
          // Convert CalendarEvent to the format expected by createHeatCycleFromCalendar
          const calendarEventData = {
            ...event,
            dog_id: event.dogId || '',
            dog_name: event.dogName || '',
            created_at: '',
            updated_at: '',
            user_id: '',
            date: typeof event.date === 'string' ? event.date : event.date.toISOString(),
            startDate: typeof event.startDate === 'string' ? event.startDate : event.startDate.toISOString(),
            endDate: typeof event.endDate === 'string' ? event.endDate : (event.endDate || event.date).toString(),
            end_date: typeof event.endDate === 'string' ? event.endDate : (event.endDate || event.date).toString(),
            heat_phase: event.heatPhase || '',
            pregnancy_id: '',
            status: event.status || '',
            time: event.time || '',
            type: event.type || '',
            notes: event.notes || ''
          };
          
          heatCycle = await HeatCalendarSyncService.createHeatCycleFromCalendar(calendarEventData, event.dogId);
          if (heatCycle) {
            toast({
              title: 'Heat Cycle Created',
              description: 'Successfully created heat cycle from calendar data.',
            });
          }
        } catch (createError) {
          console.error('Error creating heat cycle from calendar:', createError);
          toast({
            title: 'Legacy Heat Cycle',
            description: 'Cannot end this heat cycle automatically. Please use the calendar to remove the event.',
            variant: 'destructive'
          });
          return;
        }
      }
      
      if (heatCycle) {
        setActiveHeatCycle(heatCycle);
        setIsEndDialogOpen(true);
      } else {
        toast({
          title: 'No Active Heat Cycle',
          description: 'No active heat cycle found for this dog.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching active heat cycle:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch heat cycle data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingHeatCycle(false);
    }
  };

  const handleEndHeatSuccess = () => {
    setIsEndDialogOpen(false);
    setActiveHeatCycle(null);
    onEventUpdate(); // Refresh the calendar
    toast({
      title: 'Heat Cycle Ended',
      description: 'The heat cycle has been ended and calendar updated.',
    });
  };

  const handleDeleteHeatClick = async () => {
    if (!event.dogId) return;
    
    setIsDeleting(true);
    try {
      // Check if there's an associated heat cycle in the database
      const heatCycle = await HeatService.getActiveHeatCycle(event.dogId);
      
      if (heatCycle) {
        // Delete heat cycle from database (this also removes from heat history)
        const deleteSuccess = await HeatService.deleteHeatCycle(heatCycle.id);
        if (!deleteSuccess) {
          throw new Error('Failed to delete heat cycle from database');
        }
        
        // Remove all related calendar events
        await HeatCalendarSyncService.removeCalendarEventsForHeatCycle(event.dogId);
      } else {
        // Legacy calendar event - just delete the calendar event
        await deleteEventFromSupabase(event.id);
        
        // Also try to clean up any related events for this dog
        await HeatCalendarSyncService.removeCalendarEventsForHeatCycle(event.dogId);
      }
      
      setIsDeleteDialogOpen(false);
      onEventUpdate(); // Refresh the calendar
      toast({
        title: 'Heat Cycle Deleted',
        description: 'The heat cycle and all related data have been removed.',
      });
    } catch (error) {
      console.error('Error deleting heat cycle:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete heat cycle. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const phaseInfo = getHeatPhaseInfo();

  return (
    <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Heart className="h-5 w-5 text-rose-600" />
        <h3 className="font-semibold text-rose-900">Heat Cycle Management</h3>
      </div>
      
      {isHeatPredicted && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="heat-started" className="text-sm font-medium">
                Mark heat as started
              </Label>
              <p className="text-xs text-muted-foreground">
                This will create a 21-day active heat period with ovulation prediction
              </p>
            </div>
            <Switch
              id="heat-started"
              checked={false}
              onCheckedChange={handleHeatStarted}
              disabled={isStarting}
            />
          </div>
          
          <Button
            onClick={handleHeatStarted}
            disabled={isStarting}
            className="w-full bg-rose-600 hover:bg-rose-700"
            size="sm"
          >
            {isStarting ? 'Starting Heat Cycle...' : 'Start Heat Cycle'}
          </Button>
        </div>
      )}
      
      {isHeatActive && phaseInfo && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-rose-600" />
            <span className="text-sm font-medium">Heat Status: Active</span>
          </div>
          
          <div className="bg-white rounded p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Phase:</span>
              <span className={`text-sm ${phaseInfo.phaseColor}`}>
                {phaseInfo.phase}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Day in Cycle:</span>
              <span className="text-sm text-muted-foreground">
                Day {phaseInfo.dayInCycle} of 21
              </span>
            </div>
            
            <p className="text-xs text-muted-foreground mt-2">
              {phaseInfo.description}
            </p>
          </div>
          
          {phaseInfo.dayInCycle >= 10 && phaseInfo.dayInCycle <= 16 && (
            <div className="bg-amber-50 border border-amber-200 rounded p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-800">
                  Optimal Breeding Window
                </span>
              </div>
              <p className="text-xs text-amber-700">
                This is the best time for breeding. Check the fertility window event on your calendar.
              </p>
            </div>
          )}
          
          <div className="pt-2 border-t border-rose-200 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleEndHeatClick}
                disabled={isLoadingHeatCycle || isDeleting}
                variant="outline"
                className="border-rose-300 text-rose-700 hover:bg-rose-50"
                size="sm"
              >
                <StopCircle className="mr-2 h-4 w-4" />
                {isLoadingHeatCycle ? 'Loading...' : 'End Cycle'}
              </Button>
              
              <Button
                onClick={() => setIsDeleteDialogOpen(true)}
                disabled={isLoadingHeatCycle || isDeleting}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
                size="sm"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {activeHeatCycle && (
        <EndHeatCycleDialog
          open={isEndDialogOpen}
          onOpenChange={setIsEndDialogOpen}
          heatCycle={activeHeatCycle}
          onSuccess={handleEndHeatSuccess}
        />
      )}
      
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteHeatClick}
        title="Delete Heat Cycle"
        description="Are you sure you want to delete this heat cycle? This will remove all heat data, logs, and related calendar events."
        itemDetails={`${event.dogName}'s heat cycle from ${new Date(event.startDate || event.date).toLocaleDateString()}`}
      />
    </div>
  );
};

export default HeatEventControl;