
import { Litter, Puppy } from '@/types/breeding';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

class LitterService {
  private readonly STORAGE_KEY = 'litters';

  /**
   * Load litters from Supabase
   */
  async loadLitters(): Promise<Litter[]> {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        console.error("No active session found");
        return this.loadFromLocalStorage();
      }

      // Fetch litters from Supabase
      const { data: litters, error } = await supabase
        .from('litters')
        .select(`
          *,
          puppies(*)
        `)
        .eq('user_id', sessionData.session.user.id);

      if (error) {
        console.error("Error loading litters from Supabase:", error);
        return this.loadFromLocalStorage();
      }

      // Map Supabase data to our Litter type
      return litters.map(litter => ({
        id: litter.id,
        name: litter.name,
        dateOfBirth: litter.date_of_birth,
        sireId: litter.sire_id || '',
        damId: litter.dam_id || '',
        sireName: litter.sire_name,
        damName: litter.dam_name,
        puppies: (litter.puppies || []).map(puppy => ({
          id: puppy.id,
          name: puppy.name,
          gender: puppy.gender === 'male' ? 'male' : 'female',
          color: puppy.color || '',
          markings: puppy.markings,
          birthWeight: puppy.birth_weight,
          currentWeight: puppy.current_weight,
          sold: puppy.sold || false,
          reserved: puppy.reserved || false,
          newOwner: puppy.new_owner,
          collar: puppy.collar,
          microchip: puppy.microchip,
          breed: puppy.breed,
          imageUrl: puppy.image_url,
          birthDateTime: puppy.birth_date_time,
          notes: [],
          weightLog: [],
          heightLog: []
        })),
        archived: litter.archived || false,
        user_id: litter.user_id
      }));
    } catch (error) {
      console.error("Error in loadLitters:", error);
      return this.loadFromLocalStorage();
    }
  }

  /**
   * Load litters from localStorage as fallback
   */
  private loadFromLocalStorage(): Litter[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Error parsing litters from localStorage:", e);
        return [];
      }
    }
    return [];
  }

  /**
   * Save litters to Supabase and localStorage as backup
   */
  async saveLitters(litters: Litter[]): Promise<void> {
    // Save to localStorage as backup
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(litters));
  }

  /**
   * Add a new litter
   */
  async addLitter(litter: Litter): Promise<Litter[]> {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error("No active session");
      }

      // Ensure the archived property is set (default to false)
      if (litter.archived === undefined) {
        litter.archived = false;
      }
      
      // Initialize puppies array if it doesn't exist
      if (!litter.puppies) {
        litter.puppies = [];
      }

      // Insert into Supabase
      const { data: newLitter, error } = await supabase
        .from('litters')
        .insert({
          id: litter.id,
          name: litter.name,
          date_of_birth: litter.dateOfBirth,
          sire_id: litter.sireId,
          dam_id: litter.damId,
          sire_name: litter.sireName,
          dam_name: litter.damName,
          archived: litter.archived,
          user_id: sessionData.session.user.id
        })
        .select()
        .single();

      if (error) {
        console.error("Error adding litter to Supabase:", error);
        throw error;
      }

      // Add to localStorage as backup
      const litters = this.loadFromLocalStorage();
      const updatedLitters = [...litters, litter];
      this.saveLitters(updatedLitters);

      return await this.loadLitters();
    } catch (error) {
      console.error("Error in addLitter:", error);
      // Fallback to localStorage
      const litters = this.loadFromLocalStorage();
      const updatedLitters = [...litters, litter];
      this.saveLitters(updatedLitters);
      return updatedLitters;
    }
  }

  /**
   * Update an existing litter
   */
  async updateLitter(updatedLitter: Litter): Promise<Litter[]> {
    try {
      // Update in Supabase
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
        console.error("Error updating litter in Supabase:", error);
        throw error;
      }

      // Update in localStorage as backup
      const litters = this.loadFromLocalStorage();
      const updatedLitters = litters.map(litter => 
        litter.id === updatedLitter.id ? updatedLitter : litter
      );
      this.saveLitters(updatedLitters);

      return await this.loadLitters();
    } catch (error) {
      console.error("Error in updateLitter:", error);
      // Fallback to localStorage
      const litters = this.loadFromLocalStorage();
      const updatedLitters = litters.map(litter => 
        litter.id === updatedLitter.id ? updatedLitter : litter
      );
      this.saveLitters(updatedLitters);
      return updatedLitters;
    }
  }

  /**
   * Delete a litter
   */
  async deleteLitter(litterId: string): Promise<Litter[]> {
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('litters')
        .delete()
        .eq('id', litterId);

      if (error) {
        console.error("Error deleting litter from Supabase:", error);
        throw error;
      }

      // Delete from localStorage as backup
      const litters = this.loadFromLocalStorage();
      const updatedLitters = litters.filter(litter => litter.id !== litterId);
      this.saveLitters(updatedLitters);

      return await this.loadLitters();
    } catch (error) {
      console.error("Error in deleteLitter:", error);
      // Fallback to localStorage
      const litters = this.loadFromLocalStorage();
      const updatedLitters = litters.filter(litter => litter.id !== litterId);
      this.saveLitters(updatedLitters);
      return updatedLitters;
    }
  }

  /**
   * Archive or unarchive a litter
   */
  async toggleArchiveLitter(litterId: string, archive: boolean): Promise<Litter[]> {
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('litters')
        .update({ archived: archive })
        .eq('id', litterId);

      if (error) {
        console.error("Error archiving litter in Supabase:", error);
        throw error;
      }

      // Update in localStorage as backup
      const litters = this.loadFromLocalStorage();
      const updatedLitters = litters.map(litter => {
        if (litter.id === litterId) {
          return {
            ...litter,
            archived: archive
          };
        }
        return litter;
      });
      this.saveLitters(updatedLitters);

      return await this.loadLitters();
    } catch (error) {
      console.error("Error in toggleArchiveLitter:", error);
      // Fallback to localStorage
      const litters = this.loadFromLocalStorage();
      const updatedLitters = litters.map(litter => {
        if (litter.id === litterId) {
          return {
            ...litter,
            archived: archive
          };
        }
        return litter;
      });
      this.saveLitters(updatedLitters);
      return updatedLitters;
    }
  }

  /**
   * Add a puppy to a litter
   */
  async addPuppy(litterId: string, puppy: Puppy): Promise<Litter[]> {
    try {
      // Initialize the notes array if it doesn't exist
      if (!puppy.notes) {
        puppy.notes = [];
      }
      
      // Ensure weight and height logs exist
      if (!puppy.weightLog) puppy.weightLog = [];
      if (!puppy.heightLog) puppy.heightLog = [];
      
      // Insert into Supabase
      const { data, error } = await supabase
        .from('puppies')
        .insert({
          id: puppy.id,
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
          birth_date_time: puppy.birthDateTime,
          litter_id: litterId
        })
        .select();

      if (error) {
        console.error("Error adding puppy to Supabase:", error);
        throw error;
      }

      // Update in localStorage as backup
      const litters = this.loadFromLocalStorage();
      const updatedLitters = litters.map(litter => {
        if (litter.id === litterId) {
          return {
            ...litter,
            puppies: [...litter.puppies, puppy]
          };
        }
        return litter;
      });
      this.saveLitters(updatedLitters);

      return await this.loadLitters();
    } catch (error) {
      console.error("Error in addPuppy:", error);
      // Fallback to localStorage
      const litters = this.loadFromLocalStorage();
      const updatedLitters = litters.map(litter => {
        if (litter.id === litterId) {
          return {
            ...litter,
            puppies: [...litter.puppies, puppy]
          };
        }
        return litter;
      });
      this.saveLitters(updatedLitters);
      return updatedLitters;
    }
  }

  /**
   * Update a puppy in a litter
   */
  async updatePuppy(litterId: string, updatedPuppy: Puppy): Promise<Litter[]> {
    try {
      // Ensure notes array exists
      if (!updatedPuppy.notes) {
        updatedPuppy.notes = [];
      }
      
      // Ensure weight and height logs exist
      if (!updatedPuppy.weightLog) updatedPuppy.weightLog = [];
      if (!updatedPuppy.heightLog) updatedPuppy.heightLog = [];
      
      // Update in Supabase
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
        console.error("Error updating puppy in Supabase:", error);
        throw error;
      }

      // Update in localStorage as backup
      const litters = this.loadFromLocalStorage();
      const updatedLitters = litters.map(litter => {
        if (litter.id === litterId) {
          const updatedPuppies = litter.puppies.map(puppy => 
            puppy.id === updatedPuppy.id ? updatedPuppy : puppy
          );
          return {
            ...litter,
            puppies: updatedPuppies
          };
        }
        return litter;
      });
      this.saveLitters(updatedLitters);

      return await this.loadLitters();
    } catch (error) {
      console.error("Error in updatePuppy:", error);
      // Fallback to localStorage
      const litters = this.loadFromLocalStorage();
      const updatedLitters = litters.map(litter => {
        if (litter.id === litterId) {
          const updatedPuppies = litter.puppies.map(puppy => 
            puppy.id === updatedPuppy.id ? updatedPuppy : puppy
          );
          return {
            ...litter,
            puppies: updatedPuppies
          };
        }
        return litter;
      });
      this.saveLitters(updatedLitters);
      return updatedLitters;
    }
  }

  /**
   * Delete a puppy from a litter
   */
  async deletePuppy(litterId: string, puppyId: string): Promise<Litter[]> {
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('puppies')
        .delete()
        .eq('id', puppyId)
        .eq('litter_id', litterId);

      if (error) {
        console.error("Error deleting puppy from Supabase:", error);
        throw error;
      }

      // Update in localStorage as backup
      const litters = this.loadFromLocalStorage();
      const updatedLitters = litters.map(litter => {
        if (litter.id === litterId) {
          return {
            ...litter,
            puppies: litter.puppies.filter(puppy => puppy.id !== puppyId)
          };
        }
        return litter;
      });
      this.saveLitters(updatedLitters);

      return await this.loadLitters();
    } catch (error) {
      console.error("Error in deletePuppy:", error);
      // Fallback to localStorage
      const litters = this.loadFromLocalStorage();
      const updatedLitters = litters.map(litter => {
        if (litter.id === litterId) {
          return {
            ...litter,
            puppies: litter.puppies.filter(puppy => puppy.id !== puppyId)
          };
        }
        return litter;
      });
      this.saveLitters(updatedLitters);
      return updatedLitters;
    }
  }

  /**
   * Get active (non-archived) litters
   */
  async getActiveLitters(): Promise<Litter[]> {
    const litters = await this.loadLitters();
    return litters.filter(litter => !litter.archived);
  }

  /**
   * Get archived litters
   */
  async getArchivedLitters(): Promise<Litter[]> {
    const litters = await this.loadLitters();
    return litters.filter(litter => litter.archived);
  }
}

// Export a singleton instance
export const litterService = new LitterService();
