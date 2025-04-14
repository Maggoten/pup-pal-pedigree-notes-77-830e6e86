
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Define valid table names with literal types
type TableName = 'dogs' | 'heat_records' | 'calendar_events' | 'litters' | 
                'planned_litters' | 'puppies' | 'puppy_weight_records' | 
                'puppy_height_records' | 'puppy_notes' | 'mating_dates' | 
                'profiles' | 'reminders' | 'reminder_status' | 'shared_users' | 
                'vaccinations' | 'matings' | 'medical_issues';

interface UseSupabaseDataProps<T> {
  tableName: TableName;
  initialData?: T[];
}

export function useSupabaseData<T>({ tableName, initialData = [] }: UseSupabaseDataProps<T>) {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  // Fetch data when component mounts or user changes
  useEffect(() => {
    if (!user) {
      setData(initialData);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: fetchedData, error } = await supabase
          .from(tableName)
          .select('*');

        if (error) {
          throw error;
        }

        setData(fetchedData as T[]);
      } catch (err) {
        console.error(`Error fetching data from ${tableName}:`, err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tableName, user]);

  // Create a new record
  const create = async (newData: Omit<T, 'id'> & { user_id?: string }): Promise<T | null> => {
    try {
      if (!user) throw new Error('User must be logged in to create data');
      
      // Ensure user_id is set to current user
      const dataWithUserId = {
        ...newData,
        user_id: user.id
      };
      
      const { data: createdData, error } = await supabase
        .from(tableName)
        .insert(dataWithUserId as any)
        .select()
        .single();

      if (error) throw error;
      
      // Update local state
      setData(prev => [...prev, createdData as T]);
      
      return createdData as T;
    } catch (err) {
      console.error(`Error creating record in ${tableName}:`, err);
      setError(err as Error);
      return null;
    }
  };

  // Update an existing record
  const update = async (id: string, updates: Partial<T>): Promise<T | null> => {
    try {
      if (!user) throw new Error('User must be logged in to update data');
      
      const { data: updatedData, error } = await supabase
        .from(tableName)
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Update local state
      setData(prev => prev.map(item => 
        (item as any).id === id ? updatedData as T : item
      ));
      
      return updatedData as T;
    } catch (err) {
      console.error(`Error updating record in ${tableName}:`, err);
      setError(err as Error);
      return null;
    }
  };

  // Delete a record
  const remove = async (id: string): Promise<boolean> => {
    try {
      if (!user) throw new Error('User must be logged in to delete data');
      
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setData(prev => prev.filter(item => (item as any).id !== id));
      
      return true;
    } catch (err) {
      console.error(`Error deleting record from ${tableName}:`, err);
      setError(err as Error);
      return false;
    }
  };

  return {
    data,
    loading,
    error,
    create,
    update,
    remove,
    setData
  };
}
