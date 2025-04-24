
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { SymptomRecord } from './types';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

export const useSymptomLog = (pregnancyId: string, femaleName: string) => {
  const [symptoms, setSymptoms] = useState<SymptomRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Get current session
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    
    getSession();
  }, []);

  useEffect(() => {
    const loadSymptoms = async () => {
      setLoading(true);
      
      try {
        // Use the raw query method to avoid type errors
        const { data, error } = await supabase
          .from('symptom_logs')
          .select('*')
          .eq('pregnancy_id', pregnancyId)
          .order('date', { ascending: false });

        if (error) {
          console.error('Error loading symptoms:', error);
          toast({
            title: "Error loading observations",
            description: "There was a problem loading the observation records.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        // Process the data manually
        const processedSymptoms = data.map((symptom: any) => ({
          id: symptom.id,
          date: new Date(symptom.date),
          title: symptom.title,
          description: symptom.description
        }));

        setSymptoms(processedSymptoms);
      } catch (err) {
        console.error('Error in symptom loading:', err);
        toast({
          title: "Error loading observations",
          description: "There was a problem loading the observation records.",
          variant: "destructive"
        });
      }
      
      setLoading(false);
    };

    if (pregnancyId) {
      loadSymptoms();
    }
  }, [pregnancyId]);

  const addSymptom = async (record: Omit<SymptomRecord, 'id'>) => {
    if (!session?.user.id) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to add observations.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Use the raw insert method to avoid type errors
      const { data, error } = await supabase
        .from('symptom_logs')
        .insert({
          pregnancy_id: pregnancyId,
          user_id: session.user.id,
          title: record.title,
          description: record.description,
          date: record.date.toISOString()
        })
        .select('*')
        .single();

      if (error) {
        console.error('Error adding symptom:', error);
        toast({
          title: "Error saving observation",
          description: "The observation could not be saved.",
          variant: "destructive"
        });
        return;
      }

      const newRecord: SymptomRecord = {
        id: data.id,
        date: new Date(data.date),
        title: data.title,
        description: data.description
      };

      setSymptoms(prev => [newRecord, ...prev].sort((a, b) => 
        b.date.getTime() - a.date.getTime()
      ));

      toast({
        title: "Observation recorded",
        description: `"${record.title}" has been added to ${femaleName}'s pregnancy log.`
      });
    } catch (err) {
      console.error('Error in symptom addition:', err);
      toast({
        title: "Error saving observation",
        description: "The observation could not be saved.",
        variant: "destructive"
      });
    }
  };

  const deleteSymptom = async (id: string) => {
    try {
      // Use the raw delete method to avoid type errors
      const { error } = await supabase
        .from('symptom_logs')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting symptom:', error);
        toast({
          title: "Error deleting record",
          description: "The observation could not be deleted.",
          variant: "destructive"
        });
        return;
      }

      setSymptoms(prev => prev.filter(symptom => symptom.id !== id));

      toast({
        title: "Record deleted",
        description: "The observation has been deleted from the log."
      });
    } catch (err) {
      console.error('Error in symptom deletion:', err);
      toast({
        title: "Error deleting record",
        description: "The observation could not be deleted.",
        variant: "destructive"
      });
    }
  };

  return {
    symptoms,
    loading,
    addSymptom,
    deleteSymptom
  };
};
