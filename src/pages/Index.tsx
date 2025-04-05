
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BreedingStats from '@/components/BreedingStats';
import BreedingCalendar from '@/components/BreedingCalendar';
import BreedingReminders from '@/components/BreedingReminders';
import DogList from '@/components/DogList';
import AddDogButton from '@/components/AddDogButton';
import { DogsProvider } from '@/context/DogsContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import PageLayout from '@/components/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getActivePregnancies } from '@/services/PregnancyService';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, Dog, PawPrint } from 'lucide-react';
import { format } from 'date-fns';
import { useDogs } from '@/context/DogsContext';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { dogs } = useDogs();
  const [activePregnancies, setActivePregnancies] = useState<ActivePregnancy[]>([]);
  
  useEffect(() => {
    const pregnancies = getActivePregnancies();
    setActivePregnancies(pregnancies);
  }, []);
  
  const handleAddDogClick = () => {
    // In a real app, this would open a modal or navigate to a form
    toast({
      title: "Coming Soon",
      description: "Add dog feature will be available in the next update.",
    });
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  // Calculate some quick statistics
  const totalDogs = dogs.length;
  const femaleDogs = dogs.filter(dog => dog.gender === 'female').length;
  const maleDogs = dogs.filter(dog => dog.gender === 'male').length;

  return (
    <DogsProvider>
      <PageLayout 
        title="Breeding Journey Dashboard" 
        description={`Welcome back, ${user?.email?.split('@')[0] || 'Breeder'}! Here's an overview of your breeding program`}
      >
        {/* Hero Section */}
        <div className="mb-8 p-6 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Your Breeding Program at a Glance</h1>
          <p className="text-muted-foreground mb-4">
            Track pregnancies, plan litters, and manage your breeding program all in one place.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Dog className="h-5 w-5 text-primary" />
                  <span>Dogs</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalDogs}</div>
                <p className="text-sm text-muted-foreground">{maleDogs} males, {femaleDogs} females</p>
                <Button variant="link" className="px-0 mt-1" onClick={() => handleNavigate('/my-dogs')}>
                  View all dogs <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span>Planned Litters</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {/* Will need actual data here */}
                  {Math.round(Math.random() * 5)}
                </div>
                <p className="text-sm text-muted-foreground">Upcoming breeding plans</p>
                <Button variant="link" className="px-0 mt-1" onClick={() => handleNavigate('/planned-litters')}>
                  Manage plans <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <PawPrint className="h-5 w-5 text-primary" />
                  <span>Active Pregnancies</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activePregnancies.length}</div>
                <p className="text-sm text-muted-foreground">Pregnancies in progress</p>
                <Button variant="link" className="px-0 mt-1" onClick={() => handleNavigate('/pregnancy')}>
                  Track pregnancies <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Dog className="h-5 w-5 text-primary" />
                  <span>Litters</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {/* Will need actual data here */}
                  {Math.round(Math.random() * 3)}
                </div>
                <p className="text-sm text-muted-foreground">Current litters</p>
                <Button variant="link" className="px-0 mt-1" onClick={() => handleNavigate('/my-litters')}>
                  Manage litters <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <div className="md:col-span-2">
            <BreedingCalendar />
          </div>
          <div>
            <BreedingReminders />
          </div>
        </div>
        
        {/* Active Pregnancies Section */}
        {activePregnancies.length > 0 && (
          <div className="mb-6">
            <Card className="border-primary/20">
              <CardHeader className="bg-primary/5 border-b border-primary/20">
                <CardTitle className="flex items-center gap-2">
                  <PawPrint className="h-5 w-5 text-primary" />
                  Active Pregnancies
                </CardTitle>
                <CardDescription>Track your pregnant females</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {activePregnancies.map((pregnancy) => (
                    <div 
                      key={pregnancy.id} 
                      className="rounded-lg border p-4 bg-blue-50 border-blue-200 cursor-pointer hover:shadow-md transition-all"
                      onClick={() => navigate(`/pregnancy/${pregnancy.id}`)}
                    >
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
                        <div className="flex items-center justify-between mt-2">
                          <p className="flex items-center gap-2">
                            <span className="font-medium">Days Left:</span> 
                            <span className="font-bold text-primary">{pregnancy.daysLeft}</span>
                          </p>
                          <Button 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/pregnancy/${pregnancy.id}`);
                            }}
                          >
                            Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {activePregnancies.length === 0 && (
                    <div className="col-span-full text-center py-8">
                      <PawPrint className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Active Pregnancies</h3>
                      <p className="text-muted-foreground mb-4">Add a pregnancy to start tracking</p>
                      <Button onClick={() => navigate('/planned-litters')}>Add Pregnancy</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        <BreedingStats />
        
        <div className="mt-6">
          <Tabs defaultValue="all" className="space-y-4">
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="all">All Dogs</TabsTrigger>
                <TabsTrigger value="matings">Recent Matings</TabsTrigger>
                <TabsTrigger value="litters">Litters</TabsTrigger>
                <TabsTrigger value="health">Health Records</TabsTrigger>
              </TabsList>
              <Button 
                variant="outline" 
                className="hidden sm:flex items-center gap-2" 
                onClick={() => navigate('/my-dogs')}
              >
                View All Dogs <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <TabsContent value="all" className="space-y-4">
              <DogList />
            </TabsContent>
            <TabsContent value="matings">
              <div className="rounded-lg border p-8 text-center">
                <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
                <p className="text-muted-foreground">
                  Mating records will be available in the next update.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="litters">
              <div className="rounded-lg border p-8 text-center">
                <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
                <p className="text-muted-foreground">
                  Litter tracking will be available in the next update.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="health">
              <div className="rounded-lg border p-8 text-center">
                <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
                <p className="text-muted-foreground">
                  Health records will be available in the next update.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </PageLayout>
        
      <AddDogButton onClick={handleAddDogClick} />
    </DogsProvider>
  );
};

export default Index;
