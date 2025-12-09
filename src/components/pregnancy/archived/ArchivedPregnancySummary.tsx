import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getArchivedPregnancyDetails, ArchivedPregnancyData } from '@/services/PregnancyArchivedService';
import ArchivedPregnancyHero from './ArchivedPregnancyHero';
import ArchivedTemperatureCurve from './ArchivedTemperatureCurve';
import ArchivedWeightCurve from './ArchivedWeightCurve';
import ArchivedLitterSection from './ArchivedLitterSection';
import ArchivedSymptomsTimeline from './ArchivedSymptomsTimeline';
import ArchivedPregnancyChecklist from './ArchivedPregnancyChecklist';

interface ArchivedPregnancySummaryProps {
  pregnancyId: string;
}

const ArchivedPregnancySummary: React.FC<ArchivedPregnancySummaryProps> = ({ pregnancyId }) => {
  const { t } = useTranslation('pregnancy');
  const [data, setData] = useState<ArchivedPregnancyData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const pregnancyData = await getArchivedPregnancyDetails(pregnancyId);
    setData(pregnancyData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [pregnancyId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">{t('loading.pregnancyDetails')}</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-greige-700">{t('pages.details.notFound.title')}</h3>
        <p className="text-greige-500 mt-2">{t('pages.details.notFound.message')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Card */}
      <ArchivedPregnancyHero data={data} pregnancyId={pregnancyId} />

      {/* Temperature Curve */}
      {data.temperatureLogs.length > 0 && (
        <ArchivedTemperatureCurve temperatureLogs={data.temperatureLogs} />
      )}

      {/* Weight Curve */}
      {data.weightLogs.length > 0 && (
        <ArchivedWeightCurve weightLogs={data.weightLogs} />
      )}

      {/* Linked Litter Section */}
      <ArchivedLitterSection 
        linkedLitter={data.linkedLitter} 
        pregnancyData={data}
        pregnancyId={pregnancyId}
        onLitterCreated={fetchData}
      />

      {/* Symptoms & Notes Timeline */}
      {(data.symptoms.length > 0 || data.notes.length > 0) && (
        <ArchivedSymptomsTimeline symptoms={data.symptoms} notes={data.notes} />
      )}

      {/* Pregnancy Checklist */}
      <ArchivedPregnancyChecklist pregnancyId={pregnancyId} />
    </div>
  );
};

export default ArchivedPregnancySummary;