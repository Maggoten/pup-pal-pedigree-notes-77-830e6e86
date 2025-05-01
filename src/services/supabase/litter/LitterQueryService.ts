
import { supabase } from '@/integrations/supabase/client';
import { Litter, Puppy, PuppyWeightRecord, PuppyHeightRecord, PuppyNote } from '@/types/breeding';
import { toast } from '@/components/ui/use-toast';
import { BaseSupabaseService } from '../base/BaseSupabaseService';

/**
 * Service responsible for querying litter data from Supabase
 */
export class LitterQueryService extends BaseSupabaseService {
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
        this.handleError(error, 'loading litters');
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
      this.handleError(error, 'loadLitters');
      return [];
    }
  }

  /**
   * Fetch all puppies for a specific litter
   */
  async fetchPuppiesForLitter(litterId: string): Promise<Puppy[]> {
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
  async fetchWeightLogs(puppyId: string): Promise<PuppyWeightRecord[]> {
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
  async fetchHeightLogs(puppyId: string): Promise<PuppyHeightRecord[]> {
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
  async fetchPuppyNotes(puppyId: string): Promise<PuppyNote[]> {
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
}
