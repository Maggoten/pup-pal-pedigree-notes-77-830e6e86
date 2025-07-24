import { supabase } from '@/integrations/supabase/client';
import { Litter, Puppy, PlannedLitter, PuppyNote } from '@/types/breeding';

export class LitterService {
  private transformLitterFromDB(dbLitter: any, puppies?: Puppy[]): Litter {
    // Puppies parameter can be either raw DB data or already transformed Puppy objects
    // Check if puppies are already transformed (have weightLog property) or need transformation
    const transformedPuppies = puppies ? 
      (puppies.length > 0 && 'weightLog' in puppies[0] ? 
        puppies as Puppy[] : 
        puppies.map(p => this.transformPuppyFromDB(p))
      ) : [];
    
    // Debug logging for transformed puppies
    console.log('transformLitterFromDB - Transformed puppies:', transformedPuppies.map(p => ({
      id: p.id,
      name: p.name,
      weightLogCount: p.weightLog?.length || 0,
      heightLogCount: p.heightLog?.length || 0,
      sampleWeightLog: p.weightLog?.slice(0, 2),
      sampleHeightLog: p.heightLog?.slice(0, 2)
    })));
    
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

  private transformPuppyFromDB(dbPuppy: any, weightLogs?: any[], heightLogs?: any[], notes?: PuppyNote[]): Puppy {
    const weightLogArray = weightLogs ? weightLogs.map(wl => ({
      date: wl.date,
      weight: parseFloat(wl.weight)
    })) : [];
    
    const heightLogArray = heightLogs ? heightLogs.map(hl => ({
      date: hl.date,
      height: parseFloat(hl.height)
    })) : [];
    
    // Use the notes parameter if provided, otherwise empty array
    const notesArray = notes || [];
    
    const transformedPuppy = {
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
      weightLog: weightLogArray,
      heightLog: heightLogArray,
      notes: notesArray
    };
    
    console.log(`transformPuppyFromDB - Puppy ${transformedPuppy.name}:`, {
      id: transformedPuppy.id,
      name: transformedPuppy.name,
      weightLogCount: transformedPuppy.weightLog.length,
      heightLogCount: transformedPuppy.heightLog.length,
      notesCount: transformedPuppy.notes.length,
      weightLogs: transformedPuppy.weightLog,
      heightLogs: transformedPuppy.heightLog,
      notes: transformedPuppy.notes,
      imageUrl: transformedPuppy.imageUrl
    });
    
    return transformedPuppy;
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

      console.log('Raw weight logs from database:', weightLogs);

      // Group logs by puppy_id
      const logsByPuppy = new Map<string, any[]>();
      weightLogs?.forEach(log => {
        const puppyId = log.puppy_id;
        if (!logsByPuppy.has(puppyId)) {
          logsByPuppy.set(puppyId, []);
        }
        logsByPuppy.get(puppyId)!.push(log);
      });

      console.log('Grouped weight logs by puppy:', Object.fromEntries(logsByPuppy));
      return logsByPuppy;
    } catch (error) {
      console.error('Error fetching puppy weight logs:', error);
      return new Map();
    }
  }

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

      console.log('Raw height logs from database:', heightLogs);

      // Group logs by puppy_id
      const logsByPuppy = new Map<string, any[]>();
      heightLogs?.forEach(log => {
        const puppyId = log.puppy_id;
        if (!logsByPuppy.has(puppyId)) {
          logsByPuppy.set(puppyId, []);
        }
        logsByPuppy.get(puppyId)!.push(log);
      });

      console.log('Grouped height logs by puppy:', Object.fromEntries(logsByPuppy));
      return logsByPuppy;
    } catch (error) {
      console.error('Error fetching puppy height logs:', error);
      return new Map();
    }
  }

  private async fetchPuppyNotes(puppyIds: string[]): Promise<Map<string, PuppyNote[]>> {
    if (puppyIds.length === 0) return new Map();
    
    try {
      const { data: notes, error } = await supabase
        .from('puppy_notes')
        .select('*')
        .in('puppy_id', puppyIds)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching puppy notes:', error);
        return new Map();
      }

      console.log('Raw notes from database:', notes);

      // Group notes by puppy_id
      const notesByPuppy = new Map<string, PuppyNote[]>();
      notes?.forEach(note => {
        const puppyId = note.puppy_id;
        if (!notesByPuppy.has(puppyId)) {
          notesByPuppy.set(puppyId, []);
        }
        notesByPuppy.get(puppyId)!.push({
          date: note.date,
          content: note.content
        });
      });

      console.log('Grouped notes by puppy:', Object.fromEntries(notesByPuppy));
      return notesByPuppy;
    } catch (error) {
      console.error('Error fetching puppy notes:', error);
      return new Map();
    }
  }

  private async savePuppyNotes(puppyId: string, notes: PuppyNote[]): Promise<boolean> {
    try {
      console.log(`Saving ${notes.length} notes for puppy ${puppyId}`);
      
      // First, delete all existing notes for this puppy
      const { error: deleteError } = await supabase
        .from('puppy_notes')
        .delete()
        .eq('puppy_id', puppyId);

      if (deleteError) {
        console.error('Error deleting existing notes:', deleteError);
        return false;
      }

      // Then insert all current notes
      if (notes.length > 0) {
        const notesToInsert = notes.map(note => ({
          puppy_id: puppyId,
          content: note.content,
          date: note.date
        }));

        const { error: insertError } = await supabase
          .from('puppy_notes')
          .insert(notesToInsert);

        if (insertError) {
          console.error('Error inserting notes:', insertError);
          return false;
        }
      }

      console.log(`Successfully saved ${notes.length} notes for puppy ${puppyId}`);
      return true;
    } catch (error) {
      console.error('Error saving puppy notes:', error);
      return false;
    }
  }

  // Delete individual puppy weight log
  async deletePuppyWeightLog(logId: string): Promise<boolean> {
    try {
      console.log('Deleting weight log:', logId);
      
      const { error } = await supabase
        .from('puppy_weight_logs')
        .delete()
        .eq('id', logId);

      if (error) {
        console.error('Error deleting weight log:', error);
        return false;
      }
      
      console.log('Weight log deleted successfully');
      return true;
    } catch (error) {
      console.error('Failed to delete weight log:', error);
      return false;
    }
  }

  // Delete individual puppy height log
  async deletePuppyHeightLog(logId: string): Promise<boolean> {
    try {
      console.log('Deleting height log:', logId);
      
      const { error } = await supabase
        .from('puppy_height_logs')
        .delete()
        .eq('id', logId);

      if (error) {
        console.error('Error deleting height log:', error);
        return false;
      }
      
      console.log('Height log deleted successfully');
      return true;
    } catch (error) {
      console.error('Failed to delete height log:', error);
      return false;
    }
  }

  // Delete individual puppy note
  async deletePuppyNote(noteId: string): Promise<boolean> {
    try {
      console.log('Deleting puppy note:', noteId);
      
      const { error } = await supabase
        .from('puppy_notes')
        .delete()
        .eq('id', noteId);

      if (error) {
        console.error('Error deleting puppy note:', error);
        return false;
      }
      
      console.log('Puppy note deleted successfully');
      return true;
    } catch (error) {
      console.error('Failed to delete puppy note:', error);
      return false;
    }
  }

  private async savePuppyWeightLogs(puppyId: string, weightLogs: any[]): Promise<boolean> {
    try {
      console.log(`Saving ${weightLogs.length} weight logs for puppy ${puppyId}`);
      
      // Phase 1: Validate input data
      if (!Array.isArray(weightLogs)) {
        console.error('Invalid weight logs data: not an array', weightLogs);
        throw new Error('Weight logs must be an array');
      }

      // Validate each log entry
      const validatedLogs = weightLogs.filter(log => {
        if (!log.date || !log.weight) {
          console.warn('Skipping invalid log entry:', log);
          return false;
        }
        
        const date = new Date(log.date);
        if (isNaN(date.getTime())) {
          console.warn('Skipping log with invalid date:', log);
          return false;
        }
        
        const weight = parseFloat(log.weight);
        if (isNaN(weight) || weight <= 0) {
          console.warn('Skipping log with invalid weight:', log);
          return false;
        }
        
        return true;
      });

      console.log(`Validated ${validatedLogs.length} out of ${weightLogs.length} weight logs`);
      
      // Deduplicate weight logs before saving
      const deduplicatedLogs = validatedLogs.filter((log, index, arr) => 
        arr.findIndex(l => l.date === log.date && l.weight === log.weight) === index
      );
      
      if (deduplicatedLogs.length !== validatedLogs.length) {
        console.log(`Removed ${validatedLogs.length - deduplicatedLogs.length} duplicate weight logs`);
      }

      // Phase 2: Use upsert pattern instead of delete-all-insert
      if (deduplicatedLogs.length > 0) {
        const logsToUpsert = deduplicatedLogs.map(log => {
          const date = new Date(log.date);
          console.log(`Processing weight log: date=${log.date}, parsed=${date.toISOString()}, weight=${log.weight}`);
          
          return {
            puppy_id: puppyId,
            weight: parseFloat(log.weight),
            date: date.toISOString()
          };
        });

        console.log(`Upserting ${logsToUpsert.length} weight logs:`, logsToUpsert);

        // Use upsert with conflict resolution
        const { error: upsertError, data } = await supabase
          .from('puppy_weight_logs')
          .upsert(logsToUpsert, { 
            onConflict: 'puppy_id,date,weight',
            ignoreDuplicates: true 
          })
          .select();

        if (upsertError) {
          console.error('Error upserting weight logs:', {
            error: upsertError,
            code: upsertError.code,
            message: upsertError.message,
            details: upsertError.details,
            hint: upsertError.hint,
            logsToUpsert
          });
          throw new Error(`Failed to save weight logs: ${upsertError.message}`);
        }

        console.log(`Successfully upserted ${data?.length || logsToUpsert.length} weight logs for puppy ${puppyId}`);
      }

      // Phase 3: Validate the save was successful
      const { data: savedLogs, error: validateError } = await supabase
        .from('puppy_weight_logs')
        .select('*')
        .eq('puppy_id', puppyId)
        .order('date', { ascending: false });

      if (validateError) {
        console.error('Error validating saved weight logs:', validateError);
        throw new Error(`Failed to validate saved weight logs: ${validateError.message}`);
      }

      console.log(`Validation: Found ${savedLogs?.length || 0} weight logs in database for puppy ${puppyId}`);
      
      if (deduplicatedLogs.length > 0 && (!savedLogs || savedLogs.length === 0)) {
        console.error('Data validation failed: No weight logs found after save operation');
        throw new Error('Weight logs were not saved correctly');
      }

      return true;
    } catch (error) {
      console.error('Error saving puppy weight logs:', {
        error,
        puppyId,
        weightLogsCount: weightLogs?.length,
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error; // Re-throw to let caller handle
    }
  }

  private async savePuppyHeightLogs(puppyId: string, heightLogs: any[]): Promise<boolean> {
    try {
      console.log(`Saving ${heightLogs.length} height logs for puppy ${puppyId}`);
      
      // Phase 1: Validate input data
      if (!Array.isArray(heightLogs)) {
        console.error('Invalid height logs data: not an array', heightLogs);
        throw new Error('Height logs must be an array');
      }

      // Validate each log entry
      const validatedLogs = heightLogs.filter(log => {
        if (!log.date || !log.height) {
          console.warn('Skipping invalid height log entry:', log);
          return false;
        }
        
        const date = new Date(log.date);
        if (isNaN(date.getTime())) {
          console.warn('Skipping height log with invalid date:', log);
          return false;
        }
        
        const height = parseFloat(log.height);
        if (isNaN(height) || height <= 0) {
          console.warn('Skipping height log with invalid height:', log);
          return false;
        }
        
        return true;
      });

      console.log(`Validated ${validatedLogs.length} out of ${heightLogs.length} height logs`);
      
      // Deduplicate height logs before saving
      const deduplicatedLogs = validatedLogs.filter((log, index, arr) => 
        arr.findIndex(l => l.date === log.date && l.height === log.height) === index
      );
      
      if (deduplicatedLogs.length !== validatedLogs.length) {
        console.log(`Removed ${validatedLogs.length - deduplicatedLogs.length} duplicate height logs`);
      }

      // Phase 2: Use upsert pattern instead of delete-all-insert
      if (deduplicatedLogs.length > 0) {
        const logsToUpsert = deduplicatedLogs.map(log => {
          const date = new Date(log.date);
          console.log(`Processing height log: date=${log.date}, parsed=${date.toISOString()}, height=${log.height}`);
          
          return {
            puppy_id: puppyId,
            height: parseFloat(log.height),
            date: date.toISOString()
          };
        });

        console.log(`Upserting ${logsToUpsert.length} height logs:`, logsToUpsert);

        // Use upsert with conflict resolution
        const { error: upsertError, data } = await supabase
          .from('puppy_height_logs')
          .upsert(logsToUpsert, { 
            onConflict: 'puppy_id,date,height',
            ignoreDuplicates: true 
          })
          .select();

        if (upsertError) {
          console.error('Error upserting height logs:', {
            error: upsertError,
            code: upsertError.code,
            message: upsertError.message,
            details: upsertError.details,
            hint: upsertError.hint,
            logsToUpsert
          });
          throw new Error(`Failed to save height logs: ${upsertError.message}`);
        }

        console.log(`Successfully upserted ${data?.length || logsToUpsert.length} height logs for puppy ${puppyId}`);
      }

      // Phase 3: Validate the save was successful
      const { data: savedLogs, error: validateError } = await supabase
        .from('puppy_height_logs')
        .select('*')
        .eq('puppy_id', puppyId)
        .order('date', { ascending: false });

      if (validateError) {
        console.error('Error validating saved height logs:', validateError);
        throw new Error(`Failed to validate saved height logs: ${validateError.message}`);
      }

      console.log(`Validation: Found ${savedLogs?.length || 0} height logs in database for puppy ${puppyId}`);
      
      if (deduplicatedLogs.length > 0 && (!savedLogs || savedLogs.length === 0)) {
        console.error('Data validation failed: No height logs found after save operation');
        throw new Error('Height logs were not saved correctly');
      }

      return true;
    } catch (error) {
      console.error('Error saving puppy height logs:', {
        error,
        puppyId,
        heightLogsCount: heightLogs?.length,
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error; // Re-throw to let caller handle
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
      console.log('Raw puppies data:', puppiesData);
      
      // If no puppies, return early
      if (!puppiesData || puppiesData.length === 0) {
        console.log('No puppies found for this litter');
        return this.transformLitterFromDB(litterData, []);
      }

      // Extract puppy IDs for batch fetching logs and notes
      const puppyIds = puppiesData.map(p => p.id);
      console.log(`Fetching weight logs, height logs, and notes for ${puppyIds.length} puppies:`, puppyIds);

      // Fetch weight logs, height logs, and notes for all puppies
      const [weightLogsByPuppy, heightLogsByPuppy, notesByPuppy] = await Promise.all([
        this.fetchPuppyWeightLogs(puppyIds),
        this.fetchPuppyHeightLogs(puppyIds),
        this.fetchPuppyNotes(puppyIds)
      ]);

      console.log(`Fetched weight logs for ${weightLogsByPuppy.size} puppies`);
      console.log(`Fetched height logs for ${heightLogsByPuppy.size} puppies`);
      console.log(`Fetched notes for ${notesByPuppy.size} puppies`);

      // Transform puppies with their logs and notes
      const transformedPuppies = puppiesData.map(puppy => {
        const weightLogs = weightLogsByPuppy.get(puppy.id) || [];
        const heightLogs = heightLogsByPuppy.get(puppy.id) || [];
        const notes = notesByPuppy.get(puppy.id) || [];
        
        console.log(`Puppy ${puppy.name}: ${weightLogs.length} weight logs, ${heightLogs.length} height logs, ${notes.length} notes`);
        console.log(`Weight logs for ${puppy.name}:`, weightLogs);
        console.log(`Height logs for ${puppy.name}:`, heightLogs);
        console.log(`Notes for ${puppy.name}:`, notes);
        
        return this.transformPuppyFromDB(puppy, weightLogs, heightLogs, notes);
      });

      console.log('Puppies transformed with logs and notes:', transformedPuppies.map(p => ({ 
        id: p.id, 
        name: p.name,
        weightLogCount: p.weightLog.length,
        heightLogCount: p.heightLog.length,
        notesCount: p.notes.length,
        weightLogs: p.weightLog,
        heightLogs: p.heightLog,
        notes: p.notes
      })));

      const finalLitter = this.transformLitterFromDB(litterData, transformedPuppies);
      console.log('Final litter object:', {
        id: finalLitter.id,
        name: finalLitter.name,
        puppiesCount: finalLitter.puppies.length,
        puppies: finalLitter.puppies.map(p => ({
          id: p.id,
          name: p.name,
          weightLogCount: p.weightLog?.length || 0,
          heightLogCount: p.heightLog?.length || 0,
          notesCount: p.notes?.length || 0
        }))
      });

      return finalLitter;
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
      console.log(`Updating puppy ${puppy.id} with ${puppy.notes?.length || 0} notes, ${puppy.weightLog?.length || 0} weight logs, and ${puppy.heightLog?.length || 0} height logs`);
      
      // Update basic puppy information in the puppies table
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

      // Save notes to the puppy_notes table
      if (puppy.notes) {
        const notesSuccess = await this.savePuppyNotes(puppy.id, puppy.notes);
        if (!notesSuccess) {
          console.error('Failed to save puppy notes, but basic puppy info was updated');
        }
      }

      // Save weight logs to the puppy_weight_logs table with enhanced error handling
      if (puppy.weightLog) {
        try {
          await this.savePuppyWeightLogs(puppy.id, puppy.weightLog);
          console.log('Successfully saved puppy weight logs');
        } catch (error) {
          console.error('Failed to save puppy weight logs:', error);
          throw new Error(`Failed to save weight logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Save height logs to the puppy_height_logs table with enhanced error handling
      if (puppy.heightLog) {
        try {
          await this.savePuppyHeightLogs(puppy.id, puppy.heightLog);
          console.log('Successfully saved puppy height logs');
        } catch (error) {
          console.error('Failed to save puppy height logs:', error);
          throw new Error(`Failed to save height logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      console.log(`Successfully updated puppy ${puppy.id} with all logs and notes`);
      return data ? this.transformPuppyFromDB(data, puppy.weightLog, puppy.heightLog, puppy.notes) : null;
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
