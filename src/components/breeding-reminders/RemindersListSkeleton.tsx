
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const RemindersListSkeleton: React.FC = () => (
  <div className="p-4 space-y-4">
    {Array(3).fill(0).map((_, i) => (
      <div key={i} className="flex items-center space-x-4">
        <Skeleton className="h-5 w-5 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

export default RemindersListSkeleton;
