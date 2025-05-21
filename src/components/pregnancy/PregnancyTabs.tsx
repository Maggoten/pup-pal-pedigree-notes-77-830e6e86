
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Thermometer, MessageSquare, ClipboardList, ListChecks } from 'lucide-react';
import TemperatureLog from '@/components/pregnancy/TemperatureLog';
import SymptomsLog from '@/components/pregnancy/SymptomsLog';
import PregnancyJourney from '@/components/pregnancy/journey/PregnancyJourney';
import PregnancyChecklist from '@/components/pregnancy/symptoms/PregnancyChecklist';
import { Separator } from '@/components/ui/separator';

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
  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-warmgreen-700 mb-2">Pregnancy Management</h2>
        <Separator className="bg-warmbeige-200" />
      </div>
      
      <Tabs defaultValue="journey" className="w-full">
        <TabsList className="grid grid-cols-4 mb-6 bg-warmbeige-100 p-1 rounded-lg">
          <TabsTrigger 
            value="journey" 
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-warmgreen-700 data-[state=active]:shadow-sm"
          >
            <ClipboardList className="h-4 w-4" /> Journey
          </TabsTrigger>
          <TabsTrigger 
            value="symptoms-tracker" 
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-warmgreen-700 data-[state=active]:shadow-sm"
          >
            <ListChecks className="h-4 w-4" /> Symptoms
          </TabsTrigger>
          <TabsTrigger 
            value="temperature" 
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-warmgreen-700 data-[state=active]:shadow-sm"
          >
            <Thermometer className="h-4 w-4" /> Temperature
          </TabsTrigger>
          <TabsTrigger 
            value="symptoms" 
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-warmgreen-700 data-[state=active]:shadow-sm"
          >
            <MessageSquare className="h-4 w-4" /> Notes
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
        
        <TabsContent value="symptoms-tracker" className="bg-white border border-warmbeige-200 rounded-xl p-6 shadow-sm">
          <PregnancyChecklist
            pregnancyId={pregnancyId}
            femaleName={femaleName}
          />
        </TabsContent>
        
        <TabsContent value="temperature" className="bg-white border border-warmbeige-200 rounded-xl p-6 shadow-sm">
          <TemperatureLog 
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
