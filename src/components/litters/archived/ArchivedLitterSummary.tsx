import React, { useEffect, useState } from 'react';
import { Archive } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { getArchivedLitterDetails, ArchivedLitterData } from '@/services/ArchivedLitterService';
import ArchivedLitterHero from './ArchivedLitterHero';
import ArchivedLitterStatistics from './ArchivedLitterStatistics';
import ArchivedPuppyList from './ArchivedPuppyList';
import ArchivedDevelopmentChecklist from './ArchivedDevelopmentChecklist';
import { Skeleton } from '@/components/ui/skeleton';
import { useLitterQueries } from '@/hooks/litters/queries';
import { toast } from '@/hooks/use-toast';

interface ArchivedLitterSummaryProps {
  litterId: string;
  onUnarchive?: () => void;
}

const ArchivedLitterSummary: React.FC<ArchivedLitterSummaryProps> = ({ litterId, onUnarchive }) => {
  const { t } = useTranslation('litters');
  const { archiveLitter } = useLitterQueries();
  const [data, setData] = useState<ArchivedLitterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUnarchiving, setIsUnarchiving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const litterData = await getArchivedLitterDetails(litterId);
      setData(litterData);
      setLoading(false);
    };

    fetchData();
  }, [litterId]);

  const handleUnarchive = async () => {
    if (!data) return;
    
    setIsUnarchiving(true);
    try {
      archiveLitter(litterId, false);
      toast({
        title: t('toast.success'),
        description: t('toasts.success.litterUnarchived')
      });
      
      // Call parent callback if provided
      if (onUnarchive) {
        onUnarchive();
      }
    } catch (error) {
      console.error('Error unarchiving litter:', error);
      toast({
        title: t('toast.error'),
        description: t('toasts.error.failedToArchiveLitter'),
        variant: 'destructive'
      });
    } finally {
      setIsUnarchiving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium">{t('empty.noLitterFound')}</h3>
        <p className="text-muted-foreground mt-2">{t('empty.noLitterFoundDescription')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Unarchive Button */}
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          onClick={handleUnarchive}
          disabled={isUnarchiving}
        >
          <Archive className="mr-2 h-4 w-4" />
          {isUnarchiving ? t('loading.unarchiving') : t('actions.unarchive')}
        </Button>
      </div>

      {/* Hero Section */}
      <ArchivedLitterHero 
        litter={data.litter}
        damImageUrl={data.damImageUrl}
        sireImageUrl={data.sireImageUrl}
      />

      {/* Statistics & Growth Charts */}
      <ArchivedLitterStatistics 
        statistics={data.statistics}
        averageWeightLog={data.averageWeightLog}
        averageHeightLog={data.averageHeightLog}
      />

      {/* Development Checklist */}
      <ArchivedDevelopmentChecklist litter={data.litter} />

      {/* Puppy List */}
      <ArchivedPuppyList puppies={data.litter.puppies || []} />
    </div>
  );
};

export default ArchivedLitterSummary;
