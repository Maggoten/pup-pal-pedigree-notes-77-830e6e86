import { supabase } from '@/integrations/supabase/client';
import { Litter, Puppy, PlannedLitter } from '@/types/breeding';

export class LitterService {
  private transformLitterFromDB(dbLitter: any, puppies?: Puppy[]): Litter {
    // Puppies parameter can be either raw DB data or already transformed Puppy objects
    // Check if puppies are already transformed (have weightLog property) or need transformation
    const transformedPuppies = puppies ? 
      (puppies.length > 0 && 'weightLog' in puppies[0] ? 
        puppies as Puppy[] : 
        puppies.map(p => this.transformPuppyFromDB(p))
      ) : [];
    
    return {
      id: dbLitter.id,
      name: dbLitter.name,
      dateOfBirth: dbLitter.date_of_birth,
      sireId: dbLitter.sire_id,
      damId: dbLitter.dam_id,
      sireName: dbLitter.sire_name,
      damName: dbLitter.dam_name,
      puppies: transformedPuppies,
      archived: dbLitter.archived,
      user_id: dbLitter.user_id
    };
  }

  private transformLitterToDB(litter: Litter | Omit<Litter, 'id'>): any {
    return {
      id: 'id' in litter ? litter.id : undefined,
      name: litter.name,
      date_of_birth: litter.dateOfBirth,
      sire_id: litter.sireId,
      dam_id: litter.damId,
      sire_name: litter.sireName,
      dam_name: litter.damName,
      archived: litter.archived,
      user_id: litter.user_id
    };
  }

  private transformPuppyFromDB(dbPuppy: any, weightLogs?: any[], heightLogs?: any[]): Puppy {
    return {
      id: dbPuppy.id,
      name: dbPuppy.name,
      gender: dbPuppy.gender,
      color: dbPuppy.color,
      markings: dbPuppy.markings,
      birthWeight: dbPuppy.birth_weight,
      currentWeight: dbPuppy.current_weight,
      sold: dbPuppy.sold,
      reserved: dbPuppy.reserved,
      newOwner: dbPuppy.new_owner,
      collar: dbPuppy.collar,
      microchip: dbPuppy.microchip,
      breed: dbPuppy.breed,
      imageUrl: dbPuppy.image_url,
      birthDateTime: dbPuppy.birth_date_time,
      registered_name: dbPuppy.registered_name,
      registration_number: dbPuppy.registration_number,
      status: dbPuppy.status,
      buyer_name: dbPuppy.buyer_name,
      buyer_phone: dbPuppy.buyer_phone,
      weightLog: weightLogs ? weightLogs.map(wl => ({
        date: wl.date,
        weight: parseFloat(wl.weight)
      })) : [],
      heightLog: heightLogs ? heightLogs.map(hl => ({
        date: hl.date,
        height: parseFloat(hl.height)
      })) : []
    };
  }

  private transformPuppyToDB(puppy: Puppy | Omit<Puppy, 'id'>): any {
    return {
      id: 'id' in puppy ? puppy.id : undefined,
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
      registered_name: puppy.registered_name,
      registration_number: puppy.registration_number,
      status: puppy.status,
      buyer_name: puppy.buyer_name,
      buyer_phone: puppy.buyer_phone
    };
  }

  // Helper method to fetch weight logs for specific puppies
  private async fetchPuppyWeightLogs(puppyIds: string[]): Promise<Map<string, any[]>> {
    if (puppyIds.length === 0) return new Map();
    
    try {
      const { data: weightLogs, error } = await supabase
        .from('puppy_weight_logs')
        .select('*')
        .in('puppy_id', puppyIds)
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching puppy weight logs:', error);
        return new Map();
      }

      // Group logs by puppy_id
      const logsByPuppy = new Map<string, any[]>();
      weightLogs?.forEach(log => {
        const puppyId = log.puppy_id;
        if (!logsByPuppy.has(puppyId)) {
          logsByPuppy.set(puppyId, []);
        }
        logsByPuppy.get(puppyId)!.push(log);
      });

      return logsByPuppy;
    } catch (error) {
      console.error('Error fetching puppy weight logs:', error);
      return new Map();
    }
  }

  // Helper method to fetch height logs for specific puppies
  private async fetchPuppyHeightLogs(puppyIds: string[]): Promise<Map<string, any[]>> {
    if (puppyIds.length === 0) return new Map();
    
    try {
      const { data: heightLogs, error } = await supabase
        .from('puppy_height_logs')
        .select('*')
        .in('puppy_id', puppyIds)
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching puppy height logs:', error);
        return new Map();
      }

      // Group logs by puppy_id
      const logsByPuppy = new Map<string, any[]>();
      heightLogs?.forEach(log => {
        const puppyId = log.puppy_id;
        if (!logsByPuppy.has(puppyId)) {
          logsByPuppy.set(puppyId, []);
        }
        logsByPuppy.get(puppyId)!.push(log);
      });

      return logsByPuppy;
    } catch (error) {
      console.error('Error fetching puppy height logs:', error);
      return new Map();
    }
  }

  private transformPlannedLitterFromDB(dbLitter: any): PlannedLitter {
    return {
      id: dbLitter.id,
      maleId: dbLitter.male_id,
      femaleId: dbLitter.female_id,
      maleName: dbLitter.male_name,
      femaleName: dbLitter.female_name,
      expectedHeatDate: dbLitter.expected_heat_date,
      notes: dbLitter.notes,
      externalMale: dbLitter.external_male,
      externalMaleBreed: dbLitter.external_male_breed,
      externalMaleRegistration: dbLitter.external_male_registration
    };
  }

  private transformPlannedLitterToDB(litter: PlannedLitter | Omit<PlannedLitter, 'id'>): any {
    return {
      id: 'id' in litter ? litter.id : undefined,
      male_id: litter.maleId,
      female_id: litter.femaleId,
      male_name: litter.maleName,
      female_name: litter.femaleName,
      expected_heat_date: litter.expectedHeatDate,
      notes: litter.notes,
      external_male: litter.externalMale,
      external_male_breed: litter.externalMaleBreed,
      external_male_registration: litter.externalMaleRegistration
    };
  }

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

      return (data || []).map(item => this.transformLitterFromDB(item));
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

      return data ? this.transformLitterFromDB(data) : null;
    } catch (error) {
      console.error('Error fetching litter by ID:', error);
      return null;
    }
  }

  async getLitterDetails(litterId: string): Promise<Litter | null> {
    try {
      console.log(`Fetching detailed litter data for: ${litterId}`);
      
      // Fetch litter data
      const { data: litterData, error: litterError } = await supabase
        .from('litters')
        .select('*')
        .eq('id', litterId)
        .single();

      if (litterError) {
        console.error('Error fetching litter details:', litterError);
        return null;
      }

      if (!litterData) {
        console.log(`No litter found with ID: ${litterId}`);
        return null;
      }

      console.log(`Found litter: ${litterData.name}`);

      // Fetch associated puppies
      const { data: puppiesData, error: puppiesError } = await supabase
        .from('puppies')
        .select('*')
        .eq('litter_id', litterId);

      if (puppiesError) {
        console.error('Error fetching puppies for litter:', puppiesError);
        // Return litter without puppies rather than failing completely
        return this.transformLitterFromDB(litterData, []);
      }

      console.log(`Found ${puppiesData?.length || 0} puppies for litter ${litterData.name}`);
      
      // If no puppies, return early
      if (!puppiesData || puppiesData.length === 0) {
        console.log('No puppies found for this litter');
        return this.transformLitterFromDB(litterData, []);
      }

      // Extract puppy IDs for batch fetching logs
      const puppyIds = puppiesData.map(p => p.id);
      console.log(`Fetching weight and height logs for ${puppyIds.length} puppies`);

      // Fetch weight and height logs for all puppies
      const [weightLogsByPuppy, heightLogsByPuppy] = await Promise.all([
        this.fetchPuppyWeightLogs(puppyIds),
        this.fetchPuppyHeightLogs(puppyIds)
      ]);

      console.log(`Fetched weight logs for ${weightLogsByPuppy.size} puppies`);
      console.log(`Fetched height logs for ${heightLogsByPuppy.size} puppies`);

      // Transform puppies with their logs
      const transformedPuppies = puppiesData.map(puppy => {
        const weightLogs = weightLogsByPuppy.get(puppy.id) || [];
        const heightLogs = heightLogsByPuppy.get(puppy.id) || [];
        
        console.log(`Puppy ${puppy.name}: ${weightLogs.length} weight logs, ${heightLogs.length} height logs`);
        
        return this.transformPuppyFromDB(puppy, weightLogs, heightLogs);
      });

      console.log('Puppies transformed with logs:', transformedPuppies.map(p => ({ 
        id: p.id, 
        name: p.name,
        weightLogCount: p.weightLog.length,
        heightLogCount: p.heightLog.length
      })));

      return this.transformLitterFromDB(litterData, transformedPuppies);
    } catch (error) {
      console.error('Error fetching litter details:', error);
      return null;
    }
  }

  async addLitter(litter: Omit<Litter, 'id'>): Promise<Litter | null> {
    try {
      const dbLitter = this.transformLitterToDB(litter);
      const { data, error } = await supabase
        .from('litters')
        .insert([dbLitter])
        .select()
        .single();

      if (error) {
        console.error('Error adding litter:', error);
        return null;
      }

      return data ? this.transformLitterFromDB(data) : null;
    } catch (error) {
      console.error('Error adding litter:', error);
      return null;
    }
  }

  async updateLitter(litter: Litter): Promise<Litter | null> {
    try {
      const dbLitter = this.transformLitterToDB(litter);
      const { data, error } = await supabase
        .from('litters')
        .update(dbLitter)
        .eq('id', litter.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating litter:', error);
        return null;
      }

      return data ? this.transformLitterFromDB(data) : null;
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
      const dbPuppy = { ...this.transformPuppyToDB(puppy), litter_id: litterId };
      const { data, error } = await supabase
        .from('puppies')
        .insert([dbPuppy])
        .select()
        .single();

      if (error) {
        console.error('Error adding puppy:', error);
        return null;
      }

      return data ? this.transformPuppyFromDB(data) : null;
    } catch (error) {
      console.error('Error adding puppy:', error);
      return null;
    }
  }

  async updatePuppy(litterId: string, puppy: Puppy): Promise<Puppy | null> {
     try {
      const dbPuppy = { ...this.transformPuppyToDB(puppy), litter_id: litterId };
      const { data, error } = await supabase
        .from('puppies')
        .update(dbPuppy)
        .eq('id', puppy.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating puppy:', error);
        return null;
      }

      return data ? this.transformPuppyFromDB(data) : null;
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

      return (data || []).map(item => this.transformPlannedLitterFromDB(item));
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

      return data ? this.transformPlannedLitterFromDB(data) : null;
    } catch (error) {
      console.error('Error fetching planned litter by ID:', error);
      return null;
    }
  }

  async addPlannedLitter(plannedLitter: Omit<PlannedLitter, 'id'>): Promise<PlannedLitter | null> {
    try {
      const dbLitter = this.transformPlannedLitterToDB(plannedLitter);
      const { data, error } = await supabase
        .from('planned_litters')
        .insert([dbLitter])
        .select()
        .single();

      if (error) {
        console.error('Error adding planned litter:', error);
        return null;
      }

      return data ? this.transformPlannedLitterFromDB(data) : null;
    } catch (error) {
      console.error('Error adding planned litter:', error);
      return null;
    }
  }

  async updatePlannedLitter(plannedLitter: PlannedLitter): Promise<PlannedLitter | null> {
    try {
      const dbLitter = this.transformPlannedLitterToDB(plannedLitter);
      const { data, error } = await supabase
        .from('planned_litters')
        .update(dbLitter)
        .eq('id', plannedLitter.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating planned litter:', error);
        return null;
      }

      return data ? this.transformPlannedLitterFromDB(data) : null;
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

  // Convenience methods with proper naming for backwards compatibility
  async getActiveLitters(userId?: string): Promise<Litter[]> {
    if (!userId) return [];
    const allLitters = await this.getAllLitters(userId);
    return allLitters.filter(litter => !litter.archived);
  }

  async getArchivedLitters(userId?: string): Promise<Litter[]> {
    if (!userId) return [];
    const allLitters = await this.getAllLitters(userId);
    return allLitters.filter(litter => litter.archived);
  }

  async toggleArchiveLitter(litterId: string, archive: boolean): Promise<void> {
    await this.archiveLitter(litterId, archive);
  }

  // Additional methods for backwards compatibility
  async getDogLitters(dogId: string): Promise<Litter[]> {
    return [];
  }

  async loadLitters(userId: string): Promise<Litter[]> {
    return this.getAllLitters(userId);
  }
}

// Export a singleton instance for use across the app
export const litterService = new LitterService();
