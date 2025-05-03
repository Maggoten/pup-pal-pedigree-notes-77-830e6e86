
import { useQuery } from '@tanstack/react-query';
import { litterService } from '@/services/LitterService';
import { useAuth } from '@/hooks/useAuth';

// Query key factory
export const archivedLittersQueryKey = ['litters', 'archived'];

export const useArchivedLittersQuery = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: archivedLittersQueryKey,
    queryFn: () => litterService.getArchivedLitters(),
    enabled: !!user?.id,
    staleTime: 1000 * 60, // 1 minute
  });
};
