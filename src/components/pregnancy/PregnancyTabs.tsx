
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Thermometer, MessageSquare } from 'lucide-react';
import PregnancyTimeline from '@/components/pregnancy/PregnancyTimeline';
import TemperatureLog from '@/components/pregnancy/TemperatureLog';
import SymptomsLog from '@/components/pregnancy/SymptomsLog';

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
    <Tabs defaultValue="timeline" className="w-full">
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="timeline" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" /> Timeline
        </TabsTrigger>
        <TabsTrigger value="temperature" className="flex items-center gap-2">
          <Thermometer className="h-4 w-4" /> Temperature
        </TabsTrigger>
        <TabsTrigger value="symptoms" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" /> Notes & Symptoms
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="timeline">
        <PregnancyTimeline 
          matingDate={matingDate} 
          expectedDueDate={expectedDueDate} 
        />
      </TabsContent>
      
      <TabsContent value="temperature">
        <TemperatureLog 
          pregnancyId={pregnancyId} 
          femaleName={femaleName} 
        />
      </TabsContent>
      
      <TabsContent value="symptoms">
        <SymptomsLog 
          pregnancyId={pregnancyId} 
          femaleName={femaleName} 
        />
      </TabsContent>
    </Tabs>
  );
};

export default PregnancyTabs;
