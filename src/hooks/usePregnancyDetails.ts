import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { getPregnancyDetails } from '@/services/PregnancyService';
import { PregnancyDetails } from '@/services/PregnancyService';
import { useAuth } from '@/hooks/useAuth';

export const usePregnancyDetails = (id: string | undefined) => {
  const navigate = useNavigate();
  const { user, isAuthReady } = useAuth();
  const [pregnancy, setPregnancy] = useState<PregnancyDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPregnancyDetails = async () => {
      if (!isAuthReady || !user || !id) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        console.log(`Fetching pregnancy details for ID: ${id}`);
        const details = await getPregnancyDetails(id);

        if (details) {
          console.log("Successfully loaded pregnancy details:", {
            id: details.id,
            femaleName: details.femaleName,
            maleName: details.maleName,
            matingDate: details.matingDate,
            daysLeft: details.daysLeft
          });
          setPregnancy(details);
        } else {
          console.error(`Pregnancy with ID ${id} not found`);
          toast({
            title: "Pregnancy not found",
            description: "The pregnancy details could not be loaded.",
            variant: "destructive"
          });
          navigate('/pregnancy');
        }
      } catch (error) {
        console.error("Error loading pregnancy details:", error);
        toast({
          title: "Error",
          description: "An error occurred while loading the pregnancy.",
          variant: "destructive"
        });
        setPregnancy(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPregnancyDetails();
  }, [id, user, isAuthReady, navigate]);

  return { pregnancy, loading };
};
