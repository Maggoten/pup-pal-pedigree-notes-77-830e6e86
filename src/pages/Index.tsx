
import React from 'react';
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

const Index = () => {
  const { user } = useAuth();
  
  const handleAddDogClick = () => {
    // In a real app, this would open a modal or navigate to a form
    toast({
      title: "Coming Soon",
      description: "Add dog feature will be available in the next update.",
    });
  };

  return (
    <DogsProvider>
      <PageLayout 
        title="Breeding Journey" 
        description={`Welcome back, ${user?.email?.split('@')[0] || 'Breeder'}! Manage your breeding program efficiently`}
      >
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <BreedingCalendar />
          </div>
          <div>
            <BreedingReminders />
          </div>
        </div>
        
        <BreedingStats />
        
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Dogs</TabsTrigger>
            <TabsTrigger value="matings">Recent Matings</TabsTrigger>
            <TabsTrigger value="litters">Litters</TabsTrigger>
            <TabsTrigger value="health">Health Records</TabsTrigger>
          </TabsList>
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
      </PageLayout>
        
      <AddDogButton onClick={handleAddDogClick} />
    </DogsProvider>
  );
};

export default Index;
