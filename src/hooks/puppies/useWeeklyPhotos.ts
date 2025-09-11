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
        .from('puppy-images')
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

      return photoData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['puppy-weekly-photos', puppyId] });
      toast({
        title: "Foto uppladdad",
        description: "Det veckovisa fotot har sparats"
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
      updates: Partial<Pick<PuppyWeeklyPhoto, 'notes' | 'weight' | 'height'>> 
    }) => {
      const { data, error } = await supabase
        .from('puppy_weekly_photos')
        .update(updates)
        .eq('id', photoId)
        .select()
        .single();

      if (error) {
        console.error('Error updating weekly photo:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['puppy-weekly-photos', puppyId] });
      toast({
        title: "Foto uppdaterat",
        description: "Fotoinformationen har uppdaterats"
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