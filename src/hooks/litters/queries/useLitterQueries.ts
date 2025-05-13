
// @ts-check
import { useActiveLittersQuery } from './useActiveLittersQuery';
import { useArchivedLittersQuery } from './useArchivedLittersQuery';
import { Litter } from '@/types/breeding';
import { useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

/**
 * Result interface for useLitterQueries hook
 */
export interface UseLitterQueriesResult {
  // Data fields
  fetchActiveLitters: () => Promise<Litter[]>;
  fetchArchivedLitters: () => Promise<Litter[]>;
}

/**
 * A facade hook that wraps our React Query hooks to provide a simplified API
 * for fetching litter data while avoiding TypeScript deep inference issues.
 */
export function useLitterQueries(): UseLitterQueriesResult {
  const { refetch: refetchActive } = useActiveLittersQuery();
  const { refetch: refetchArchived } = useArchivedLittersQuery();
  const { user } = useAuth();
  
  // Maintain API compatibility with existing code that uses this hook
  const fetchActiveLitters = useCallback(async () => {
    if (!user?.id) return [];
    const { data } = await refetchActive();
    return data || [];
  }, [refetchActive, user?.id]);

  const fetchArchivedLitters = useCallback(async () => {
    if (!user?.id) return [];
    const { data } = await refetchArchived();
    return data || [];
  }, [refetchArchived, user?.id]);

  return {
    fetchActiveLitters,
    fetchArchivedLitters,
  };
}

