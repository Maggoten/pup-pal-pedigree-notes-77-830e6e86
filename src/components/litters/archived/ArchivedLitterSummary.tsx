import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { getArchivedLitterDetails, ArchivedLitterData } from '@/services/ArchivedLitterService';
import ArchivedLitterHero from './ArchivedLitterHero';
import ArchivedLitterStatistics from './ArchivedLitterStatistics';
import ArchivedPuppyList from './ArchivedPuppyList';

interface ArchivedLitterSummaryProps {
  litterId: string;
}

const ArchivedLitterSummary: React.FC<ArchivedLitterSummaryProps> = ({ litterId }) => {
  const { t } = useTranslation('litters');
  const navigate = useNavigate();
  const [data, setData] = useState<ArchivedLitterData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const litterData = await getArchivedLitterDetails(litterId);
      setData(litterData);
      setLoading(false);
    };

    fetchData();
  }, [litterId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">{t('loading.litterDetails')}</span>
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

  const handleViewFullDetails = () => {
    navigate(`/my-litters/${litterId}`);
  };

  return (
    <div className="space-y-8">
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

      {/* Puppy List */}
      <ArchivedPuppyList puppies={data.litter.puppies || []} />

      {/* View Full Details Button */}
      <div className="flex justify-center pt-4">
        <Button variant="outline" size="lg" onClick={handleViewFullDetails}>
          <FileText className="mr-2 h-4 w-4" />
          {t('archivedLitters.actions.viewFullDetails')}
        </Button>
      </div>
    </div>
  );
};

export default ArchivedLitterSummary;
