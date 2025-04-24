
import { useAuth } from '@/context/AuthContext';
import React, { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { useDogs, DogsProvider } from '@/context/DogsContext';
import DogList from '@/components/DogList';
import DogDetails from '@/components/dogs/DogDetails';
import AddDogDialog from '@/components/dogs/AddDogDialog';

const MyDogsContent: React.FC = () => {
  const { dogs, activeDog, loading } = useDogs();
  const [showAddDogDialog, setShowAddDogDialog] = useState(false);
  
  const females = dogs.filter(dog => dog.gender === 'female');
  const males = dogs.filter(dog => dog.gender === 'male');

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
