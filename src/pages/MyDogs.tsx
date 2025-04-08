
import React, { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDogs, DogsProvider } from '@/context/DogsContext';
import DogList from '@/components/DogList';
import DogDetails from '@/components/dogs/DogDetails';
import { PlusCircle } from 'lucide-react';
import AddDogDialog from '@/components/dogs/AddDogDialog';

const MyDogsContent: React.FC = () => {
  const { dogs, activeDog, addDog } = useDogs();
  const [showAddDogDialog, setShowAddDogDialog] = useState(false);

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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Breeding Dogs</h2>
            <Button onClick={() => setShowAddDogDialog(true)} className="flex items-center gap-1.5">
              <PlusCircle className="h-4 w-4" />
              Add New Dog
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>All Dogs</CardTitle>
              <CardDescription>
                Dogs in your breeding program
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DogList dogsList={dogs} />
            </CardContent>
          </Card>
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
    <DogsProvider>
      <MyDogsContent />
    </DogsProvider>
  );
};

export default MyDogs;
