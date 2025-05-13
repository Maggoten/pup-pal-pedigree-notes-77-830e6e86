
import { useAuth } from '@/hooks/useAuth';
import React, { useState, useEffect } from 'react';
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
  console.log('[MyDogs Page] Page component initializing');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const { isAuthReady, isLoggedIn } = useAuth();
  
  console.log('[MyDogs Page] Auth state:', { isAuthReady, isLoggedIn });
  
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

  console.log('[MyDogs Page] useMyDogs result:', { 
    dogCount: filteredDogs?.length || 0, 
    loading, 
    error, 
    showError,
    hasActiveDog: !!activeDog
  });

  // Add effect to log when component renders with filtered dogs
  useEffect(() => {
    console.log('[MyDogs Page] Filtered dogs updated:', filteredDogs?.length || 0);
  }, [filteredDogs]);

  return (
    <PageLayout 
      title="My Dogs" 
      description="Manage your breeding dogs"
      className="bg-warmbeige-50"
    >
      {/* Error message */}
      {error && showError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription className="flex items-center justify-between w-full">
            <span>{isNetworkError ? 
              'Network connection problem. Please check your internet connection.' : 
              error}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={retry}
              className="ml-2 bg-white"
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
          <p className="text-muted-foreground">
            {!isAuthReady ? "Preparing connection..." : "Loading your dogs..."}
          </p>
        </div>
      ) : activeDog ? (
        <DogDetails dog={activeDog} />
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <div className="w-48">
              <Select
                value={genderFilter}
                onValueChange={(value) => setGenderFilter(value as 'all' | 'male' | 'female')}
              >
                <SelectTrigger className="bg-white border border-warmbeige-100 w-full">
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
              onClick={() => setOpenAddDialog(true)} 
              className="flex items-center gap-1.5"
              disabled={loading || !isAuthReady || !isLoggedIn}
            >
              <PlusCircle className="h-4 w-4" />
              Add New Dog
            </Button>
          </div>
          
          <Card className="bg-white border border-warmbeige-100 shadow-sm">
            <CardHeader className="bg-warmbeige-50/50 border-b border-warmbeige-100">
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
            <CardContent className="bg-white">
              <DogList dogsList={filteredDogs} />
              
              {filteredDogs.length === 0 && !loading && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No dogs found.</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setOpenAddDialog(true)}
                    className="mt-4"
                    disabled={!isAuthReady || !isLoggedIn}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Your First Dog
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
      
      <AddDogDialog 
        open={openAddDialog} 
        onOpenChange={setOpenAddDialog} 
      />
    </PageLayout>
  );
};

export default MyDogs;
