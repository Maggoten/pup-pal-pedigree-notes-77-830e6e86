
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PawPrint, Calendar, Thermometer, MessageSquare } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { format, parseISO, addDays, differenceInDays } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PregnancyTimeline from '@/components/pregnancy/PregnancyTimeline';
import TemperatureLog from '@/components/pregnancy/TemperatureLog';
import SymptomsLog from '@/components/pregnancy/SymptomsLog';

interface PregnancyDetails {
  id: string;
  maleName: string;
  femaleName: string;
  matingDate: Date;
  expectedDueDate: Date;
  daysLeft: number;
}

const PregnancyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pregnancy, setPregnancy] = useState<PregnancyDetails | null>(null);
  
  useEffect(() => {
    // Fetch pregnancy details from localStorage
    const fetchPregnancyDetails = () => {
      const plannedLittersJSON = localStorage.getItem('plannedLitters');
      if (plannedLittersJSON && id) {
        const plannedLitters = JSON.parse(plannedLittersJSON);
        const litter = plannedLitters.find((litter: any) => litter.id === id);
        
        if (litter && litter.matingDates && litter.matingDates.length > 0) {
          // Use the most recent mating date
          const sortedMatingDates = [...litter.matingDates].sort((a: string, b: string) => 
            new Date(b).getTime() - new Date(a).getTime()
          );
          
          const matingDate = parseISO(sortedMatingDates[0]);
          const expectedDueDate = addDays(matingDate, 63); // 63 days is the average gestation period for dogs
          const daysLeft = differenceInDays(expectedDueDate, new Date());
          
          setPregnancy({
            id: litter.id,
            maleName: litter.maleName,
            femaleName: litter.femaleName,
            matingDate,
            expectedDueDate,
            daysLeft: daysLeft > 0 ? daysLeft : 0
          });
        } else {
          // Handle case where litter is not found or has no mating dates
          toast({
            title: "Pregnancy not found",
            description: "The pregnancy details could not be loaded.",
            variant: "destructive"
          });
          navigate('/pregnancy');
        }
      }
    };
    
    fetchPregnancyDetails();
  }, [id, navigate]);
  
  const handleBack = () => {
    navigate('/pregnancy');
  };
  
  if (!pregnancy) {
    return (
      <PageLayout
        title="Loading Pregnancy Details"
        description="Please wait..."
        icon={<PawPrint className="h-6 w-6" />}
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout 
      title={`${pregnancy.femaleName}'s Pregnancy`}
      description={`Mated with ${pregnancy.maleName} on ${format(pregnancy.matingDate, 'PPP')}`}
      icon={<PawPrint className="h-6 w-6" />}
    >
      <div className="mb-6">
        <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Pregnancies
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex flex-col items-center">
              <Calendar className="h-8 w-8 text-purple-600 mb-2" />
              <h3 className="font-medium text-lg">Mating Date</h3>
              <p>{format(pregnancy.matingDate, 'PPP')}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-col items-center">
              <Calendar className="h-8 w-8 text-blue-600 mb-2" />
              <h3 className="font-medium text-lg">Due Date</h3>
              <p>{format(pregnancy.expectedDueDate, 'PPP')}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex flex-col items-center">
              <PawPrint className="h-8 w-8 text-green-600 mb-2" />
              <h3 className="font-medium text-lg">Days Remaining</h3>
              <p>{pregnancy.daysLeft} days</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
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
            matingDate={pregnancy.matingDate} 
            expectedDueDate={pregnancy.expectedDueDate} 
          />
        </TabsContent>
        
        <TabsContent value="temperature">
          <TemperatureLog 
            pregnancyId={pregnancy.id} 
            femaleName={pregnancy.femaleName} 
          />
        </TabsContent>
        
        <TabsContent value="symptoms">
          <SymptomsLog 
            pregnancyId={pregnancy.id} 
            femaleName={pregnancy.femaleName} 
          />
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default PregnancyDetails;
