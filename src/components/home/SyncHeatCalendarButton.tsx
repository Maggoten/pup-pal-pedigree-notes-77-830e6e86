import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Loader2, Check, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SyncHeatCalendarButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

const SyncHeatCalendarButton: React.FC<SyncHeatCalendarButtonProps> = ({
  variant = 'outline',
  size = 'sm',
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSync = async () => {
    setIsLoading(true);
    
    try {
      console.log('Starting sync of all heat cycles (active & upcoming) to calendar...');
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        toast({
          title: 'Authentication Error',
          description: 'Please log in to sync heat cycles.',
          variant: 'destructive'
        });
        return;
      }
      
      // Get user's dogs using the proper service
      const { fetchDogs } = await import('@/services/dogs/fetchDogs');
      const dogs = await fetchDogs();
      
      // Get all active heat cycles (no end_date)
      const { data: activeHeats, error: heatsError } = await supabase
        .from('heat_cycles')
        .select('*')
        .eq('user_id', user.id)
        .is('end_date', null)
        .order('start_date', { ascending: false });
      
      if (heatsError) {
        console.error('Error fetching active heats:', heatsError);
        toast({
          title: 'Sync Failed',
          description: 'Failed to fetch heat cycles. Please try again.',
          variant: 'destructive'
        });
        return;
      }
      
      // Dynamic imports to avoid circular dependency
      const { HeatCalendarSyncService } = await import('@/services/HeatCalendarSyncService');
      const { ReminderCalendarSyncService } = await import('@/services/ReminderCalendarSyncService');
      const { calculateUpcomingHeatsSafe } = await import('@/utils/heatCalculatorSafe');
      
      let syncedActive = 0;
      let syncedUpcoming = 0;
      const errors: string[] = [];
      
      // 1. Sync active heat cycles
      if (activeHeats && activeHeats.length > 0) {
        console.log(`Found ${activeHeats.length} active heat cycles to sync`);
        
        for (const heat of activeHeats) {
          try {
            // Get dog name separately
            const { data: dog } = await supabase
              .from('dogs')
              .select('name')
              .eq('id', heat.dog_id)
              .single();
            
            const dogName = dog?.name || 'Unknown Dog';
            console.log(`Syncing active heat cycle for ${dogName}...`);
            
            const syncSuccess = await HeatCalendarSyncService.syncHeatCycleToCalendar(heat, dogName);
            
            if (syncSuccess) {
              syncedActive++;
              console.log(`✓ Successfully synced active heat cycle for ${dogName}`);
            } else {
              errors.push(`Failed to sync active heat cycle for ${dogName}`);
            }
          } catch (syncError) {
            errors.push(`Error syncing active heat cycle: ${syncError}`);
            console.error(`Error syncing active heat cycle:`, syncError);
          }
        }
      } else {
        console.log('No active heat cycles found');
      }
      
      // 2. Sync upcoming/predicted heat cycles
      if (dogs && dogs.length > 0) {
        try {
          console.log('Calculating and syncing upcoming heat cycles...');
          const upcomingHeats = await calculateUpcomingHeatsSafe(dogs, 'dogServices');
          
          if (upcomingHeats.length > 0) {
            console.log(`Found ${upcomingHeats.length} upcoming heat cycles to sync`);
            
            for (const heat of upcomingHeats) {
              try {
                console.log(`Syncing upcoming heat cycle for ${heat.dogName}...`);
                
                const syncSuccess = await ReminderCalendarSyncService.syncHeatCycleEvents(heat);
                
                if (syncSuccess) {
                  syncedUpcoming++;
                  console.log(`✓ Successfully synced upcoming heat cycle for ${heat.dogName}`);
                } else {
                  errors.push(`Failed to sync upcoming heat cycle for ${heat.dogName}`);
                }
              } catch (syncError) {
                errors.push(`Error syncing upcoming heat cycle: ${syncError}`);
                console.error(`Error syncing upcoming heat cycle:`, syncError);
              }
            }
          } else {
            console.log('No upcoming heat cycles found');
          }
        } catch (upcomingError) {
          console.error('Error calculating upcoming heats:', upcomingError);
          errors.push('Failed to calculate upcoming heat cycles');
        }
      }
      
      // Show results
      const totalSynced = syncedActive + syncedUpcoming;
      
      if (totalSynced > 0) {
        const message = [];
        if (syncedActive > 0) message.push(`${syncedActive} active heat${syncedActive > 1 ? 's' : ''}`);
        if (syncedUpcoming > 0) message.push(`${syncedUpcoming} upcoming heat${syncedUpcoming > 1 ? 's' : ''}`);
        
        toast({
          title: 'Heat Cycles Synced',
          description: `Successfully synced ${message.join(' and ')} to calendar.`,
        });
      } else if (errors.length === 0) {
        toast({
          title: 'No Heat Cycles to Sync',
          description: 'No active or upcoming heat cycles found to sync.',
        });
      }
      
      if (errors.length > 0) {
        console.error('Sync errors:', errors);
        toast({
          title: 'Sync Issues',
          description: `Synced ${totalSynced} heat cycles with ${errors.length} error(s). Check console for details.`,
          variant: 'destructive'
        });
      }
      
    } catch (error) {
      console.error('Error syncing heat cycles:', error);
      toast({
        title: 'Sync Failed',
        description: 'Failed to sync heat cycles to calendar. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSync}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Syncing...
        </>
      ) : (
        <>
          <Calendar className="h-4 w-4 mr-2" />
          Sync Heat Calendar
        </>
      )}
    </Button>
  );
};

export default SyncHeatCalendarButton;