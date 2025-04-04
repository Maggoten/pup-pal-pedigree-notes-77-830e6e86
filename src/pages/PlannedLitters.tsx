
import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { PlusCircle, Info, PawPrint, Heart, Calendar } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { format, parseISO, isBefore } from 'date-fns';
import { useDogs } from '@/context/DogsContext';
import { PlannedLitter } from '@/types/breeding';
import PlannedLitterCard from '@/components/planned-litters/PlannedLitterCard';
import AddPlannedLitterDialog from '@/components/planned-litters/AddPlannedLitterDialog';
import EmptyPlannedLitters from '@/components/planned-litters/EmptyPlannedLitters';
import { plannedLitterService, PlannedLitterFormValues } from '@/services/PlannedLitterService';
import { calculateUpcomingHeats, UpcomingHeat } from '@/utils/heatCalculator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface RecentMating {
  id: string;
  maleName: string;
  femaleName: string;
  date: Date;
}

const MatingTips = [
  "Wait until the bitch is in standing heat before mating",
  "The optimal time for mating is usually 10-14 days after the start of heat",
  "Consider progesterone testing to determine the optimal mating time",
  "Two matings 24-48 hours apart can increase the chances of pregnancy",
  "Keep both dogs calm and relaxed before and after mating"
];

const PlannedLittersContent: React.FC = () => {
  const { dogs } = useDogs();
  const [plannedLitters, setPlannedLitters] = useState<PlannedLitter[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState<{ [litterId: string]: boolean }>({});
  const [upcomingHeats, setUpcomingHeats] = useState<UpcomingHeat[]>([]);
  const [recentMatings, setRecentMatings] = useState<RecentMating[]>([]);
  const [activeTab, setActiveTab] = useState('planned');
  
  const males = dogs.filter(dog => dog.gender === 'male');
  const females = dogs.filter(dog => dog.gender === 'female');
  
  // Load planned litters and calculate heats on component mount
  useEffect(() => {
    const litters = plannedLitterService.loadPlannedLitters();
    setPlannedLitters(litters);
    
    // Calculate upcoming heats
    setUpcomingHeats(calculateUpcomingHeats(dogs));
    
    // Extract mating dates for Recent Matings section
    const matings: RecentMating[] = [];
    
    litters.forEach(litter => {
      if (litter.matingDates && litter.matingDates.length > 0) {
        litter.matingDates.forEach(dateStr => {
          const matingDate = parseISO(dateStr);
          // Only include matings that have already occurred
          if (isBefore(matingDate, new Date())) {
            matings.push({
              id: `${litter.id}-${dateStr}`,
              maleName: litter.maleName,
              femaleName: litter.femaleName,
              date: matingDate
            });
          }
        });
      }
    });
    
    // Sort by date, most recent first
    matings.sort((a, b) => b.date.getTime() - a.date.getTime());
    setRecentMatings(matings);
  }, [dogs]);
  
  // Save planned litters to localStorage whenever they change
  useEffect(() => {
    plannedLitterService.savePlannedLitters(plannedLitters);
  }, [plannedLitters]);
  
  const handleAddPlannedLitter = (values: PlannedLitterFormValues) => {
    try {
      const newLitter = plannedLitterService.createPlannedLitter(values, dogs);
      setPlannedLitters([...plannedLitters, newLitter]);
      setOpenDialog(false);
      
      toast({
        title: "Planned Litter Added",
        description: `${newLitter.maleName} × ${newLitter.femaleName} planned breeding added successfully.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };
  
  const handleAddMatingDate = (litterId: string, date: Date) => {
    const updatedLitters = plannedLitterService.addMatingDate(plannedLitters, litterId, date);
    setPlannedLitters(updatedLitters);
    
    toast({
      title: "Mating Date Added",
      description: `Mating date ${format(date, 'PPP')} added successfully. A pregnancy has been created.`
    });
    
    // Close the calendar after selection
    setCalendarOpen({
      ...calendarOpen,
      [litterId]: false
    });

    // Add new mating to recent matings
    const litter = plannedLitters.find(l => l.id === litterId);
    if (litter) {
      setRecentMatings([{
        id: `${litter.id}-${format(date, 'yyyy-MM-dd')}`,
        maleName: litter.maleName,
        femaleName: litter.femaleName,
        date: date
      }, ...recentMatings]);
    }
  };

  const handleDeleteLitter = (litterId: string) => {
    const updatedLitters = plannedLitterService.deletePlannedLitter(plannedLitters, litterId);
    setPlannedLitters(updatedLitters);
    
    // Also filter out any recent matings associated with this litter
    const updatedMatings = recentMatings.filter(
      mating => !mating.id.startsWith(`${litterId}-`)
    );
    setRecentMatings(updatedMatings);
    
    toast({
      title: "Planned Litter Deleted",
      description: "The planned litter has been removed successfully."
    });
  };

  return (
    <PageLayout 
      title="Planned Litters & Mating" 
      description="Plan your future litters, track heat cycles, and manage breeding activities"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="planned">Planned Litters</TabsTrigger>
          <TabsTrigger value="mating">Mating</TabsTrigger>
        </TabsList>
        
        <TabsContent value="planned" className="space-y-6">
          <div className="flex justify-end">
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Add Planned Litter
                </Button>
              </DialogTrigger>
              <AddPlannedLitterDialog 
                males={males} 
                females={females} 
                onSubmit={handleAddPlannedLitter} 
              />
            </Dialog>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plannedLitters.map(litter => (
              <PlannedLitterCard 
                key={litter.id}
                litter={litter}
                onAddMatingDate={handleAddMatingDate}
                onDeleteLitter={handleDeleteLitter}
                calendarOpen={calendarOpen[litter.id] || false}
                onCalendarOpenChange={(open) => setCalendarOpen({...calendarOpen, [litter.id]: open})}
              />
            ))}
          </div>

          {plannedLitters.length === 0 && (
            <EmptyPlannedLitters onAddClick={() => setOpenDialog(true)} />
          )}
        </TabsContent>
        
        <TabsContent value="mating" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Heat Cycles</CardTitle>
                <CardDescription>Track your bitches' heat cycles</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingHeats.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingHeats.map((heat, index) => (
                      <div
                        key={`${heat.dogId}-${index}`}
                        className="flex items-start gap-3 p-3 rounded-lg border bg-rose-50 border-rose-200"
                      >
                        <div className="mt-0.5">
                          <PawPrint className="h-5 w-5 text-rose-500" />
                        </div>
                        <div>
                          <h4 className="font-medium">{heat.dogName}'s Heat Cycle</h4>
                          <p className="text-sm text-muted-foreground">
                            Expected on {format(heat.date, 'PPP')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Upcoming Heat Cycles</h3>
                    <p className="text-muted-foreground mb-4">Add heat information to your female dogs to track cycles</p>
                    <Button onClick={() => setActiveTab('planned')}>Add Heat Cycle</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Matings</CardTitle>
                <CardDescription>Recent breeding attempts</CardDescription>
              </CardHeader>
              <CardContent>
                {recentMatings.length > 0 ? (
                  <div className="space-y-3">
                    {recentMatings.map((mating) => (
                      <div
                        key={mating.id}
                        className="flex items-start gap-3 p-3 rounded-lg border bg-purple-50 border-purple-200"
                      >
                        <div className="mt-0.5">
                          <Heart className="h-5 w-5 text-purple-500" />
                        </div>
                        <div>
                          <h4 className="font-medium">{mating.maleName} × {mating.femaleName}</h4>
                          <p className="text-sm text-muted-foreground">
                            Mated on {format(mating.date, 'PPP')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Info className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Recent Matings</h3>
                    <p className="text-muted-foreground mb-4">Record your breeding attempts</p>
                    <Button onClick={() => setActiveTab('planned')}>Log Mating</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Mating Tips & Tricks</CardTitle>
              <CardDescription>Important information for successful breeding</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {MatingTips.map((tip, index) => (
                  <AccordionItem key={index} value={`tip-${index}`}>
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                          {index + 1}
                        </div>
                        <span>{tip}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pl-8 text-muted-foreground">
                        {index === 0 && "Standing heat is when the female is most receptive to the male and most likely to conceive. Look for a soft vulva and straw-colored discharge."}
                        {index === 1 && "This is typically when ovulation occurs. Consider tracking the cycle carefully with your vet to determine the optimal time."}
                        {index === 2 && "Progesterone testing can precisely pinpoint when ovulation occurs, giving you the best chance of a successful pregnancy."}
                        {index === 3 && "Multiple matings increase the chances of pregnancy, as sperm can live for several days in the female reproductive tract."}
                        {index === 4 && "Stress can interfere with successful breeding. Ensure the environment is quiet and familiar to both dogs."}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

const PlannedLitters: React.FC = () => {
  return <PlannedLittersContent />;
};

export default PlannedLitters;
