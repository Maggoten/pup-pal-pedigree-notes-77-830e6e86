import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PuppyWeeklyPhoto } from '@/types/breeding';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/providers/AuthProvider';
import { uploadToStorage } from '@/utils/storage/operations/upload';
import { v4 as uuidv4 } from 'uuid';

interface UploadWeeklyPhotoData {
  puppy_id: string;
  week_number: number;
  file: File;
  notes?: string;
  weight?: number;
  height?: number;
}

export const useWeeklyPhotos = (puppyId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch weekly photos for a puppy
  const {
    data: weeklyPhotos,
    isLoading,
    error
  } = useQuery({
    queryKey: ['puppy-weekly-photos', puppyId],
    queryFn: async (): Promise<PuppyWeeklyPhoto[]> => {
      const { data, error } = await supabase
        .from('puppy_weekly_photos')
        .select('*')
        .eq('puppy_id', puppyId)
        .order('week_number', { ascending: true });

      if (error) {
        console.error('Error fetching weekly photos:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!puppyId
  });

  // Upload weekly photo mutation
  const uploadMutation = useMutation({
    mutationFn: async (data: UploadWeeklyPhotoData) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Generate unique filename
      const fileExtension = data.file.name.split('.').pop();
      const fileName = `${user.id}/puppies/${data.puppy_id}/weekly/${data.week_number}-${uuidv4()}.${fileExtension}`;

      // Upload file to storage
      const uploadResult = await uploadToStorage(fileName, data.file);
      
      if (uploadResult && typeof uploadResult === 'object' && 'error' in uploadResult && uploadResult.error) {
        throw new Error((uploadResult.error as any).message || 'Upload failed');
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('dog-photos')
        .getPublicUrl(fileName);

      // Save to database
      const { data: photoData, error: dbError } = await supabase
        .from('puppy_weekly_photos')
        .insert({
          puppy_id: data.puppy_id,
          week_number: data.week_number,
          image_url: publicUrl,
          notes: data.notes,
          weight: data.weight,
          height: data.height
        })
        .select()
        .single();

      if (dbError) {
        console.error('Error saving weekly photo to database:', dbError);
        throw dbError;
      }

      // If weight or height was provided, also save to puppy logs for growth charts
      if (data.weight || data.height) {
        const currentDate = new Date().toISOString();
        
        try {
          // Add weight log entry if weight provided
          if (data.weight) {
            const { error: weightError } = await supabase
              .from('puppy_weight_logs')
              .insert({
                puppy_id: data.puppy_id,
                date: currentDate,
                weight: data.weight
              });
            
            if (weightError) {
              console.error('Error saving weight log:', weightError);
              // Don't throw here - photo was saved successfully
            }
          }

          // Add height log entry if height provided  
          if (data.height) {
            const { error: heightError } = await supabase
              .from('puppy_height_logs')
              .insert({
                puppy_id: data.puppy_id,
                date: currentDate,
                height: data.height
              });
            
            if (heightError) {
              console.error('Error saving height log:', heightError);
              // Don't throw here - photo was saved successfully
            }
          }
        } catch (logError) {
          console.error('Error saving measurement logs:', logError);
          // Don't throw here - photo was saved successfully, logs are secondary
        }
      }

      return photoData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['puppy-weekly-photos', puppyId] });
      // Also invalidate puppy queries to update growth charts
      queryClient.invalidateQueries({ queryKey: ['puppies'] });
      queryClient.invalidateQueries({ queryKey: ['puppy', puppyId] });
      toast({
        title: "Foto uppladdad",
        description: "Det veckovisa fotot har sparats och mätningar lagts till i tillväxtdata"
      });
    },
    onError: (error) => {
      console.error('Error uploading weekly photo:', error);
      toast({
        title: "Uppladdning misslyckades",
        description: "Kunde inte ladda upp fotot",
        variant: "destructive"
      });
    }
  });

  // Delete weekly photo mutation
  const deleteMutation = useMutation({
    mutationFn: async (photoId: string) => {
      const { error } = await supabase
        .from('puppy_weekly_photos')
        .delete()
        .eq('id', photoId);

      if (error) {
        console.error('Error deleting weekly photo:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['puppy-weekly-photos', puppyId] });
      toast({
        title: "Foto borttaget",
        description: "Det veckovisa fotot har tagits bort"
      });
    },
    onError: (error) => {
      console.error('Error deleting weekly photo:', error);
      toast({
        title: "Borttagning misslyckades",
        description: "Kunde inte ta bort fotot",
        variant: "destructive"
      });
    }
  });

  // Update weekly photo mutation
  const updateMutation = useMutation({
    mutationFn: async ({ photoId, updates }: { 
      photoId: string; 
      updates: Partial<Pick<PuppyWeeklyPhoto, 'notes' | 'weight' | 'height' | 'date_taken' | 'image_url'>> & { new_image?: File } 
    }) => {
      let finalUpdates: Partial<Pick<PuppyWeeklyPhoto, 'notes' | 'weight' | 'height' | 'date_taken' | 'image_url'>> = { ...updates };
      
      // Handle image upload if new image provided
      if (updates.new_image) {
        if (!user?.id) throw new Error('User not authenticated');
        
        // Get current photo data to find puppy_id and week_number
        const { data: currentPhoto } = await supabase
          .from('puppy_weekly_photos')
          .select('puppy_id, week_number')
          .eq('id', photoId)
          .single();
          
        if (!currentPhoto) throw new Error('Photo not found');

        // Generate unique filename for new image
        const fileExtension = updates.new_image.name.split('.').pop();
        const fileName = `${user.id}/puppies/${currentPhoto.puppy_id}/weekly/${currentPhoto.week_number}-${uuidv4()}.${fileExtension}`;

        // Upload new image to storage
        const uploadResult = await uploadToStorage(fileName, updates.new_image);
        
        if (uploadResult && typeof uploadResult === 'object' && 'error' in uploadResult && uploadResult.error) {
          throw new Error((uploadResult.error as any).message || 'Upload failed');
        }

        // Get public URL for new image
        const { data: { publicUrl } } = supabase.storage
          .from('dog-photos')
          .getPublicUrl(fileName);
          
        finalUpdates.image_url = publicUrl;
        delete (finalUpdates as any).new_image;
      }

      // Update database
      const { data, error } = await supabase
        .from('puppy_weekly_photos')
        .update(finalUpdates)
        .eq('id', photoId)
        .select()
        .single();

      if (error) {
        console.error('Error updating weekly photo:', error);
        throw error;
      }

      // Sync weight/height changes with growth chart logs
      if (updates.weight !== undefined || updates.height !== undefined) {
        try {
          // Use the new date if provided, otherwise use the existing photo date
          const logDate = updates.date_taken || data.date_taken;
          
          if (updates.weight !== undefined) {
            // Find existing weight log entry for this puppy and date
            const { data: existingWeight } = await supabase
              .from('puppy_weight_logs')
              .select('id')
              .eq('puppy_id', data.puppy_id)
              .eq('date', data.date_taken)
              .single();
              
            if (existingWeight) {
              // Update existing weight log
              await supabase
                .from('puppy_weight_logs')
                .update({ date: logDate, weight: updates.weight })
                .eq('id', existingWeight.id);
            } else {
              // Create new weight log entry
              await supabase
                .from('puppy_weight_logs')
                .insert({
                  puppy_id: data.puppy_id,
                  date: logDate,
                  weight: updates.weight
                });
            }
          }
          
          if (updates.height !== undefined) {
            // Find existing height log entry for this puppy and date
            const { data: existingHeight } = await supabase
              .from('puppy_height_logs')
              .select('id')
              .eq('puppy_id', data.puppy_id)
              .eq('date', data.date_taken)
              .single();
              
            if (existingHeight) {
              // Update existing height log
              await supabase
                .from('puppy_height_logs')
                .update({ date: logDate, height: updates.height })
                .eq('id', existingHeight.id);
            } else {
              // Create new height log entry
              await supabase
                .from('puppy_height_logs')
                .insert({
                  puppy_id: data.puppy_id,
                  date: logDate,
                  height: updates.height
                });
            }
          }
        } catch (logError) {
          console.error('Error syncing measurement logs:', logError);
          // Don't throw here - photo was updated successfully
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['puppy-weekly-photos', puppyId] });
      // Invalidate puppy queries to update growth charts
      queryClient.invalidateQueries({ queryKey: ['puppies'] });
      queryClient.invalidateQueries({ queryKey: ['puppy', puppyId] });
      queryClient.invalidateQueries({ queryKey: ['puppy-weight-logs'] });
      queryClient.invalidateQueries({ queryKey: ['puppy-height-logs'] });
      toast({
        title: "Foto uppdaterat",
        description: "Fotoinformationen har uppdaterats och tillväxtdata synkroniserad"
      });
    },
    onError: (error) => {
      console.error('Error updating weekly photo:', error);
      toast({
        title: "Uppdatering misslyckades",
        description: "Kunde inte uppdatera fotot",
        variant: "destructive"
      });
    }
  });

  return {
    weeklyPhotos,
    isLoading,
    error,
    uploadWeeklyPhoto: uploadMutation.mutateAsync,
    deleteWeeklyPhoto: deleteMutation.mutateAsync,
    updateWeeklyPhoto: updateMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isUpdating: updateMutation.isPending
  };
};