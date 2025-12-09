import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { WeightRecord } from './types';
import { supabase } from '@/integrations/supabase/client';

const SUPABASE_URL = "https://yqcgqriecxtppuvcguyj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxY2dxcmllY3h0cHB1dmNndXlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2OTI4NjksImV4cCI6MjA2MDI2ODg2OX0.PD0W-rLpQBHUGm9--nv4-3PVYQFMAsRujmExBDuP5oA";

export const useWeightLog = (pregnancyId: string) => {
  const [weights, setWeights] = useState<WeightRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWeights = async () => {
      setLoading(true);
      
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const authHeader = sessionData.session ? 
          { Authorization: `Bearer ${sessionData.session.access_token}` } : {};
          
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/pregnancy_weight_logs?pregnancy_id=eq.${pregnancyId}&order=date.desc`, 
          {
            headers: {
              'apikey': SUPABASE_KEY,
              'Content-Type': 'application/json',
              ...authHeader
            }
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to load weight data');
        }
        
        const data = await response.json();

        const processedWeights = data.map((weight: any) => ({
          id: weight.id,
          date: new Date(weight.date),
          weight: weight.weight,
          notes: weight.notes
        }));

        setWeights(processedWeights);
      } catch (err) {
        console.error('Error in weight loading:', err);
        toast({
          title: "Error loading weight logs",
          description: "There was a problem loading the weight records.",
          variant: "destructive"
        });
      }
      
      setLoading(false);
    };

    if (pregnancyId) {
      loadWeights();
    }
  }, [pregnancyId]);

  const addWeight = async (record: Omit<WeightRecord, 'id'>) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        toast({
          title: "Authentication required",
          description: "You need to be logged in to add weight records.",
          variant: "destructive"
        });
        return;
      }
      
      const userId = sessionData.session.user.id;
      
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/pregnancy_weight_logs`, 
        {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionData.session.access_token}`,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            pregnancy_id: pregnancyId,
            user_id: userId,
            weight: record.weight,
            date: record.date.toISOString(),
            notes: record.notes
          })
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to save weight data');
      }
      
      const data = await response.json();
      const newRecordData = data[0];
      
      if (!newRecordData) {
        throw new Error('No data returned after saving');
      }

      const newRecord: WeightRecord = {
        id: newRecordData.id,
        date: new Date(newRecordData.date),
        weight: newRecordData.weight,
        notes: newRecordData.notes
      };

      setWeights(prev => [newRecord, ...prev].sort((a, b) => 
        b.date.getTime() - a.date.getTime()
      ));

      toast({
        title: "Weight recorded",
        description: `Weight of ${record.weight} kg recorded for ${record.date.toLocaleDateString()}.`
      });
    } catch (err) {
      console.error('Error in weight addition:', err);
      toast({
        title: "Error saving weight",
        description: "The weight record could not be saved.",
        variant: "destructive"
      });
    }
  };

  const deleteWeight = async (id: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        toast({
          title: "Authentication required",
          description: "You need to be logged in to delete weight records.",
          variant: "destructive"
        });
        return;
      }
      
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/pregnancy_weight_logs?id=eq.${id}`, 
        {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_KEY,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionData.session.access_token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to delete weight data');
      }

      setWeights(prev => prev.filter(weight => weight.id !== id));

      toast({
        title: "Weight deleted",
        description: "The weight record has been deleted."
      });
    } catch (err) {
      console.error('Error in weight deletion:', err);
      toast({
        title: "Error deleting record",
        description: "The weight record could not be deleted.",
        variant: "destructive"
      });
    }
  };

  return {
    weights,
    loading,
    addWeight,
    deleteWeight
  };
};
