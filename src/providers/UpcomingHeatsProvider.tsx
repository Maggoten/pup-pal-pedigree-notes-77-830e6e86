import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UpcomingHeat } from '@/types/reminders';
import { calculateUpcomingHeatsUnified } from '@/utils/heatCalculator';
import { useDogs } from '@/context/DogsContext';

interface UpcomingHeatsContextType {
  upcomingHeats: UpcomingHeat[];
  loading: boolean;
  error: Error | null;
  refreshHeats: () => Promise<void>;
}

const UpcomingHeatsContext = createContext<UpcomingHeatsContextType | undefined>(undefined);

interface UpcomingHeatsProviderProps {
  children: ReactNode;
}

export const UpcomingHeatsProvider: React.FC<UpcomingHeatsProviderProps> = ({ children }) => {
  const { dogs } = useDogs();
  const queryClient = useQueryClient();

  const { data: upcomingHeats = [], isLoading, error, refetch } = useQuery({
    queryKey: ['upcoming-heats', dogs.map(dog => dog.id).join(',')],
    queryFn: () => calculateUpcomingHeatsUnified(dogs),
    enabled: dogs.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });

  const refreshHeats = async () => {
    await refetch();
  };

  return (
    <UpcomingHeatsContext.Provider
      value={{
        upcomingHeats,
        loading: isLoading,
        error: error as Error | null,
        refreshHeats,
      }}
    >
      {children}
    </UpcomingHeatsContext.Provider>
  );
};

export const useUpcomingHeatsContext = () => {
  const context = useContext(UpcomingHeatsContext);
  if (context === undefined) {
    throw new Error('useUpcomingHeatsContext must be used within an UpcomingHeatsProvider');
  }
  return context;
};