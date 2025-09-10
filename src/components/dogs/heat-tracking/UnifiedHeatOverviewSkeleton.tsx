import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UnifiedHeatOverviewSkeletonProps {
  dogName?: string;
  className?: string;
}

const UnifiedHeatOverviewSkeleton: React.FC<UnifiedHeatOverviewSkeletonProps> = ({ 
  dogName = '',
  className = "" 
}) => {
  const { t } = useTranslation('dogs');

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {dogName && `${dogName}s`} {t('heatTracking.analytics.cycle')}
        </CardTitle>
        <CardDescription>
          <Skeleton className="h-4 w-32" />
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Current Cycle Status Skeleton */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-5 w-28" />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
            
            <Skeleton className="h-2 w-full rounded-full" />
            
            <Skeleton className="h-3 w-3/4" />
            
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>

        {/* Statistics Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="text-center">
              <Skeleton className="h-8 w-12 mx-auto mb-2" />
              <Skeleton className="h-3 w-16 mx-auto" />
            </div>
          ))}
        </div>
        
      </CardContent>
    </Card>
  );
};

export default UnifiedHeatOverviewSkeleton;