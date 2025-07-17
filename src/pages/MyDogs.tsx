import { useAuth } from '@/hooks/useAuth';
import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Filter, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDogs } from '@/context/DogsContext';
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

const MyDogsContent: React.FC = () => {
  const { dogs, activeDog, loading, error, fetchDogs, setActiveDog } = useDogs();
  const [showAddDogDialog, setShowAddDogDialog] = useState(false);
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const { isAuthReady, isLoggedIn } = useAuth();
  const [pageReady, setPageReady] = useState(false);
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [showError, setShowError] = useState(false);
  
  // Clear active dog when navigating to My Dogs page
  useEffect(() => {
    setActiveDog(null);
  }, [setActiveDog]);
  
  // Wait for auth to be ready before considering the page ready
  useEffect(() => {
    if (isAuthReady && isLoggedIn) {
      const timer = setTimeout(() => {
        setPageReady(true);
      }, 500);
      return () => clearTimeout(timer);
    } else if (isAuthReady && !isLoggedIn) {
      // Auth is ready but user is not logged in
      setPageReady(true);
    }
  }, [isAuthReady, isLoggedIn]);
  
  // Add visibility change handler to refresh data when tab becomes active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && pageReady && isLoggedIn) {
        console.log('MyDogs: Document became visible, refreshing data');
        fetchDogs(false).catch(err => {
          console.error('Error refreshing dogs on visibility change:', err);
        });
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchDogs, pageReady, isLoggedIn]);
  
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setShowError(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    } else {
      setShowError(false);
    }
  }, [error]);
  
  const filteredDogs = genderFilter === 'all' 
    ? dogs 
    : dogs.filter(dog => dog.gender === genderFilter);

  const handleRetry = () => {
    setRetryAttempts(prev => prev + 1);
    setShowError(false);
    
    const backoffTime = Math.min(500 * Math.pow(1.5, retryAttempts), 3000);
    setTimeout(() => {
      fetchDogs(true);
    }, backoffTime);
  };

  const errorMessage = typeof error === 'string' ? error : 'Failed to load dogs';
  const isNetworkError = errorMessage.includes('Failed to fetch') || 
                         errorMessage.includes('Network error') ||
                         errorMessage.includes('timeout');

  // Show loading while waiting for auth to be ready
  if (!isAuthReady) {
    return (
      <PageLayout 
        title="My Dogs" 
        description="Manage your breeding dogs"
        className="bg-warmbeige-50 overflow-y-auto"
      >
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
          <p className="text-muted-foreground">Preparing connection...</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="My Dogs" 
      description="Manage your breeding dogs"
      className="bg-warmbeige-50 overflow-y-auto"
    >
      {error && showError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription className="flex items-center justify-between w-full">
            <span>{isNetworkError ? 
              'Network connection problem. Please check your internet connection.' : 
              errorMessage}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetry}
              className="ml-2 bg-white"
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {(loading || !pageReady) ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
          <p className="text-muted-foreground">Loading your dogs...</p>
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
              onClick={() => setShowAddDogDialog(true)} 
              className="flex items-center gap-1.5"
              disabled={loading}
            >
              <PlusCircle className="h-4 w-4" />
              Add New Dog
            </Button>
          </div>
          
          <Card className="bg-white border border-warmbeige-100 shadow-sm overflow-y-auto">
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
                    onClick={() => setShowAddDogDialog(true)}
                    className="mt-4"
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
        open={showAddDogDialog} 
        onOpenChange={setShowAddDogDialog} 
      />
    </PageLayout>
  );
};

const MyDogs: React.FC = () => {
  return <MyDogsContent />;
};

export default MyDogs;
