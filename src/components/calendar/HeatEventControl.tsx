import React, { useState } from 'react';
import { CalendarEvent } from './types';
import { Dog } from '@/context/DogsContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Heart, Calendar, Clock } from 'lucide-react';
import { markHeatAsStarted } from '@/services/CalendarEventService';
import { toast } from '@/components/ui/use-toast';

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
        </div>
      )}
    </div>
  );
};

export default HeatEventControl;