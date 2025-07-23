import { supabase } from '@/integrations/supabase/client';
import { Litter, Puppy } from '@/types/breeding';

export class LitterService {
  async getAllLitters(userId: string): Promise<Litter[]> {
    try {
      const { data, error } = await supabase
        .from('litters')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching litters:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching litters:', error);
      return [];
    }
  }

  async getLitterById(litterId: string): Promise<Litter | null> {
    try {
      const { data, error } = await supabase
        .from('litters')
        .select('*')
        .eq('id', litterId)
        .single();

      if (error) {
        console.error('Error fetching litter by ID:', error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('Error fetching litter by ID:', error);
      return null;
    }
  }

  async addLitter(litter: Omit<Litter, 'id'>): Promise<Litter | null> {
    try {
      const { data, error } = await supabase
        .from('litters')
        .insert([litter])
        .select()
        .single();

      if (error) {
        console.error('Error adding litter:', error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('Error adding litter:', error);
      return null;
    }
  }

  async updateLitter(litter: Litter): Promise<Litter | null> {
    try {
      const { data, error } = await supabase
        .from('litters')
        .update(litter)
        .eq('id', litter.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating litter:', error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('Error updating litter:', error);
      return null;
    }
  }

  async deleteLitter(litterId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('litters')
        .delete()
        .eq('id', litterId);

      if (error) {
        console.error('Error deleting litter:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting litter:', error);
      return false;
    }
  }

  async archiveLitter(litterId: string, archive: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('litters')
        .update({ archived: archive })
        .eq('id', litterId);

      if (error) {
        console.error('Error archiving litter:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error archiving litter:', error);
      return false;
    }
  }

  // Puppy Methods
  async addPuppy(litterId: string, puppy: Omit<Puppy, 'id'>): Promise<Puppy | null> {
    try {
      const { data, error } = await supabase
        .from('puppies')
        .insert([{ ...puppy, litter_id: litterId }])
        .select()
        .single();

      if (error) {
        console.error('Error adding puppy:', error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('Error adding puppy:', error);
      return null;
    }
  }

  async updatePuppy(litterId: string, puppy: Puppy): Promise<Puppy | null> {
     try {
      const { data, error } = await supabase
        .from('puppies')
        .update({ ...puppy, litter_id: litterId })
        .eq('id', puppy.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating puppy:', error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('Error updating puppy:', error);
      return null;
    }
  }

  async deletePuppy(puppyId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('puppies')
        .delete()
        .eq('id', puppyId);

      if (error) {
        console.error('Error deleting puppy:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting puppy:', error);
      return false;
    }
  }

  // Planned Litter Methods
  async getAllPlannedLitters(userId: string): Promise<PlannedLitter[]> {
    try {
      const { data, error } = await supabase
        .from('planned_litters')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching planned litters:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching planned litters:', error);
      return [];
    }
  }

  async getPlannedLitterById(plannedLitterId: string): Promise<PlannedLitter | null> {
    try {
      const { data, error } = await supabase
        .from('planned_litters')
        .select('*')
        .eq('id', plannedLitterId)
        .single();

      if (error) {
        console.error('Error fetching planned litter by ID:', error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('Error fetching planned litter by ID:', error);
      return null;
    }
  }

  async addPlannedLitter(plannedLitter: Omit<PlannedLitter, 'id'>): Promise<PlannedLitter | null> {
    try {
      const { data, error } = await supabase
        .from('planned_litters')
        .insert([plannedLitter])
        .select()
        .single();

      if (error) {
        console.error('Error adding planned litter:', error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('Error adding planned litter:', error);
      return null;
    }
  }

  async updatePlannedLitter(plannedLitter: PlannedLitter): Promise<PlannedLitter | null> {
    try {
      const { data, error } = await supabase
        .from('planned_litters')
        .update(plannedLitter)
        .eq('id', plannedLitter.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating planned litter:', error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('Error updating planned litter:', error);
      return null;
    }
  }

  async deletePlannedLitter(plannedLitterId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('planned_litters')
        .delete()
        .eq('id', plannedLitterId);

      if (error) {
        console.error('Error deleting planned litter:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting planned litter:', error);
      return false;
    }
  }

  // Development Checklist Methods
  async loadChecklistItems(litterId: string): Promise<{ item_id: string; completed: boolean }[]> {
    try {
      const { data, error } = await supabase
        .from('development_checklist_items')
        .select('item_id, completed')
        .eq('litter_id', litterId);

      if (error) {
        console.error('Error loading checklist items:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error loading checklist items:', error);
      return [];
    }
  }

  async saveChecklistItem(litterId: string, itemId: string, completed: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('development_checklist_items')
        .upsert({
          litter_id: litterId,
          item_id: itemId,
          completed: completed
        }, {
          onConflict: 'litter_id,item_id'
        });

      if (error) {
        console.error('Error saving checklist item:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error saving checklist item:', error);
      return false;
    }
  }

  async deleteChecklistItems(litterId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('development_checklist_items')
        .delete()
        .eq('litter_id', litterId);

      if (error) {
        console.error('Error deleting checklist items:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting checklist items:', error);
      return false;
    }
  }
}
