
import { useAuth } from '@/context/AuthContext';
import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDogs, DogsProvider } from '@/context/DogsContext';
import DogList from '@/components/DogList';
import DogDetails from '@/components/dogs/DogDetails';
import { PlusCircle, RefreshCw, AlertCircle } from 'lucide-react';
import AddDogDialog from '@/components/dogs/AddDogDialog';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const MyDogsContent: React.FC = () => {
  const { dogs, activeDog, refreshDogs, loading, error } = useDogs();
  const [showAddDogDialog, setShowAddDogDialog] = useState(false);
  const [refreshAttempts, setRefreshAttempts] = useState(0);
  
  // Log state changes for debugging
  useEffect(() => {
    console.log('MyDogsContent rendering: loading=', loading, 'error=', error, 'dogsCount=', dogs.length);
  }, [loading, error, dogs.length]);
  
  const females = dogs.filter(dog => dog.gender === 'female');
  const males = dogs.filter(dog => dog.gender === 'male');

  const handleRefresh = () => {
    console.log('Manual refresh requested');
    setRefreshAttempts(prev => prev + 1);
    refreshDogs();
  };
  
  // If loading continues for too long, show a timeout message
  const [showTimeout, setShowTimeout] = useState(false);
  
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    // Reset timeout warning if loading state changes
    if (loading) {
      timeoutId = setTimeout(() => {
        console.log('Loading timeout reached in MyDogsContent');
        setShowTimeout(true);
      }, 15000); // 15 seconds
    } else {
      setShowTimeout(false);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [loading]);

  // Show appropriate loading or error UI
  if (loading && !showTimeout) {
    return (
      <PageLayout title="My Dogs">
        <Card className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-medium">Loading your dogs...</h3>
            <RefreshCw className="h-8 w-8 mx-auto animate-spin text-primary" />
            <p className="text-muted-foreground">Please wait while we fetch your dogs.</p>
          </div>
        </Card>
      </PageLayout>
    );
  }
  
  if (showTimeout) {
    return (
      <PageLayout title="My Dogs">
        <Card className="p-6">
          <div className="text-center space-y-4">
            <AlertCircle className="h-8 w-8 mx-auto text-amber-500" />
            <h3 className="text-lg font-medium">Taking longer than expected</h3>
            <p className="text-muted-foreground">We're having trouble loading your dogs.</p>
            <Button onClick={handleRefresh}>Try Again</Button>
          </div>
        </Card>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="My Dogs">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        
        <Card className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-medium">Something went wrong</h3>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={handleRefresh}>Try Again</Button>
            {refreshAttempts >= 2 && (
              <p className="text-sm text-muted-foreground mt-4">
                Still having issues? Try refreshing the page or checking your connection.
              </p>
            )}
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
