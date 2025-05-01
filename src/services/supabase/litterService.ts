
import { supabase } from '@/integrations/supabase/client';
import { Litter, Puppy, PuppyWeightRecord, PuppyHeightRecord, PuppyNote } from '@/types/breeding';
import { toast } from '@/components/ui/use-toast';

export interface SupabasePuppy {
  id: string;
  litter_id: string;
  name: string;
  gender: 'male' | 'female';
  color: string;
  markings?: string;
  birth_weight?: number;
  current_weight?: number;
  sold?: boolean;
  reserved?: boolean;
  new_owner?: string;
  collar?: string;
  microchip?: string;
  breed?: string;
  image_url?: string;
  birth_date_time?: string;
  created_at?: string;
  updated_at?: string;
  weight_logs?: {
    date: string;
    weight: number;
  }[];
  height_logs?: {
    date: string;
    height: number;
  }[];
  notes?: {
    date: string;
    content: string;
  }[];
}

export interface SupabaseLitter {
  id: string;
  user_id: string;
  name: string;
  date_of_birth: string;
  sire_id?: string;
  dam_id?: string;
  sire_name: string;
  dam_name: string;
  archived: boolean;
  created_at?: string;
  updated_at?: string;
  puppies?: SupabasePuppy[];
}

class SupabaseLitterService {
  /**
   * Load all litters for the current user
   */
  async loadLitters(): Promise<Litter[]> {
    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No active session found');
        return [];
      }

      // Fetch all litters for current user
      const { data: litters, error } = await supabase
        .from('litters')
        .select('*')
        .order('date_of_birth', { ascending: false });

      if (error) {
        console.error('Error loading litters:', error);
        toast({
          title: 'Error loading litters',
          description: error.message,
          variant: 'destructive'
        });
        return [];
      }

      // Convert to our app's Litter type
      const formattedLitters: Litter[] = await Promise.all(
        litters.map(async (litter) => {
          // Fetch puppies for this litter
          const puppies = await this.fetchPuppiesForLitter(litter.id);
          
          return {
            id: litter.id,
            name: litter.name,
            dateOfBirth: litter.date_of_birth,
            sireId: litter.sire_id || '',
            damId: litter.dam_id || '',
            sireName: litter.sire_name,
            damName: litter.dam_name,
            archived: litter.archived,
            puppies
          };
        })
      );

      return formattedLitters;
    } catch (error) {
      console.error('Error in loadLitters:', error);
      toast({
        title: 'Error loading litters',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      return [];
    }
  }

  /**
   * Fetch all puppies for a specific litter
   */
  private async fetchPuppiesForLitter(litterId: string): Promise<Puppy[]> {
    try {
      // Fetch puppies
      const { data: puppies, error } = await supabase
        .from('puppies')
        .select('*')
        .eq('litter_id', litterId);

      if (error) {
        console.error('Error fetching puppies:', error);
        return [];
      }

      // Load weight logs, height logs, and notes for each puppy
      const puppiesWithLogs = await Promise.all(
        puppies.map(async (puppy) => {
          const weightLog = await this.fetchWeightLogs(puppy.id);
          const heightLog = await this.fetchHeightLogs(puppy.id);
          const notes = await this.fetchPuppyNotes(puppy.id);

          return {
            id: puppy.id,
            name: puppy.name,
            gender: puppy.gender as 'male' | 'female',
            color: puppy.color || '',
            markings: puppy.markings,
            birthWeight: puppy.birth_weight,
            currentWeight: puppy.current_weight,
            sold: puppy.sold,
            reserved: puppy.reserved,
            newOwner: puppy.new_owner,
            collar: puppy.collar,
            microchip: puppy.microchip,
            breed: puppy.breed,
            imageUrl: puppy.image_url,
            birthDateTime: puppy.birth_date_time,
            weightLog,
            heightLog,
            notes
          };
        })
      );

      return puppiesWithLogs;
    } catch (error) {
      console.error('Error fetching puppies for litter:', error);
      return [];
    }
  }

  /**
   * Fetch weight logs for a puppy
   */
  private async fetchWeightLogs(puppyId: string): Promise<PuppyWeightRecord[]> {
    try {
      const { data, error } = await supabase
        .from('puppy_weight_logs')
        .select('date, weight')
        .eq('puppy_id', puppyId)
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching weight logs:', error);
        return [];
      }

      return data.map(log => ({
        date: new Date(log.date).toISOString().split('T')[0],
        weight: log.weight
      }));
    } catch (error) {
      console.error('Error in fetchWeightLogs:', error);
      return [];
    }
  }

  /**
   * Fetch height logs for a puppy
   */
  private async fetchHeightLogs(puppyId: string): Promise<PuppyHeightRecord[]> {
    try {
      const { data, error } = await supabase
        .from('puppy_height_logs')
        .select('date, height')
        .eq('puppy_id', puppyId)
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching height logs:', error);
        return [];
      }

      return data.map(log => ({
        date: new Date(log.date).toISOString().split('T')[0],
        height: log.height
      }));
    } catch (error) {
      console.error('Error in fetchHeightLogs:', error);
      return [];
    }
  }

  /**
   * Fetch notes for a puppy
   */
  private async fetchPuppyNotes(puppyId: string): Promise<PuppyNote[]> {
    try {
      const { data, error } = await supabase
        .from('puppy_notes')
        .select('date, content')
        .eq('puppy_id', puppyId)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching puppy notes:', error);
        return [];
      }

      return data.map(note => ({
        date: new Date(note.date).toISOString().split('T')[0],
        content: note.content
      }));
    } catch (error) {
      console.error('Error in fetchPuppyNotes:', error);
      return [];
    }
  }

  /**
   * Add a new litter
   */
  async addLitter(litter: Litter): Promise<Litter | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session found');
      }

      const { data, error } = await supabase
        .from('litters')
        .insert({
          name: litter.name,
          date_of_birth: litter.dateOfBirth,
          sire_id: litter.sireId,
          dam_id: litter.damId,
          sire_name: litter.sireName,
          dam_name: litter.damName,
          archived: litter.archived || false,
          user_id: session.user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding litter:', error);
        toast({
          title: 'Error adding litter',
          description: error.message,
          variant: 'destructive'
        });
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        dateOfBirth: data.date_of_birth,
        sireId: data.sire_id || '',
        damId: data.dam_id || '',
        sireName: data.sire_name,
        damName: data.dam_name,
        archived: data.archived,
        puppies: []
      };
    } catch (error) {
      console.error('Error in addLitter:', error);
      toast({
        title: 'Error adding litter',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      return null;
    }
  }

  /**
   * Update an existing litter
   */
  async updateLitter(updatedLitter: Litter): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('litters')
        .update({
          name: updatedLitter.name,
          date_of_birth: updatedLitter.dateOfBirth,
          sire_id: updatedLitter.sireId,
          dam_id: updatedLitter.damId,
          sire_name: updatedLitter.sireName,
          dam_name: updatedLitter.damName,
          archived: updatedLitter.archived
        })
        .eq('id', updatedLitter.id);

      if (error) {
        console.error('Error updating litter:', error);
        toast({
          title: 'Error updating litter',
          description: error.message,
          variant: 'destructive'
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateLitter:', error);
      toast({
        title: 'Error updating litter',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      return false;
    }
  }

  /**
   * Delete a litter
   */
  async deleteLitter(litterId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('litters')
        .delete()
        .eq('id', litterId);

      if (error) {
        console.error('Error deleting litter:', error);
        toast({
          title: 'Error deleting litter',
          description: error.message,
          variant: 'destructive'
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteLitter:', error);
      toast({
        title: 'Error deleting litter',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      return false;
    }
  }

  /**
   * Archive or unarchive a litter
   */
  async toggleArchiveLitter(litterId: string, archive: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('litters')
        .update({ archived: archive })
        .eq('id', litterId);

      if (error) {
        console.error('Error toggling archive status:', error);
        toast({
          title: 'Error updating litter',
          description: error.message,
          variant: 'destructive'
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in toggleArchiveLitter:', error);
      toast({
        title: 'Error updating litter',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      return false;
    }
  }

  /**
   * Add a puppy to a litter
   */
  async addPuppy(litterId: string, puppy: Puppy): Promise<Puppy | null> {
    try {
      // First, insert the puppy into the puppies table
      const { data: newPuppy, error: puppyError } = await supabase
        .from('puppies')
        .insert({
          litter_id: litterId,
          name: puppy.name,
          gender: puppy.gender,
          color: puppy.color,
          markings: puppy.markings,
          birth_weight: puppy.birthWeight,
          current_weight: puppy.currentWeight,
          sold: puppy.sold,
          reserved: puppy.reserved,
          new_owner: puppy.newOwner,
          collar: puppy.collar,
          microchip: puppy.microchip,
          breed: puppy.breed,
          image_url: puppy.imageUrl,
          birth_date_time: puppy.birthDateTime
        })
        .select()
        .single();

      if (puppyError) {
        console.error('Error adding puppy:', puppyError);
        toast({
          title: 'Error adding puppy',
          description: puppyError.message,
          variant: 'destructive'
        });
        return null;
      }

      // Add birth weight to weight log if provided
      if (puppy.birthWeight && puppy.birthDateTime) {
        const birthDate = new Date(puppy.birthDateTime);
        await this.addWeightLog(newPuppy.id, birthDate.toISOString(), puppy.birthWeight);
      }

      // Add any weight logs
      if (puppy.weightLog && puppy.weightLog.length > 0) {
        await Promise.all(
          puppy.weightLog.map(log => 
            this.addWeightLog(newPuppy.id, log.date, log.weight)
          )
        );
      }

      // Add any height logs
      if (puppy.heightLog && puppy.heightLog.length > 0) {
        await Promise.all(
          puppy.heightLog.map(log => 
            this.addHeightLog(newPuppy.id, log.date, log.height)
          )
        );
      }

      // Add any notes
      if (puppy.notes && puppy.notes.length > 0) {
        await Promise.all(
          puppy.notes.map(note => 
            this.addPuppyNote(newPuppy.id, note.date, note.content)
          )
        );
      }

      // Now fetch the complete puppy data with all logs
      const puppyWithLogs: Puppy = {
        id: newPuppy.id,
        name: newPuppy.name,
        gender: newPuppy.gender as 'male' | 'female',
        color: newPuppy.color || '',
        markings: newPuppy.markings,
        birthWeight: newPuppy.birth_weight,
        currentWeight: newPuppy.current_weight,
        sold: newPuppy.sold,
        reserved: newPuppy.reserved,
        newOwner: newPuppy.new_owner,
        collar: newPuppy.collar,
        microchip: newPuppy.microchip,
        breed: newPuppy.breed,
        imageUrl: newPuppy.image_url,
        birthDateTime: newPuppy.birth_date_time,
        weightLog: await this.fetchWeightLogs(newPuppy.id),
        heightLog: await this.fetchHeightLogs(newPuppy.id),
        notes: await this.fetchPuppyNotes(newPuppy.id)
      };

      return puppyWithLogs;
    } catch (error) {
      console.error('Error in addPuppy:', error);
      toast({
        title: 'Error adding puppy',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      return null;
    }
  }

  /**
   * Update a puppy
   */
  async updatePuppy(litterId: string, updatedPuppy: Puppy): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('puppies')
        .update({
          name: updatedPuppy.name,
          gender: updatedPuppy.gender,
          color: updatedPuppy.color,
          markings: updatedPuppy.markings,
          birth_weight: updatedPuppy.birthWeight,
          current_weight: updatedPuppy.currentWeight,
          sold: updatedPuppy.sold,
          reserved: updatedPuppy.reserved,
          new_owner: updatedPuppy.newOwner,
          collar: updatedPuppy.collar,
          microchip: updatedPuppy.microchip,
          breed: updatedPuppy.breed,
          image_url: updatedPuppy.imageUrl,
          birth_date_time: updatedPuppy.birthDateTime
        })
        .eq('id', updatedPuppy.id)
        .eq('litter_id', litterId);

      if (error) {
        console.error('Error updating puppy:', error);
        toast({
          title: 'Error updating puppy',
          description: error.message,
          variant: 'destructive'
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updatePuppy:', error);
      toast({
        title: 'Error updating puppy',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      return false;
    }
  }

  /**
   * Delete a puppy
   */
  async deletePuppy(puppyId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('puppies')
        .delete()
        .eq('id', puppyId);

      if (error) {
        console.error('Error deleting puppy:', error);
        toast({
          title: 'Error deleting puppy',
          description: error.message,
          variant: 'destructive'
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deletePuppy:', error);
      toast({
        title: 'Error deleting puppy',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      return false;
    }
  }

  /**
   * Add a weight log entry for a puppy
   */
  async addWeightLog(puppyId: string, date: string, weight: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('puppy_weight_logs')
        .insert({
          puppy_id: puppyId,
          date,
          weight
        });

      if (error) {
        console.error('Error adding weight log:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in addWeightLog:', error);
      return false;
    }
  }

  /**
   * Add a height log entry for a puppy
   */
  async addHeightLog(puppyId: string, date: string, height: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('puppy_height_logs')
        .insert({
          puppy_id: puppyId,
          date,
          height
        });

      if (error) {
        console.error('Error adding height log:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in addHeightLog:', error);
      return false;
    }
  }

  /**
   * Add a note for a puppy
   */
  async addPuppyNote(puppyId: string, date: string, content: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('puppy_notes')
        .insert({
          puppy_id: puppyId,
          date,
          content
        });

      if (error) {
        console.error('Error adding puppy note:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in addPuppyNote:', error);
      return false;
    }
  }

  /**
   * Save checklist item status
   */
  async saveChecklistItemStatus(litterId: string, itemId: string, completed: boolean): Promise<boolean> {
    try {
      // First check if the item exists
      const { data: existingItem, error: checkError } = await supabase
        .from('development_checklist_items')
        .select('*')
        .eq('litter_id', litterId)
        .eq('item_id', itemId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking for existing checklist item:', checkError);
        return false;
      }

      if (existingItem) {
        // Update existing item
        const { error: updateError } = await supabase
          .from('development_checklist_items')
          .update({ completed })
          .eq('litter_id', litterId)
          .eq('item_id', itemId);

        if (updateError) {
          console.error('Error updating checklist item:', updateError);
          return false;
        }
      } else {
        // Insert new item
        const { error: insertError } = await supabase
          .from('development_checklist_items')
          .insert({
            litter_id: litterId,
            item_id: itemId,
            completed
          });

        if (insertError) {
          console.error('Error inserting checklist item:', insertError);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error in saveChecklistItemStatus:', error);
      return false;
    }
  }

  /**
   * Load checklist item statuses for a litter
   */
  async loadChecklistStatuses(litterId: string): Promise<Record<string, boolean>> {
    try {
      const { data, error } = await supabase
        .from('development_checklist_items')
        .select('item_id, completed')
        .eq('litter_id', litterId);

      if (error) {
        console.error('Error loading checklist statuses:', error);
        return {};
      }

      // Convert array to object map
      const statusMap: Record<string, boolean> = {};
      data.forEach(item => {
        statusMap[item.item_id] = item.completed;
      });

      return statusMap;
    } catch (error) {
      console.error('Error in loadChecklistStatuses:', error);
      return {};
    }
  }
}

export const supabaseLitterService = new SupabaseLitterService();
