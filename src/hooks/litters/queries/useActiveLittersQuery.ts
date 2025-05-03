
import { useQuery } from '@tanstack/react-query';
import { litterService } from '@/services/LitterService';
import { useAuth } from '@/hooks/useAuth';

// Query key factory
export const activeLittersQueryKey = ['litters', 'active'];

export const useActiveLittersQuery = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: activeLittersQueryKey,
    queryFn: () => litterService.getActiveLitters(),
    enabled: !!user?.id,
    staleTime: 1000 * 60, // 1 minute
  });
};
