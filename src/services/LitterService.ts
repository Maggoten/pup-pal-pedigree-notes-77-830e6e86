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
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Session error:", sessionError);
        throw sessionError;
      }
      
      if (!sessionData.session) {
        console.error("No active session found");
        throw new Error("No active session found");
      }

      console.log("Loading litters for user:", sessionData.session.user.id);

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
        throw error;
      }

      console.log("Litters loaded from Supabase:", litters);

      if (!litters || litters.length === 0) {
        console.log("No litters found for user");
        return [];
      }

      // Now fetch weight and height logs for each puppy
      const littersWithDetailedPuppies = await Promise.all((litters || []).map(async litter => {
        const puppiesWithDetails = await Promise.all((litter.puppies || []).map(async puppy => {
          console.log("Processing puppy:", puppy.id, puppy.name);
          
          // Fetch weight logs
          const { data: weightLogs, error: weightError } = await supabase
            .from('puppy_weight_logs')
            .select('*')
            .eq('puppy_id', puppy.id);
          
          if (weightError) console.error("Error loading weight logs:", weightError);
          else console.log(`Found ${weightLogs?.length || 0} weight logs for puppy ${puppy.id}`);
          
          // Fetch height logs
          const { data: heightLogs, error: heightError } = await supabase
            .from('puppy_height_logs')
            .select('*')
            .eq('puppy_id', puppy.id);
          
          if (heightError) console.error("Error loading height logs:", heightError);
          else console.log(`Found ${heightLogs?.length || 0} height logs for puppy ${puppy.id}`);
          
          // Fetch notes
          const { data: notes, error: notesError } = await supabase
            .from('puppy_notes')
            .select('*')
            .eq('puppy_id', puppy.id);
          
          if (notesError) console.error("Error loading puppy notes:", notesError);

          // Ensure gender is one of the allowed values for our type
          const puppyGender = (puppy.gender === 'male' || puppy.gender === 'female') 
            ? puppy.gender as 'male' | 'female' 
            : 'male'; // Default to male if invalid value

          return {
            id: puppy.id,
            name: puppy.name,
            gender: puppyGender,
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
            notes: notes || [],
            weightLog: weightLogs ? weightLogs.map(log => ({
              date: log.date,
              weight: log.weight
            })) : [],
            heightLog: heightLogs ? heightLogs.map(log => ({
              date: log.date,
              height: log.height
            })) : []
          };
        }));

        return {
          id: litter.id,
          name: litter.name,
          dateOfBirth: litter.date_of_birth,
          sireId: litter.sire_id || '',
          damId: litter.dam_id || '',
          sireName: litter.sire_name || '',
          damName: litter.dam_name || '',
          puppies: puppiesWithDetails,  // FIX 1: Changed from puppiesWithDetailedPuppies to puppiesWithDetails
          archived: litter.archived || false,
          user_id: litter.user_id
        };
      }));

      console.log("Returning processed litters:", littersWithDetailedPuppies);
      return littersWithDetailedPuppies;
    } catch (error) {
      console.error("Error in loadLitters:", error);
      throw error;
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
      console.log("Starting addLitter with:", litter);
      
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Session error:", sessionError);
        throw sessionError;
      }
      
      if (!sessionData.session) {
        console.error("No active session found when adding litter");
        throw new Error("No active session");
      }

      console.log("Adding new litter for user:", sessionData.session.user.id);
      console.log("Litter details:", JSON.stringify(litter, null, 2));

      // Check if the litter ID is valid UUID format (required by Supabase)
      // If not, generate a UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const litterId = uuidRegex.test(litter.id) ? litter.id : crypto.randomUUID();
      console.log("Original ID:", litter.id, "Using ID:", litterId);

      // Ensure the archived property is set (default to false)
      if (litter.archived === undefined) {
        litter.archived = false;
      }
      
      // Initialize puppies array if it doesn't exist
      if (!litter.puppies) {
        litter.puppies = [];
      }

      // Ensure sireName is not undefined
      const sireName = litter.sireName || '';
      
      // Ensure user_id is set to the current user's ID
      litter.user_id = sessionData.session.user.id;
      
      // Validate the date format
      let dateOfBirth;
      try {
        // Ensure we handle dateOfBirth correctly based on its type
        if (typeof litter.dateOfBirth === 'string') {
          // If it's a string, ensure it's a valid date string
          const tempDate = new Date(litter.dateOfBirth);
          if (isNaN(tempDate.getTime())) {
            throw new Error("Invalid date string");
          }
          dateOfBirth = litter.dateOfBirth;
        } else if (litter.dateOfBirth && typeof litter.dateOfBirth === 'object') {
          // Check if it's a Date object
          const tempDate = new Date(litter.dateOfBirth as any);
          if (isNaN(tempDate.getTime())) {
            throw new Error("Invalid date object");
          }
          dateOfBirth = tempDate.toISOString();
        } else {
          throw new Error("Invalid date format");
        }
      } catch (error) {
        console.error("Date parsing error:", error);
        throw new Error(`Invalid date of birth: ${error}`);
      }
      
      console.log("Date for insert:", dateOfBirth);
      console.log("Full litter data being sent to Supabase:", {
        id: litterId,
        name: litter.name,
        date_of_birth: dateOfBirth,
        sire_id: litter.sireId,
        dam_id: litter.damId,
        sire_name: sireName,
        dam_name: litter.damName,
        archived: litter.archived,
        user_id: litter.user_id
      });
      
      // Attempt to directly query the table to troubleshoot
      console.log("Checking existing litters before insert...");
      const { data: existingLitters, error: queryError } = await supabase
        .from('litters')
        .select('id, name, user_id')
        .limit(5);
        
      if (queryError) {
        console.error("Error querying litters:", queryError);
      } else {
        console.log("Sample of existing litters:", existingLitters);
      }

      // Insert into Supabase
      const { data: newLitter, error } = await supabase
        .from('litters')
        .insert({
          id: litterId,
          name: litter.name,
          date_of_birth: dateOfBirth,
          sire_id: litter.sireId,
          dam_id: litter.damId,
          sire_name: sireName,
          dam_name: litter.damName,
          archived: litter.archived,
          user_id: litter.user_id
        })
        .select();

      if (error) {
        console.error("Error adding litter to Supabase:", error);
        throw new Error(`Failed to add litter: ${error.message || error.toString()}`);
      }

      console.log("Litter added to Supabase:", newLitter);

      // Check if the litter was actually inserted
      const { data: verifyLitter, error: verifyError } = await supabase
        .from('litters')
        .select('*')
        .eq('id', litterId)
        .single();
        
      if (verifyError) {
        console.error("Error verifying litter insertion:", verifyError);
      } else {
        console.log("Verified litter was inserted:", verifyLitter);
      }

      // Add to localStorage as backup
      const litters = this.loadFromLocalStorage();
      const updatedLitters = [...litters, {...litter, id: litterId}];
      this.saveLitters(updatedLitters);

      // Fetch all litters to ensure we have the latest data
      return await this.loadLitters();
    } catch (error) {
      console.error("Error in addLitter:", error);
      throw error;
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
      console.log("Adding puppy to litter:", litterId, puppy);
      
      // Initialize the notes array if it doesn't exist
      if (!puppy.notes) {
        puppy.notes = [];
      }
      
      // Ensure weight and height logs exist
      if (!puppy.weightLog) puppy.weightLog = [];
      if (!puppy.heightLog) puppy.heightLog = [];
      
      // Ensure the gender is one of the allowed values
      const puppyGender = (puppy.gender === 'male' || puppy.gender === 'female') 
        ? puppy.gender 
        : 'male'; // Default to male if invalid value
      
      console.log("About to insert puppy into Supabase:", {
        id: puppy.id,
        name: puppy.name,
        gender: puppyGender,
        color: puppy.color,
        litter_id: litterId,
        birth_date_time: puppy.birthDateTime
      });

      // Insert puppy into Supabase
      const { data, error } = await supabase
        .from('puppies')
        .insert({
          id: puppy.id,
          name: puppy.name,
          gender: puppyGender,
          color: puppy.color || '',
          markings: puppy.markings,
          birth_weight: puppy.birthWeight || 0,
          current_weight: puppy.currentWeight,
          sold: puppy.sold || false,
          reserved: puppy.reserved || false,
          new_owner: puppy.newOwner,
          collar: puppy.collar,
          microchip: puppy.microchip,
          breed: puppy.breed || '',
          image_url: puppy.imageUrl || '',
          birth_date_time: puppy.birthDateTime || new Date().toISOString(),
          litter_id: litterId
        })
        .select();

      if (error) {
        console.error("Error adding puppy to Supabase:", error);
        throw error;
      }

      console.log("Successfully added puppy to database:", data);

      // Add initial weight log if birthWeight exists
      if (puppy.birthWeight && puppy.birthWeight > 0 && puppy.birthDateTime) {
        const birthDate = new Date(puppy.birthDateTime).toISOString().split('T')[0];
        
        console.log("Adding weight log with data:", {
          puppy_id: puppy.id,
          date: birthDate,
          weight: puppy.birthWeight
        });
        
        const { data: weightData, error: weightError } = await supabase
          .from('puppy_weight_logs')
          .insert({
            puppy_id: puppy.id,
            date: birthDate,
            weight: puppy.birthWeight
          })
          .select();
        
        if (weightError) {
          console.error("Error adding initial weight log:", weightError);
        } else {
          console.log("Added initial weight log for puppy:", weightData);
        }
      } else {
        console.log("No birth weight or birth date time provided, skipping weight log");
      }

      // Immediately reload litters to ensure we have the latest data
      console.log("Reloading litters after adding puppy");
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
      console.log("Updating puppy with ID:", updatedPuppy.id, "Name:", updatedPuppy.name);
      console.log("Current weight log:", JSON.stringify(updatedPuppy.weightLog, null, 2));
      
      // Ensure notes array exists
      if (!updatedPuppy.notes) {
        updatedPuppy.notes = [];
      }
      
      // Ensure weight and height logs exist
      if (!updatedPuppy.weightLog) updatedPuppy.weightLog = [];
      if (!updatedPuppy.heightLog) updatedPuppy.heightLog = [];
      
      // Ensure the gender is one of the allowed values
      const puppyGender = (updatedPuppy.gender === 'male' || updatedPuppy.gender === 'female') 
        ? updatedPuppy.gender 
        : 'male'; // Default to male if invalid value
      
      // Update birth weight to current birth weight (fix for issue #1)
      let currentBirthWeight = updatedPuppy.birthWeight;
      
      // Update puppy in Supabase
      const { error } = await supabase
        .from('puppies')
        .update({
          name: updatedPuppy.name,
          gender: puppyGender,
          color: updatedPuppy.color,
          markings: updatedPuppy.markings,
          birth_weight: currentBirthWeight, // Use the current birth weight
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
      
      console.log("Successfully updated puppy in Supabase");

      // First, synchronize the birth weight record if it exists
      const birthDate = updatedPuppy.birthDateTime ? 
        new Date(updatedPuppy.birthDateTime).toISOString().split('T')[0] : 
        null;
        
      if (birthDate && currentBirthWeight) {
        console.log("Synchronizing birth weight record");
        
        // Check if a birth weight entry already exists
        const { data: existingBirthWeightLog } = await supabase
          .from('puppy_weight_logs')
          .select('*')
          .eq('puppy_id', updatedPuppy.id)
          .eq('date', birthDate)
          .maybeSingle();
          
        if (existingBirthWeightLog) {
          // Update existing birth weight log if it exists
          console.log("Updating existing birth weight log:", existingBirthWeightLog.id);
          await supabase
            .from('puppy_weight_logs')
            .update({ weight: currentBirthWeight })
            .eq('id', existingBirthWeightLog.id);
        } else {
          // Create a new birth weight log if it doesn't exist
          console.log("Creating new birth weight log entry");
          await supabase
            .from('puppy_weight_logs')
            .insert({
              puppy_id: updatedPuppy.id,
              date: birthDate,
              weight: currentBirthWeight
            });
        }
      }

      // Handle all other weight logs
      console.log("Processing weight logs:", updatedPuppy.weightLog.length);
      for (const weightLog of updatedPuppy.weightLog) {
        // Format the date for comparison (strip time component)
        const logDate = new Date(weightLog.date).toISOString().split('T')[0];
        
        // Skip if this is the birth date (already handled above)
        if (birthDate && logDate === birthDate) {
          console.log("Skipping birth date weight log as it's already handled");
          continue;
        }
        
        console.log("Processing weight log for date:", logDate);
        
        // Check if this log already exists
        const { data: existingLog } = await supabase
          .from('puppy_weight_logs')
          .select('*')
          .eq('puppy_id', updatedPuppy.id)
          .eq('date', logDate)
          .maybeSingle();
          
        if (existingLog) {
          // Update existing log
          console.log("Updating existing weight log:", existingLog.id);
          await supabase
            .from('puppy_weight_logs')
            .update({ weight: weightLog.weight })
            .eq('id', existingLog.id);
        } else {
          // Insert new log
          console.log("Inserting new weight log");
          await supabase
            .from('puppy_weight_logs')
            .insert({
              puppy_id: updatedPuppy.id,
              date: logDate,
              weight: weightLog.weight
            });
        }
      }

      // Handle height logs
      console.log("Processing height logs");
      for (const heightLog of updatedPuppy.heightLog) {
        // Format the date for comparison (strip time component)
        const logDate = new Date(heightLog.date).toISOString().split('T')[0];
        
        // Check if this log already exists
        const { data: existingLog } = await supabase
          .from('puppy_height_logs')
          .select('*')
          .eq('puppy_id', updatedPuppy.id)
          .eq('date', logDate)
          .maybeSingle();
          
        if (existingLog) {
          // Update existing log
          await supabase
            .from('puppy_height_logs')
            .update({ height: heightLog.height })
            .eq('id', existingLog.id);
        } else {
          // Insert new log
          await supabase
            .from('puppy_height_logs')
            .insert({
              puppy_id: updatedPuppy.id,
              date: logDate,
              height: heightLog.height
            });
        }
      }

      console.log("Finished updating all logs, reloading litters");
      // Immediately reload data to ensure we have the latest
      return await this.loadLitters();
    } catch (error) {
      console.error("Error in updatePuppy:", error);
      throw error;
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
    try {
      const litters = await this.loadLitters();
      console.log("Get active litters - all litters:", litters);
      const activeLitters = litters.filter(litter => !litter.archived);
      console.log("Active litters:", activeLitters);
      return activeLitters;
    } catch (error) {
      console.error("Error getting active litters:", error);
      throw error;
    }
  }

  /**
   * Get archived litters
   */
  async getArchivedLitters(): Promise<Litter[]> {
    try {
      const litters = await this.loadLitters();
      const archivedLitters = litters.filter(litter => litter.archived);
      console.log("Archived litters:", archivedLitters);
      return archivedLitters;
    } catch (error) {
      console.error("Error getting archived litters:", error);
      throw error;
    }
  }
}

// Export a singleton instance
export const litterService = new LitterService();
