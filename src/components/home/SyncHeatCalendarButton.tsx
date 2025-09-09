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
      console.log('Starting sync of all active heat cycles to calendar...');
      
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
      
      if (!activeHeats || activeHeats.length === 0) {
        console.log('No active heat cycles found to sync');
        toast({
          title: 'No Active Heats',
          description: 'No active heat cycles found to sync.',
        });
        return;
      }
      
      console.log(`Found ${activeHeats.length} active heat cycles to sync`);
      
      // Dynamic import to avoid circular dependency
      const { HeatCalendarSyncService } = await import('@/services/HeatCalendarSyncService');
      
      let synced = 0;
      const errors: string[] = [];
      
      // Sync each active heat cycle
      for (const heat of activeHeats) {
        try {
          // Get dog name separately
          const { data: dog } = await supabase
            .from('dogs')
            .select('name')
            .eq('id', heat.dog_id)
            .single();
          
          const dogName = dog?.name || 'Unknown Dog';
          console.log(`Syncing heat cycle for ${dogName}...`);
          
          const syncSuccess = await HeatCalendarSyncService.syncHeatCycleToCalendar(heat, dogName);
          
          if (syncSuccess) {
            synced++;
            console.log(`✓ Successfully synced heat cycle for ${dogName}`);
          } else {
            errors.push(`Failed to sync heat cycle for ${dogName}`);
          }
        } catch (syncError) {
          errors.push(`Error syncing heat cycle: ${syncError}`);
          console.error(`Error syncing heat cycle:`, syncError);
        }
      }
      
      if (synced > 0) {
        toast({
          title: 'Heat Cycles Synced',
          description: `Successfully synced ${synced} active heat cycle${synced > 1 ? 's' : ''} to calendar.`,
        });
      }
      
      if (errors.length > 0) {
        console.error('Sync errors:', errors);
        toast({
          title: 'Sync Issues',
          description: `Synced ${synced} heat cycles with ${errors.length} error(s). Check console for details.`,
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