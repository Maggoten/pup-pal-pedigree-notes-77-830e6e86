import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PartnerOffer {
  id: string;
  title: string;
  image_url: string;
  link?: string;
  start_date: string;
  end_date: string;
  active: boolean;
}

export const usePartnerOffers = () => {
  const [offers, setOffers] = useState<PartnerOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchPartnerOffers = async () => {
      try {
        setIsLoading(true);
        setHasError(false);

        const today = new Date().toISOString().split('T')[0];

        const { data, error } = await supabase
          .from('partner_offers')
          .select('*')
          .eq('active', true)
          .lte('start_date', today)
          .gte('end_date', today)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setOffers(data || []);
      } catch (error) {
        console.error('Error fetching partner offers:', error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPartnerOffers();
  }, []);

  return { offers, isLoading, hasError };
};