
import React, { Suspense } from 'react';
import { LitterFilterProvider } from '@/components/litters/LitterFilterProvider';
import { Skeleton } from '@/components/ui/skeleton';
import { lazy } from 'react';
import PageLayout from '@/components/PageLayout';
import { PawPrint } from 'lucide-react';

// Lazy load the main content component
const MyLittersContent = lazy(() => import('@/components/litters/MyLittersContent'));

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
  return (
    <PageLayout 
      title="My Litters" 
      description="Manage your litter records and puppies" 
      icon={<PawPrint className="h-6 w-6" />}
      className="bg-warmbeige-50/50"
    >
      <LitterFilterProvider>
        <Suspense fallback={<MyLittersLoading />}>
          <MyLittersContent />
        </Suspense>
      </LitterFilterProvider>
    </PageLayout>
  );
};

export default MyLitters;
