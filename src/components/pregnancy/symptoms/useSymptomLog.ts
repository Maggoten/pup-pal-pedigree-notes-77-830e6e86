
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { SymptomRecord } from './types';
import { supabase } from '@/integrations/supabase/client';

export const useSymptomLog = (pregnancyId: string, femaleName: string) => {
  const [symptoms, setSymptoms] = useState<SymptomRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSymptoms = async () => {
      setLoading(true);
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
        return;
      }

      const processedSymptoms = data.map(symptom => ({
        id: symptom.id,
        date: new Date(symptom.date),
        title: symptom.title,
        description: symptom.description
      }));

      setSymptoms(processedSymptoms);
      setLoading(false);
    };

    loadSymptoms();
  }, [pregnancyId]);

  const addSymptom = async (record: Omit<SymptomRecord, 'id'>) => {
    const { data, error } = await supabase
      .from('symptom_logs')
      .insert({
        pregnancy_id: pregnancyId,
        title: record.title,
        description: record.description,
        date: record.date.toISOString()
      })
      .select()
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
  };

  const deleteSymptom = async (id: string) => {
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
  };

  return {
    symptoms,
    loading,
    addSymptom,
    deleteSymptom
  };
};
