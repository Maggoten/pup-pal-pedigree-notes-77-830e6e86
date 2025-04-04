
import React from 'react';
import Navbar from '@/components/Navbar';
import BreedingStats from '@/components/BreedingStats';
import BreedingCalendar from '@/components/BreedingCalendar';
import DogList from '@/components/DogList';
import AddDogButton from '@/components/AddDogButton';
import { DogsProvider } from '@/context/DogsContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';

const Index = () => {
  const handleAddDogClick = () => {
    // In a real app, this would open a modal or navigate to a form
    toast({
      title: "Coming Soon",
      description: "Add dog feature will be available in the next update.",
    });
  };

  return (
    <DogsProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        
        <main className="flex-1 container py-6 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Breeding Journey</h1>
              <p className="text-muted-foreground">Manage your breeding program efficiently</p>
            </div>
          </div>
          
          <BreedingCalendar />
          
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
        </main>
        
        <AddDogButton onClick={handleAddDogClick} />
      </div>
    </DogsProvider>
  );
};

export default Index;
