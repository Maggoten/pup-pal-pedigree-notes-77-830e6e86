import { useState, useEffect, useCallback } from 'react';
import { HeatService } from '@/services/HeatService';
import { Database } from '@/integrations/supabase/types';
import { useHeatSubscription } from '@/hooks/heat/useHeatSubscription';
import { supabase } from '@/integrations/supabase/client';

type HeatCycle = Database['public']['Tables']['heat_cycles']['Row'];

export interface UnifiedHeatData {
  heatCycles: HeatCycle[];
  heatHistory: { date: string }[];
  latestDate: Date | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook for accessing unified heat data from both heat_cycles and heatHistory systems
 * Provides automatic migration and sync between the two systems
 */
export const useUnifiedHeatData = (dogId: string | null) => {
  const [data, setData] = useState<UnifiedHeatData>({
    heatCycles: [],
    heatHistory: [],
    latestDate: null,
    isLoading: true,
    error: null
  });

  const loadData = useCallback(async () => {
    if (!dogId) {
      setData(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));

      // Load unified data directly - migration handled elsewhere
      const unifiedData = await HeatService.getUnifiedHeatData(dogId);

      setData({
        ...unifiedData,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Error loading unified heat data:', error);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load heat data'
      }));
    }
  }, [dogId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  // Set up real-time subscription for heat cycles
  const [userId, setUserId] = useState<string | undefined>();
  const { setupSubscription } = useHeatSubscription(refresh, userId);

  useEffect(() => {
    // Get current user ID for subscription
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (userId) {
      const cleanup = setupSubscription();
      return cleanup;
    }
  }, [userId, setupSubscription]);

  return {
    ...data,
    refresh
  };
};