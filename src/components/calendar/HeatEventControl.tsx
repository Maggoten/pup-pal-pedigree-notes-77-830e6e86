import React, { useState } from 'react';
import { CalendarEvent } from './types';
import { Dog } from '@/context/DogsContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Heart, Calendar, Clock, StopCircle } from 'lucide-react';
import { markHeatAsStarted } from '@/services/CalendarEventService';
import { toast } from '@/hooks/use-toast';
import { HeatService } from '@/services/HeatService';
import EndHeatCycleDialog from '@/components/dogs/heat-tracking/EndHeatCycleDialog';
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
      const heatCycle = await HeatService.getActiveHeatCycle(event.dogId);
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
          
          <div className="pt-2 border-t border-rose-200">
            <Button
              onClick={handleEndHeatClick}
              disabled={isLoadingHeatCycle}
              variant="outline"
              className="w-full border-rose-300 text-rose-700 hover:bg-rose-50"
              size="sm"
            >
              <StopCircle className="mr-2 h-4 w-4" />
              {isLoadingHeatCycle ? 'Loading...' : 'End Heat Cycle'}
            </Button>
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
    </div>
  );
};

export default HeatEventControl;