import { useAuth } from '@/hooks/useAuth';
import React, { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Filter, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMyDogs } from '@/hooks/useMyDogs';

const MyDogs: React.FC = () => {
  const { isAuthReady, isLoggedIn, user } = useAuth();
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');

  // ✅ Skydda innan vi kör hook som hämtar data
  if (!isAuthReady || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Laddar användarsession...</p>
        </div>
      </div>
    );
  }

  const {
    filteredDogs,
    loading,
    error,
    showError,
    retry,
    isNetworkError,
    activeDog,
    openAddDialog,
    setOpenAddDialog
  } = useMyDogs({
    genderFilter,
    isAuthReady,
    isLoggedIn
  });

  return (
    <PageLayout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Mina hundar</h1>
        <Button onClick={() => setOpenAddDialog(true)} className="flex items-center gap-2">
          <PlusCircle className="w-4 h-4" />
          Lägg till hund
        </Button>
      </div>

      <div className="mb-4">
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle>Filtrera</CardTitle>
              <CardDescription>Välj kön för att filtrera hundar</CardDescription>
            </div>
            <Filter className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Select value={genderFilter} onValueChange={(val) => setGenderFilter(val as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Alla" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alla</SelectItem>
                <SelectItem value="female">Tik</SelectItem>
                <SelectItem value="male">Hane</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {showError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Ett fel uppstod vid hämtning av hundar.
            {isNetworkError && (
              <Button onClick={retry} variant="link" className="ml-2 text-sm p-0 h-auto">
                Försök igen
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      <DogList dogs={filteredDogs} loading={loading} activeDog={activeDog} />

      <DogDetails dog={activeDog} />

      <AddDogDialog open={openAddDialog} onOpenChange={setOpenAddDialog} />
    </PageLayout>
  );
};

export default MyDogs;
