
import React from 'react';
import { LitterFilterProvider } from '@/components/litters/LitterFilterProvider';
import MyLittersContent from '@/components/litters/MyLittersContent';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Configure the query client with settings optimized for UI stability
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
    },
  },
});

const MyLitters: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="bg-greige-50">
        <LitterFilterProvider>
          <MyLittersContent />
        </LitterFilterProvider>
      </div>
    </QueryClientProvider>
  );
};

export default MyLitters;
