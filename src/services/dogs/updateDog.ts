import { supabase } from '@/integrations/supabase/client';
import { Dog } from '@/types/dogs';
import { enrichDog, sanitizeDogForDb, DbDog } from '@/utils/dogUtils';
import { PostgrestResponse } from '@supabase/supabase-js';
import { withTimeout, TIMEOUT, isTimeoutError } from '@/utils/timeoutUtils';
import { cleanupStorageImage } from '@/utils/storage';
import { dateToISOString } from '@/utils/dateUtils';
import { syncBirthdayEvents, syncVaccinationEvents, syncHeatCycleEvents } from '@/services/ReminderCalendarSyncService';
import { isValidPublicUrl } from '@/utils/storage';
import { getPlatformInfo } from '@/utils/storage/mobileUpload';

export async function updateDog(id: string, updates: Partial<Dog>): Promise<Dog | null> {
  if (!id) {
    console.error('updateDog called without id');
    throw new Error('Dog ID is required');
  }

  try {
    console.log('Starting dog update process for ID:', id);
    
    // First fetch the current dog data to check for image changes
    const { data: currentDog, error: fetchError } = await supabase
      .from('dogs')
      .select('*')
      .eq('id', id)
      .single();
      
    if (fetchError) {
      console.error('Error fetching current dog data:', fetchError);
      throw new Error('Could not fetch current dog data');
    }

    // Convert Dog object to database format
    const dbUpdates = sanitizeDogForDb(updates);
    
    // Validate image URL if present to prevent invalid URLs from being saved
    if (dbUpdates.image_url) {
      console.log('Validating new image URL before update:', 
        dbUpdates.image_url.substring(0, 100) + (dbUpdates.image_url.length > 100 ? '...' : ''));
        
      if (!isValidPublicUrl(dbUpdates.image_url)) {
        console.error('Invalid image URL detected:', dbUpdates.image_url.substring(0, 50) + '...');
        
        // Handle invalid URLs differently based on platform
        const platform = getPlatformInfo();
        if (platform.mobile || platform.safari) {
          console.log('Mobile/Safari detected, falling back to previous image URL');
          // Fall back to the previous image URL if available
          dbUpdates.image_url = currentDog.image_url || undefined;
        } else {
          throw new Error('Invalid image URL format. Please try uploading again.');
        }
      }
    }

    // Ensure dates are stored without time components
    if (dbUpdates.birthdate) {
      dbUpdates.birthdate = typeof dbUpdates.birthdate === 'string' 
        ? dbUpdates.birthdate.split('T')[0]
        : dateToISOString(dbUpdates.birthdate as any);
    }
    
    if (dbUpdates.dewormingDate) {
      dbUpdates.dewormingDate = typeof dbUpdates.dewormingDate === 'string'
        ? dbUpdates.dewormingDate.split('T')[0]
        : dateToISOString(dbUpdates.dewormingDate as any);
    }
    
    if (dbUpdates.vaccinationDate) {
      dbUpdates.vaccinationDate = typeof dbUpdates.vaccinationDate === 'string'
        ? dbUpdates.vaccinationDate.split('T')[0]
        : dateToISOString(dbUpdates.vaccinationDate as any);
    }
    
    // Remove undefined values from dbUpdates to prevent Supabase errors
    const cleanUpdates: Record<string, any> = {};
    Object.entries(dbUpdates).forEach(([key, value]) => {
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    });
    
    // Only proceed with update if there are actual changes
    if (Object.keys(cleanUpdates).length === 0) {
      console.log('No changes detected, skipping update');
      return enrichDog(currentDog);
    }
    
    console.log('Cleaned updates for Supabase:', cleanUpdates);
    
    // Add explicit updated_at timestamp to force update detection
    cleanUpdates.updated_at = new Date().toISOString();
    
    // Verify session is active before updating
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.error('Session not found during dog update, attempting refresh');
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError || !refreshData.session) {
        console.error('Failed to refresh session during dog update:', refreshError);
        throw new Error('Your session has expired. Please login again to save changes.');
      }
      
      console.log('Session refreshed successfully, continuing with update');
    }
    
    // Use a separated query builder for better control
    const updateQuery = supabase
      .from('dogs')
      .update(cleanUpdates)
      .eq('id', id)
      .select('*');
    
    let updatedDog: Dog | null = null;
    
    // Execute the update with timeout protection but with retry mechanism
    try {
      const updateResponse = await withTimeout<PostgrestResponse<DbDog>>(
        updateQuery,
        TIMEOUT
      );

      // Handle Supabase error
      if (updateResponse.error) {
        console.error('Supabase error updating dog:', updateResponse.error.message);
        throw new Error(`Database error: ${updateResponse.error.message}`);
      }

      // Handle missing data in response
      if (!updateResponse.data || updateResponse.data.length === 0) {
        console.error('No dog data returned after update');
        throw new Error('Update succeeded but no data was returned');
      }

      // Check if the image was changed and cleanup old image if needed
      if (cleanUpdates.image_url && currentDog.image_url && 
          currentDog.image_url !== cleanUpdates.image_url && 
          isValidPublicUrl(currentDog.image_url) && 
          isValidPublicUrl(cleanUpdates.image_url)) {
        console.log('Image changed, cleaning up old image');
        try {
          await cleanupStorageImage({
            oldImageUrl: currentDog.image_url,
            userId: currentDog.owner_id,
            excludeDogId: id
          });
        } catch (cleanupError) {
          // Don't fail the update if cleanup fails
          console.error('Failed to cleanup old image:', cleanupError);
        }
      }

      // Convert DB response to Dog object
      updatedDog = enrichDog(updateResponse.data[0]);
      console.log('Successfully updated dog:', updatedDog);
      
      // Create or update calendar events based on dog data changes
      try {
        const needsBirthdaySync = updates.dateOfBirth !== undefined;
        const needsVaccinationSync = updates.vaccinationDate !== undefined;
        const needsHeatSync = updates.heatHistory !== undefined || updates.heatInterval !== undefined;
        
        // Only sync events if relevant data was updated
        if (needsBirthdaySync || needsVaccinationSync || needsHeatSync) {
          console.log('Syncing calendar events after dog update');
          
          if (needsBirthdaySync && updatedDog.dateOfBirth) {
            await syncBirthdayEvents(updatedDog.id);
          }
          
          if (needsVaccinationSync && updatedDog.vaccinationDate) {
            await syncVaccinationEvents(updatedDog.id);
          }
          
          if (needsHeatSync && updatedDog.gender === 'female') {
            const { calculateUpcomingHeats } = await import('@/utils/heatCalculator');
            const upcomingHeats = calculateUpcomingHeats([updatedDog]);
            
            for (const heat of upcomingHeats) {
              await syncHeatCycleEvents(heat);
            }
          }
        }
      } catch (syncError) {
        console.error('Error syncing calendar events during dog update:', syncError);
        // Don't fail the whole operation if calendar sync fails
      }
      
      return updatedDog;
    } catch (error) {
      // If it's a timeout error, provide a specific message
      if (isTimeoutError(error)) {
        console.error('Update dog operation timed out');
        throw new Error('The update operation timed out. Please try again or make smaller changes at a time.');
      }
      throw error; // Re-throw if it's not a timeout error
    }
  } catch (error) {
    // Enhanced error logging
    console.error('Failed to update dog:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.stack);
    }
    
    throw error instanceof Error 
      ? error 
      : new Error('Failed to update dog: Unknown error');
  }
}
