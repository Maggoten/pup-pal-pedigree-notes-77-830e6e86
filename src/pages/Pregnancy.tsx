
import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Heart, AlertCircle, Loader2, Baby } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { useDogs } from '@/context/DogsContext';
import { getActivePregnancies, getFirstActivePregnancy, getPregnancyDetails } from '@/services/PregnancyService';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/context/AuthContext';

import ActivePregnanciesList from '@/components/pregnancy/ActivePregnanciesList';
import PregnancyDropdownSelector from '@/components/pregnancy/PregnancyDropdownSelector';
import PregnancySummaryCards from '@/components/pregnancy/PregnancySummaryCards';
import PregnancyTabs from '@/components/pregnancy/PregnancyTabs';
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

  useEffect(() => {
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
        setActivePregnancies(pregnancies);
        
        // If no pregnancies found
        if (pregnancies.length === 0) {
          console.log("No active pregnancies found");
          setIsLoading(false);
          return;
        }
        
        // Determine which pregnancy to display
        let targetPregnancyId = pregnancyId;
        
        // If no pregnancy ID in URL, use first one
        if (!targetPregnancyId && pregnancies.length > 0) {
          targetPregnancyId = pregnancies[0].id;
        }
        
        // Fetch details of the selected pregnancy
        if (targetPregnancyId) {
          console.log(`Fetching details for pregnancy ${targetPregnancyId}`);
          const details = await getPregnancyDetails(targetPregnancyId);
          setSelectedPregnancy(details);
          
          // Update URL if needed
          if (!pregnancyId && details) {
            navigate(`/pregnancy/${details.id}`, { replace: true });
          }
        }
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
  }, [dogs, user, pregnancyId, navigate]);

  const handleAddPregnancyClick = () => {
    navigate('/planned-litters');
  };

  return (
    <PageLayout 
      title="Pregnancy" 
      description="Track your pregnant bitches and fetal development"
      icon={<Heart className="h-6 w-6" />}
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          {selectedPregnancy && (
            <h1 className="text-2xl font-bold text-greige-800">
              {selectedPregnancy.femaleName}'s Pregnancy
            </h1>
          )}
        </div>
        <div className="flex gap-4">
          <PregnancyDropdownSelector 
            pregnancies={activePregnancies} 
            currentPregnancyId={selectedPregnancy?.id} 
          />
          <Button onClick={handleAddPregnancyClick} className="bg-greige-600 hover:bg-greige-700">
            Add Pregnancy
          </Button>
        </div>
      </div>
      
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
              isLoading={isLoading}
            />
          </div>
        </div>
      ) : selectedPregnancy ? (
        <div className="space-y-8">
          {/* Hero Section with Pregnancy Summary Cards */}
          <PregnancySummaryCards
            matingDate={selectedPregnancy.matingDate}
            expectedDueDate={selectedPregnancy.expectedDueDate}
            daysLeft={selectedPregnancy.daysLeft}
          />
          
          {/* Full Width Pregnancy Journey Tabs */}
          <div className="w-full">
            <PregnancyTabs 
              pregnancyId={selectedPregnancy.id}
              femaleName={selectedPregnancy.femaleName}
              matingDate={selectedPregnancy.matingDate}
              expectedDueDate={selectedPregnancy.expectedDueDate}
            />
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Baby className="h-12 w-12 mx-auto text-greige-400 mb-4" />
          <h3 className="text-xl font-medium text-greige-700">No Active Pregnancy Selected</h3>
          <p className="text-greige-500 mt-2">Please select a pregnancy from the dropdown or add a new one.</p>
          <Button 
            onClick={handleAddPregnancyClick} 
            className="mt-4 bg-greige-600 hover:bg-greige-700"
          >
            Add Pregnancy
          </Button>
        </div>
      )}
    </PageLayout>
  );
};

export default Pregnancy;
