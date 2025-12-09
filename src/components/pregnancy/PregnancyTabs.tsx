
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, MessageSquare, ClipboardList, Loader2 } from 'lucide-react';
import HealthLog from '@/components/pregnancy/HealthLog';
import SymptomsLog from '@/components/pregnancy/SymptomsLog';
import PregnancyJourney from '@/components/pregnancy/journey/PregnancyJourney';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from 'react-i18next';

interface PregnancyTabsProps {
  pregnancyId: string;
  femaleName: string;
  matingDate: Date;
  expectedDueDate: Date;
}

const PregnancyTabs: React.FC<PregnancyTabsProps> = ({ 
  pregnancyId, 
  femaleName, 
  matingDate, 
  expectedDueDate 
}) => {
  const { t, ready } = useTranslation('pregnancy');
  console.log("📋 PregnancyTabs rendered with pregnancyId:", pregnancyId);

  // Don't render until translations are ready
  if (!ready) {
    return (
      <div className="flex justify-center items-center h-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <Tabs defaultValue="journey" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6 bg-warmbeige-100 p-1 rounded-lg">
          <TabsTrigger 
            value="journey" 
            className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 sm:px-3 data-[state=active]:bg-white data-[state=active]:text-warmgreen-700 data-[state=active]:shadow-sm"
          >
            <ClipboardList className="h-4 w-4 flex-shrink-0" /> 
            <span className="text-xs sm:text-sm font-medium truncate">{t('tabs.journey')}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="health" 
            className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 sm:px-3 data-[state=active]:bg-white data-[state=active]:text-warmgreen-700 data-[state=active]:shadow-sm"
          >
            <Activity className="h-4 w-4 flex-shrink-0" /> 
            <span className="text-xs sm:text-sm font-medium truncate">{t('tabs.health')}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="symptoms" 
            className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 sm:px-3 data-[state=active]:bg-white data-[state=active]:text-warmgreen-700 data-[state=active]:shadow-sm"
          >
            <MessageSquare className="h-4 w-4 flex-shrink-0" /> 
            <span className="text-xs sm:text-sm font-medium truncate">{t('tabs.notes')}</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="journey" className="bg-white border border-warmbeige-200 rounded-xl p-6 shadow-sm">
          <PregnancyJourney
            pregnancyId={pregnancyId}
            femaleName={femaleName}
            matingDate={matingDate}
            expectedDueDate={expectedDueDate}
          />
        </TabsContent>
        
        <TabsContent value="health" className="bg-white border border-warmbeige-200 rounded-xl p-6 shadow-sm">
          <HealthLog 
            pregnancyId={pregnancyId} 
            femaleName={femaleName} 
          />
        </TabsContent>
        
        <TabsContent value="symptoms" className="bg-white border border-warmbeige-200 rounded-xl p-6 shadow-sm">
          <SymptomsLog 
            pregnancyId={pregnancyId} 
            femaleName={femaleName} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PregnancyTabs;
