
import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Heart, AlertCircle, Loader2, Baby, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { useDogs } from '@/context/DogsContext';
import { getActivePregnancies, getFirstActivePregnancy } from '@/services/PregnancyService';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/context/AuthContext';

import ActivePregnanciesList from '@/components/pregnancy/ActivePregnanciesList';
import PregnancyDropdownSelector from '@/components/pregnancy/PregnancyDropdownSelector';
import PregnancySummaryCards from '@/components/pregnancy/PregnancySummaryCards';
import PregnancyTabs from '@/components/pregnancy/PregnancyTabs';
import AddPregnancyDialog from '@/components/pregnancy/AddPregnancyDialog';
import { PregnancyDetails } from '@/services/PregnancyService';

const Pregnancy: React.FC = () => {
  const navigate = useNavigate();
  const { pregnancyId } = useParams();
  const { dogs } = useDogs();
  const { user } = useAuth();
  
  const [activePregnancies, setActivePregnancies] = useState<ActivePregnancy[]>([]);
  const [selectedPregnancy, setSelectedPregnancy] = useState<PregnancyDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [addPregnancyDialogOpen, setAddPregnancyDialogOpen] = useState(false);

  useEffect(() => {
    // Skip refetching if we've already loaded data
    if (dataFetched) return;
    
    const fetchPregnancies = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setHasError(false);
        
        console.log("Fetching active pregnancies...");
        const pregnancies = await getActivePregnancies();
        console.log("Fetched pregnancies count:", pregnancies.length);
        setActivePregnancies(pregnancies);
        
        // If no pregnancies found
        if (pregnancies.length === 0) {
          console.log("No active pregnancies found");
          setIsLoading(false);
          setDataFetched(true);
          return;
        }
        
        let targetPregnancyId = pregnancyId;
        
        // If no pregnancy ID in URL, redirect to the first pregnancy detail page
        if (!targetPregnancyId && pregnancies.length > 0) {
          console.log("No ID in URL, redirecting to first pregnancy");
          navigate(`/pregnancy/${pregnancies[0].id}`, { replace: true });
          return;
        }
        
        setDataFetched(true);
      } catch (error) {
        console.error("Error fetching pregnancies:", error);
        setHasError(true);
        toast({
          title: "Error loading pregnancies",
          description: "There was a problem loading active pregnancies."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPregnancies();
  }, [dogs, user, pregnancyId, navigate, dataFetched]);

  const handleAddPregnancyClick = () => {
    setAddPregnancyDialogOpen(true);
  };

  const handleAddPregnancyDialogClose = () => {
    setAddPregnancyDialogOpen(false);
    // Refresh data after adding a pregnancy
    setDataFetched(false);
  };

  return (
    <PageLayout 
      title="Pregnancy" 
      description="Track your pregnant bitches and fetal development"
      icon={<Heart className="h-6 w-6" />}
    >
      {hasError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            There was a problem loading your pregnancies. Please try again later.
          </AlertDescription>
        </Alert>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading pregnancy details...</span>
        </div>
      ) : activePregnancies.length === 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-greige-50 border border-greige-200 rounded-lg shadow-sm">
            <ActivePregnanciesList 
              pregnancies={activePregnancies} 
              onAddPregnancy={handleAddPregnancyClick}
              isLoading={false}
            />
          </div>

          <div className="bg-greige-50 border border-greige-200 rounded-lg p-6 flex flex-col items-center justify-center text-center">
            <Baby className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">Add a Pregnancy</h3>
            <p className="text-gray-500 mb-6 max-w-sm">
              Track your dog's pregnancy journey, from mating to whelping.
            </p>
            <div className="flex gap-4">
              <Button 
                onClick={handleAddPregnancyClick} 
                variant="default"
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Pregnancy
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Baby className="h-12 w-12 mx-auto text-greige-400 mb-4" />
          <h3 className="text-xl font-medium text-greige-700">Redirecting to Pregnancy Details</h3>
          <p className="text-greige-500 mt-2">You will be redirected to view pregnancy details...</p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Button 
              onClick={handleAddPregnancyClick} 
              variant="default"
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Pregnancy
            </Button>
          </div>
        </div>
      )}
      
      <AddPregnancyDialog 
        open={addPregnancyDialogOpen} 
        onOpenChange={setAddPregnancyDialogOpen}
        onClose={handleAddPregnancyDialogClose}
      />
    </PageLayout>
  );
};

export default Pregnancy;
