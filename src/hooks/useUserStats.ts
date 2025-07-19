import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UserStats {
  totalLitters: number;
  totalPuppies: number;
  averageLitterSize: number;
}

export const useUserStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    totalLitters: 0,
    totalPuppies: 0,
    averageLitterSize: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setHasError(false);

        const currentYear = new Date().getFullYear();
        const yearStart = new Date(currentYear, 0, 1);
        const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59);

        // Fetch litters for current year
        const { data: litters, error: littersError } = await supabase
          .from('litters')
          .select('id')
          .eq('user_id', user.id)
          .gte('date_of_birth', yearStart.toISOString())
          .lte('date_of_birth', yearEnd.toISOString());

        if (littersError) throw littersError;

        const totalLitters = litters?.length || 0;

        if (totalLitters === 0) {
          setStats({ totalLitters: 0, totalPuppies: 0, averageLitterSize: 0 });
          return;
        }

        // Fetch puppies for these litters
        const litterIds = litters.map(litter => litter.id);
        const { data: puppies, error: puppiesError } = await supabase
          .from('puppies')
          .select('id, litter_id')
          .in('litter_id', litterIds);

        if (puppiesError) throw puppiesError;

        const totalPuppies = puppies?.length || 0;
        const averageLitterSize = totalLitters > 0 ? Math.round((totalPuppies / totalLitters) * 10) / 10 : 0;

        setStats({
          totalLitters,
          totalPuppies,
          averageLitterSize
        });
      } catch (error) {
        console.error('Error fetching user stats:', error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserStats();
  }, [user]);

  return { stats, isLoading, hasError };
};