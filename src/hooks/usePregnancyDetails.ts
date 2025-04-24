
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { getPregnancyDetails } from '@/services/PregnancyService';
import { PregnancyDetails } from '@/services/PregnancyService';

export const usePregnancyDetails = (id: string | undefined) => {
  const navigate = useNavigate();
  const [pregnancy, setPregnancy] = useState<PregnancyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchPregnancyDetails = async () => {
      setLoading(true);
      
      if (!id) {
        setLoading(false);
        return;
      }
      
      try {
        const details = await getPregnancyDetails(id);
        
        if (details) {
          setPregnancy(details);
        } else {
          // Handle case where pregnancy is not found
          toast({
            title: "Pregnancy not found",
            description: "The pregnancy details could not be loaded.",
            variant: "destructive"
          });
          navigate('/pregnancy');
        }
      } catch (error) {
        console.error("Error fetching pregnancy details:", error);
        toast({
          title: "Error",
          description: "Failed to load pregnancy details.",
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
