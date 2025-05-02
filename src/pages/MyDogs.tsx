
import { useAuth } from '@/context/AuthContext';
import React, { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDogs, DogsProvider } from '@/context/DogsContext';
import DogList from '@/components/DogList';
import DogDetails from '@/components/dogs/DogDetails';
import AddDogDialog from '@/components/dogs/AddDogDialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

const MyDogsContent: React.FC = () => {
  const { dogs, activeDog, loading } = useDogs();
  const [showAddDogDialog, setShowAddDogDialog] = useState(false);
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  
  // Filter dogs based on selected gender
  const filteredDogs = genderFilter === 'all' 
    ? dogs 
    : dogs.filter(dog => dog.gender === genderFilter);

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
            <div className="w-48">
              <Select
                value={genderFilter}
                onValueChange={(value) => setGenderFilter(value as 'all' | 'male' | 'female')}
              >
                <SelectTrigger className="bg-white w-full">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Filter by gender" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dogs</SelectItem>
                  <SelectItem value="male">Dogs (Males)</SelectItem>
                  <SelectItem value="female">Bitches (Females)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={() => setShowAddDogDialog(true)} 
              className="flex items-center gap-1.5"
              disabled={loading}
            >
              <PlusCircle className="h-4 w-4" />
              Add New Dog
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>
                {genderFilter === 'all' ? 'All Dogs' : 
                 genderFilter === 'male' ? 'Dogs (Males)' : 
                 'Bitches (Females)'}
              </CardTitle>
              <CardDescription>
                {genderFilter === 'all' ? 'All dogs in your breeding program' :
                 genderFilter === 'male' ? 'Male dogs in your breeding program' :
                 'Female dogs in your breeding program'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DogList dogsList={filteredDogs} />
            </CardContent>
          </Card>
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
