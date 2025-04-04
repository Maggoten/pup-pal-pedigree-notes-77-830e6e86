
import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Thermometer, PawPrint } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { useDogs } from '@/context/DogsContext';
import { addDays, format, parseISO, differenceInDays } from 'date-fns';

interface ActivePregnancy {
  id: string;
  maleName: string;
  femaleName: string;
  matingDate: Date;
  expectedDueDate: Date;
  daysLeft: number;
}

const weeklyDevelopment = [
  {
    week: 1,
    description: "Fertilization and implantation of embryos. No visible signs of pregnancy yet."
  },
  {
    week: 2,
    description: "Embryos continue to develop. No visible signs of pregnancy."
  },
  {
    week: 3,
    description: "First signs may appear: slightly enlarged nipples, slight behavior changes."
  },
  {
    week: 4,
    description: "Fetal heartbeats may be detected by ultrasound. Morning sickness may occur."
  },
  {
    week: 5,
    description: "Abdomen begins to swell noticeably. Appetite may increase. Nipples enlarge further."
  },
  {
    week: 6,
    description: "Puppies developing rapidly. Abdomen continues to enlarge. Clear discharge may be present."
  },
  {
    week: 7,
    description: "Puppies continuing to grow. Milk may be expressed from nipples. Nesting behavior begins."
  },
  {
    week: 8,
    description: "Final week. Temperature should be monitored. Milk present. Restlessness and nesting intensify."
  },
  {
    week: 9,
    description: "Birth typically occurs around 63 days after conception. Temperature drops below 100°F (37.8°C) 24-48 hours before labor."
  }
];

const Pregnancy: React.FC = () => {
  const navigate = useNavigate();
  const { dogs } = useDogs();
  const [activePregnancies, setActivePregnancies] = useState<ActivePregnancy[]>([]);

  useEffect(() => {
    // Fetch planned litters from local storage (since we can't modify PlannedLitters.tsx directly)
    const plannedLittersJSON = localStorage.getItem('plannedLitters');
    if (plannedLittersJSON) {
      const plannedLitters = JSON.parse(plannedLittersJSON);
      
      // Filter for litters that have mating dates
      const pregnancies = plannedLitters
        .filter((litter: any) => litter.matingDates && litter.matingDates.length > 0)
        .map((litter: any) => {
          // Use the most recent mating date
          const sortedMatingDates = [...litter.matingDates].sort((a: string, b: string) => 
            new Date(b).getTime() - new Date(a).getTime()
          );
          
          const matingDate = parseISO(sortedMatingDates[0]);
          const expectedDueDate = addDays(matingDate, 63); // 63 days is the average gestation period for dogs
          const daysLeft = differenceInDays(expectedDueDate, new Date());
          
          return {
            id: litter.id,
            maleName: litter.maleName,
            femaleName: litter.femaleName,
            matingDate,
            expectedDueDate,
            daysLeft: daysLeft > 0 ? daysLeft : 0
          };
        });
      
      setActivePregnancies(pregnancies);
    }
  }, [dogs]);

  const handleAddPregnancyClick = () => {
    navigate('/planned-litters');
  };

  const handleLogTemperature = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Temperature logging will be available in the next update."
    });
  };

  return (
    <PageLayout 
      title="Pregnancy" 
      description="Track your pregnant bitches and fetal development"
      icon={<PawPrint className="h-6 w-6" />}
    >
      <div className="flex justify-end">
        <Button onClick={handleAddPregnancyClick} className="mb-6">Add Pregnancy</Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Active Pregnancies</CardTitle>
            <CardDescription>Track ongoing pregnancies</CardDescription>
          </CardHeader>
          <CardContent>
            {activePregnancies.length > 0 ? (
              <div className="space-y-4">
                {activePregnancies.map((pregnancy) => (
                  <div key={pregnancy.id} className="rounded-lg border p-4 bg-blue-50 border-blue-200">
                    <h3 className="font-medium text-lg">
                      {pregnancy.femaleName} × {pregnancy.maleName}
                    </h3>
                    <div className="mt-2 space-y-1 text-sm">
                      <p className="flex items-center gap-2">
                        <span className="font-medium">Mating Date:</span> 
                        {format(pregnancy.matingDate, 'PPP')}
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="font-medium">Due Date:</span> 
                        {format(pregnancy.expectedDueDate, 'PPP')}
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="font-medium">Days Left:</span> 
                        {pregnancy.daysLeft}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <PawPrint className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Active Pregnancies</h3>
                <p className="text-muted-foreground mb-4">Add a pregnancy to start tracking</p>
                <Button onClick={handleAddPregnancyClick}>Add Pregnancy</Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Temperature Log</CardTitle>
            <CardDescription>Monitor bitch temperature</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Thermometer className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Temperature Data</h3>
              <p className="text-muted-foreground mb-4">Record temperature readings</p>
              <Button onClick={handleLogTemperature}>Log Temperature</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Pregnancy Development Guide</CardTitle>
          <CardDescription>Weekly development of puppies during pregnancy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weeklyDevelopment.map((week) => (
              <div key={week.week} className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <PawPrint className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Week {week.week}</h4>
                  <p className="text-sm text-muted-foreground">{week.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default Pregnancy;
