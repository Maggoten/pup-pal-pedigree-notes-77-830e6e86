
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Thermometer, MessageSquare, ClipboardList } from 'lucide-react';
import TemperatureLog from '@/components/pregnancy/TemperatureLog';
import SymptomsLog from '@/components/pregnancy/SymptomsLog';
import PregnancyJourney from '@/components/pregnancy/journey/PregnancyJourney';

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
      <h2 className="text-2xl font-le-jour text-greige-800">Pregnancy Journey</h2>
      
      <Tabs defaultValue="journey" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4 bg-greige-100">
          <TabsTrigger value="journey" className="flex items-center gap-2 data-[state=active]:bg-greige-200 data-[state=active]:text-brown-700">
            <ClipboardList className="h-4 w-4" /> Journey
          </TabsTrigger>
          <TabsTrigger value="temperature" className="flex items-center gap-2 data-[state=active]:bg-greige-200 data-[state=active]:text-brown-700">
            <Thermometer className="h-4 w-4" /> Temperature
          </TabsTrigger>
          <TabsTrigger value="symptoms" className="flex items-center gap-2 data-[state=active]:bg-greige-200 data-[state=active]:text-brown-700">
            <MessageSquare className="h-4 w-4" /> Notes
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="journey" className="bg-greige-50 border border-greige-200 rounded-lg p-4">
          <PregnancyJourney
            pregnancyId={pregnancyId}
            femaleName={femaleName}
            matingDate={matingDate}
            expectedDueDate={expectedDueDate}
          />
        </TabsContent>
        
        <TabsContent value="temperature" className="bg-greige-50 border border-greige-200 rounded-lg p-4">
          <TemperatureLog 
            pregnancyId={pregnancyId} 
            femaleName={femaleName} 
          />
        </TabsContent>
        
        <TabsContent value="symptoms" className="bg-greige-50 border border-greige-200 rounded-lg p-4">
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
