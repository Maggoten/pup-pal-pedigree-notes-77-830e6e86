
import React, { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDogs, DogsProvider } from '@/context/DogsContext';
import DogList from '@/components/DogList';
import DogDetails from '@/components/dogs/DogDetails';
import { PlusCircle, RefreshCw } from 'lucide-react';
import AddDogDialog from '@/components/dogs/AddDogDialog';

const MyDogsContent: React.FC = () => {
  const { dogs, activeDog, refreshDogs, loading, error } = useDogs();
  const [showAddDogDialog, setShowAddDogDialog] = useState(false);
  
  const females = dogs.filter(dog => dog.gender === 'female');
  const males = dogs.filter(dog => dog.gender === 'male');

  const handleRefresh = () => {
    refreshDogs();
  };

  if (error) {
    return (
      <PageLayout title="My Dogs">
        <Card className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-medium">Something went wrong</h3>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={handleRefresh}>Try Again</Button>
          </div>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="My Dogs" 
      description="Manage your breeding dogs"
    >
      {activeDog ? (
        <DogDetails dog={activeDog} />
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <Button 
              variant="outline" 
              onClick={handleRefresh} 
              className="flex items-center gap-1.5"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button 
              onClick={() => setShowAddDogDialog(true)} 
              className="flex items-center gap-1.5"
              disabled={loading}
            >
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
      />
    </PageLayout>
  );
};

const MyDogs: React.FC = () => {
  return (
    <DogsProvider>
      <MyDogsContent />
    </DogsProvider>
  );
};

export default MyDogs;
