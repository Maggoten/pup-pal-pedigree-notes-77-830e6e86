
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
      
      try {
        // Use fetch API to bypass TypeScript restrictions
        const supabaseUrl = "https://yqcgqriecxtppuvcguyj.supabase.co";
        const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxY2dxcmllY3h0cHB1dmNndXlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2OTI4NjksImV4cCI6MjA2MDI2ODg2OX0.PD0W-rLpQBHUGm9--nv4-3PVYQFMAsRujmExBDuP5oA";
        
        // Get auth session for authentication
        const { data: sessionData } = await supabase.auth.getSession();
        const authHeader = sessionData.session ? 
          { Authorization: `Bearer ${sessionData.session.access_token}` } : {};
          
        const response = await fetch(
          `${supabaseUrl}/rest/v1/symptom_logs?pregnancy_id=eq.${pregnancyId}&order=date.desc`, 
          {
            headers: {
              'apikey': supabaseKey,
              'Content-Type': 'application/json',
              ...authHeader
            }
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to load symptom data');
        }
        
        const data = await response.json();

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
    try {
      // Get auth session for authentication
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        toast({
          title: "Authentication required",
          description: "You need to be logged in to add observations.",
          variant: "destructive"
        });
        return;
      }
      
      const userId = sessionData.session.user.id;
      const supabaseUrl = "https://yqcgqriecxtppuvcguyj.supabase.co";
      const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxY2dxcmllY3h0cHB1dmNndXlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2OTI4NjksImV4cCI6MjA2MDI2ODg2OX0.PD0W-rLpQBHUGm9--nv4-3PVYQFMAsRujmExBDuP5oA";
      
      const response = await fetch(
        `${supabaseUrl}/rest/v1/symptom_logs`, 
        {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionData.session.access_token}`,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            pregnancy_id: pregnancyId,
            user_id: userId,
            title: record.title,
            description: record.description,
            date: record.date.toISOString()
          })
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to save symptom data');
      }
      
      const data = await response.json();
      const newRecordData = data[0]; // Get the first returned item
      
      if (!newRecordData) {
        throw new Error('No data returned after saving');
      }

      const newRecord: SymptomRecord = {
        id: newRecordData.id,
        date: new Date(newRecordData.date),
        title: newRecordData.title,
        description: newRecordData.description
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
      // Get auth session for authentication  
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        toast({
          title: "Authentication required",
          description: "You need to be logged in to delete observations.",
          variant: "destructive"
        });
        return;
      }
      
      const supabaseUrl = "https://yqcgqriecxtppuvcguyj.supabase.co";
      const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxY2dxcmllY3h0cHB1dmNndXlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2OTI4NjksImV4cCI6MjA2MDI2ODg2OX0.PD0W-rLpQBHUGm9--nv4-3PVYQFMAsRujmExBDuP5oA";
      
      const response = await fetch(
        `${supabaseUrl}/rest/v1/symptom_logs?id=eq.${id}`, 
        {
          method: 'DELETE',
          headers: {
            'apikey': supabaseKey,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionData.session.access_token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to delete symptom data');
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
