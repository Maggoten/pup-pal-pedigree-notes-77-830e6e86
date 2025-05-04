
import React, { useState, useEffect } from 'react';
import { LitterFilterProvider } from '@/components/litters/LitterFilterProvider';
import { Skeleton } from '@/components/ui/skeleton';
import MyLittersContent from '@/components/litters/MyLittersContent';
import PageLayout from '@/components/PageLayout';
import { PawPrint } from 'lucide-react';

const MyLittersLoading = () => (
  <div className="space-y-4 p-4">
    <Skeleton className="h-12 w-64" />
    <Skeleton className="h-6 w-96" />
    <div className="mt-8 space-y-6">
      <Skeleton className="h-64 w-full" />
    </div>
  </div>
);

const MyLitters: React.FC = () => {
  const [contentLoading, setContentLoading] = useState(true);
  
  // Effect to simulate the content loading (replacing Suspense behavior)
  useEffect(() => {
    // Small timeout to simulate dynamic import load time
    const timer = setTimeout(() => {
      setContentLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <PageLayout 
      title="My Litters" 
      description="Manage your litter records and puppies" 
      icon={<PawPrint className="h-6 w-6" />}
      className="bg-warmbeige-50/50"
    >
      <LitterFilterProvider>
        {contentLoading ? (
          <MyLittersLoading />
        ) : (
          <MyLittersContent />
        )}
      </LitterFilterProvider>
    </PageLayout>
  );
};

export default MyLitters;
