
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { parseISO, addDays, differenceInDays } from 'date-fns';

interface PregnancyDetails {
  id: string;
  maleName: string;
  femaleName: string;
  matingDate: Date;
  expectedDueDate: Date;
  daysLeft: number;
}

export const usePregnancyDetails = (id: string | undefined) => {
  const navigate = useNavigate();
  const [pregnancy, setPregnancy] = useState<PregnancyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch pregnancy details from localStorage
    const fetchPregnancyDetails = () => {
      setLoading(true);
      
      if (!id) {
        setLoading(false);
        return;
      }
      
      try {
        const plannedLittersJSON = localStorage.getItem('plannedLitters');
        if (plannedLittersJSON) {
          const plannedLitters = JSON.parse(plannedLittersJSON);
          const litter = plannedLitters.find((litter: any) => litter.id === id);
          
          if (litter && litter.matingDates && litter.matingDates.length > 0) {
            // Use the most recent mating date
            const sortedMatingDates = [...litter.matingDates].sort((a: string, b: string) => 
              new Date(b).getTime() - new Date(a).getTime()
            );
            
            const matingDate = parseISO(sortedMatingDates[0]);
            const expectedDueDate = addDays(matingDate, 63); // 63 days is the average gestation period for dogs
            const daysLeft = differenceInDays(expectedDueDate, new Date());
            
            setPregnancy({
              id: litter.id,
              maleName: litter.maleName,
              femaleName: litter.femaleName,
              matingDate,
              expectedDueDate,
              daysLeft: daysLeft > 0 ? daysLeft : 0
            });
          } else {
            // Handle case where litter is not found or has no mating dates
            toast({
              title: "Pregnancy not found",
              description: "The pregnancy details could not be loaded.",
              variant: "destructive"
            });
            navigate('/pregnancy');
          }
        } else {
          toast({
            title: "No planned litters",
            description: "You don't have any planned litters yet.",
            variant: "destructive"
          });
          navigate('/pregnancy');
        }
      } catch (error) {
        console.error("Error fetching pregnancy details:", error);
        toast({
          title: "Error loading pregnancy",
          description: "There was a problem loading the pregnancy details.",
          variant: "destructive"
        });
        navigate('/pregnancy');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPregnancyDetails();
  }, [id, navigate]);
  
  return { pregnancy, loading };
};
