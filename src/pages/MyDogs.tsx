
import React, { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DogList from '@/components/DogList';
import DogDetails from '@/components/dogs/DogDetails';
import { PlusCircle } from 'lucide-react';
import AddDogDialog from '@/components/dogs/AddDogDialog';
import { SupabaseDogProvider, useSupabaseDogs } from '@/context/dogs';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';

const MyDogsContent: React.FC = () => {
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const { dogs, activeDog, addDog, loading } = useSupabaseDogs();
  const [showAddDogDialog, setShowAddDogDialog] = useState(false);
  
  if (authLoading) {
    return (
      <PageLayout 
        title="My Dogs" 
        description="Manage your breeding dogs"
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </PageLayout>
    );
  }
  
  if (!isLoggedIn) {
    return (
      <PageLayout 
        title="My Dogs" 
        description="Manage your breeding dogs"
      >
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <p className="text-muted-foreground">Please sign in to view your dogs</p>
          <Button onClick={() => toast({
            title: "Authentication Required",
            description: "Please implement authentication to access this feature",
          })}>
            Sign In
          </Button>
        </div>
      </PageLayout>
    );
  }
  
  if (loading) {
    return (
      <PageLayout 
        title="My Dogs" 
        description="Manage your breeding dogs"
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </PageLayout>
    );
  }
  
  const females = dogs.filter(dog => dog.gender === 'female');
  const males = dogs.filter(dog => dog.gender === 'male');

  const handleAddDog = (dog: any) => {
    addDog(dog);
  };

  return (
    <PageLayout 
      title="My Dogs" 
      description="Manage your breeding dogs"
    >
      {activeDog ? (
        <DogDetails dog={activeDog} />
      ) : (
        <>
          <div className="flex justify-end items-center mb-4">
            <Button onClick={() => setShowAddDogDialog(true)} className="flex items-center gap-1.5">
              <PlusCircle className="h-4 w-4" />
              Add New Dog
            </Button>
          </div>
          
          <Tabs defaultValue="bitches" className="space-y-4">
            <TabsList>
              <TabsTrigger value="bitches">Bitches</TabsTrigger>
              <TabsTrigger value="dogs">Dogs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="bitches" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Bitches</CardTitle>
                  <CardDescription>
                    Female dogs in your breeding program
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DogList dogsList={females} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="dogs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Dogs</CardTitle>
                  <CardDescription>
                    Male dogs in your breeding program
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DogList dogsList={males} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
      
      <AddDogDialog 
        open={showAddDogDialog} 
        onOpenChange={setShowAddDogDialog} 
        onAddDog={handleAddDog} 
      />
    </PageLayout>
  );
};

const MyDogs: React.FC = () => {
  return (
    <SupabaseDogProvider>
      <MyDogsContent />
    </SupabaseDogProvider>
  );
};

export default MyDogs;
