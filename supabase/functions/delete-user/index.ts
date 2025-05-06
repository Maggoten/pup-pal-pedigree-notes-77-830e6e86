import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Create a Supabase client with the authorization header
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false },
      }
    );

    // Get the user from the client
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Create admin client for operations requiring elevated permissions
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    console.log(`Starting account deletion process for user: ${user.id}`);
    
    try {
      // Step 1: Clean up all dependent records in a specific order to prevent foreign key constraint violations
      
      // Handle pregnancies
      console.log('Cleaning up pregnancies...');
      const { error: pregnanciesError } = await supabaseAdmin
        .from('pregnancies')
        .update({ female_dog_id: null, male_dog_id: null, status: 'terminated' })
        .eq('user_id', user.id);
        
      if (pregnanciesError) {
        console.error('Error cleaning up pregnancies:', pregnanciesError);
      }

      // Handle mating dates
      console.log('Cleaning up mating dates...');
      const { error: matingDatesError } = await supabaseAdmin
        .from('mating_dates')
        .delete()
        .eq('user_id', user.id);
        
      if (matingDatesError) {
        console.error('Error cleaning up mating dates:', matingDatesError);
      }
      
      // Handle planned litters
      console.log('Cleaning up planned litters...');
      const { error: plannedLittersError } = await supabaseAdmin
        .from('planned_litters')
        .delete()
        .eq('user_id', user.id);
        
      if (plannedLittersError) {
        console.error('Error cleaning up planned litters:', plannedLittersError);
      }
      
      // Handle puppies and related records
      console.log('Cleaning up puppies and related records...');
      // First get all litters by this user
      const { data: userLitters, error: littersQueryError } = await supabaseAdmin
        .from('litters')
        .select('id')
        .eq('user_id', user.id);
      
      if (littersQueryError) {
        console.error('Error querying user litters:', littersQueryError);
      } else if (userLitters && userLitters.length > 0) {
        const litterIds = userLitters.map(litter => litter.id);
        
        // Get all puppies from these litters
        const { data: puppies, error: puppiesQueryError } = await supabaseAdmin
          .from('puppies')
          .select('id')
          .in('litter_id', litterIds);
          
        if (puppiesQueryError) {
          console.error('Error querying puppies:', puppiesQueryError);
        } else if (puppies && puppies.length > 0) {
          const puppyIds = puppies.map(puppy => puppy.id);
          
          // Delete puppy weight logs
          const { error: weightLogsError } = await supabaseAdmin
            .from('puppy_weight_logs')
            .delete()
            .in('puppy_id', puppyIds);
            
          if (weightLogsError) {
            console.error('Error cleaning up puppy weight logs:', weightLogsError);
          }
          
          // Delete puppy height logs
          const { error: heightLogsError } = await supabaseAdmin
            .from('puppy_height_logs')
            .delete()
            .in('puppy_id', puppyIds);
            
          if (heightLogsError) {
            console.error('Error cleaning up puppy height logs:', heightLogsError);
          }
          
          // Delete puppy notes
          const { error: puppyNotesError } = await supabaseAdmin
            .from('puppy_notes')
            .delete()
            .in('puppy_id', puppyIds);
            
          if (puppyNotesError) {
            console.error('Error cleaning up puppy notes:', puppyNotesError);
          }
        }
        
        // Delete puppies
        const { error: puppiesError } = await supabaseAdmin
          .from('puppies')
          .delete()
          .in('litter_id', litterIds);
          
        if (puppiesError) {
          console.error('Error cleaning up puppies:', puppiesError);
        }
        
        // Delete development checklist items
        const { error: checklistError } = await supabaseAdmin
          .from('development_checklist_items')
          .delete()
          .in('litter_id', litterIds);
          
        if (checklistError) {
          console.error('Error cleaning up development checklist items:', checklistError);
        }
        
        // Delete litters
        const { error: littersError } = await supabaseAdmin
          .from('litters')
          .delete()
          .eq('user_id', user.id);
          
        if (littersError) {
          console.error('Error cleaning up litters:', littersError);
        }
      }
      
      // Handle pregnancy-related tables
      console.log('Cleaning up pregnancy records...');
      
      // Get all pregnancies by this user
      const { data: userPregnancies } = await supabaseAdmin
        .from('pregnancies')
        .select('id')
        .eq('user_id', user.id);
        
      if (userPregnancies && userPregnancies.length > 0) {
        const pregnancyIds = userPregnancies.map(pregnancy => pregnancy.id);
        
        // Delete symptom logs
        const { error: symptomLogsError } = await supabaseAdmin
          .from('symptom_logs')
          .delete()
          .in('pregnancy_id', pregnancyIds);
          
        if (symptomLogsError) {
          console.error('Error cleaning up symptom logs:', symptomLogsError);
        }
        
        // Delete temperature logs
        const { error: tempLogsError } = await supabaseAdmin
          .from('temperature_logs')
          .delete()
          .in('pregnancy_id', pregnancyIds);
          
        if (tempLogsError) {
          console.error('Error cleaning up temperature logs:', tempLogsError);
        }
        
        // Delete pregnancy checklists
        const { error: pregnancyChecklistsError } = await supabaseAdmin
          .from('pregnancy_checklists')
          .delete()
          .in('pregnancy_id', pregnancyIds);
          
        if (pregnancyChecklistsError) {
          console.error('Error cleaning up pregnancy checklists:', pregnancyChecklistsError);
        }
      }
      
      // Now delete pregnancies
      const { error: deletePregnanciesError } = await supabaseAdmin
        .from('pregnancies')
        .delete()
        .eq('user_id', user.id);
        
      if (deletePregnanciesError) {
        console.error('Error deleting pregnancies:', deletePregnanciesError);
      }
      
      // Handle calendar events
      console.log('Cleaning up calendar events...');
      const { error: calendarError } = await supabaseAdmin
        .from('calendar_events')
        .delete()
        .eq('user_id', user.id);
        
      if (calendarError) {
        console.error('Error cleaning up calendar events:', calendarError);
      }
      
      // Handle reminders
      console.log('Cleaning up reminders...');
      const { error: remindersError } = await supabaseAdmin
        .from('reminders')
        .delete()
        .eq('user_id', user.id);
        
      if (remindersError) {
        console.error('Error cleaning up reminders:', remindersError);
      }
      
      // Handle shared users
      console.log('Cleaning up shared users...');
      const { error: sharedUsersError1 } = await supabaseAdmin
        .from('shared_users')
        .delete()
        .eq('owner_id', user.id);
        
      if (sharedUsersError1) {
        console.error('Error cleaning up shared users (as owner):', sharedUsersError1);
      }
      
      const { error: sharedUsersError2 } = await supabaseAdmin
        .from('shared_users')
        .delete()
        .eq('shared_with_id', user.id);
        
      if (sharedUsersError2) {
        console.error('Error cleaning up shared users (as shared with):', sharedUsersError2);
      }
      
      // Handle dogs (should be done after pregnancies and litters)
      console.log('Cleaning up dogs...');
      const { error: dogsError } = await supabaseAdmin
        .from('dogs')
        .delete()
        .eq('owner_id', user.id);
        
      if (dogsError) {
        console.error('Error cleaning up dogs:', dogsError);
      }
      
      // Delete the user's profile
      console.log('Deleting user profile...');
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) {
        console.error('Error deleting profile:', profileError);
      }

      // Store the user's email before deletion to check if it was properly removed
      const userEmail = user.email;

      // Finally, delete the auth user properly with hard_delete parameter
      // This ensures the email can be re-registered
      console.log('Deleting auth user...');
      const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id, {
        shouldSoftDelete: false // Force hard delete to make email available again
      });

      if (authDeleteError) {
        console.error('Error deleting auth user:', authDeleteError);
        return new Response(JSON.stringify({ 
          error: 'Failed to delete auth user',
          details: authDeleteError.message,
          userId: user.id 
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // Do a quick check if the email is available by trying to get the user by email
      console.log('Verifying email is available for re-registration...');
      const { data: emailCheck } = await supabaseAdmin.auth.admin.listUsers({
        filter: {
          email: userEmail,
        },
        page: 1,
        perPage: 1,
      });

      if (emailCheck && emailCheck.users && emailCheck.users.length > 0) {
        console.warn('Warning: Email still exists in auth system after deletion attempt');
      } else {
        console.log('Email successfully removed from auth system and available for re-registration');
      }

      console.log('User deleted successfully');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'User account deleted successfully',
        userId: user.id,
        emailAvailable: true
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    } catch (cleanupError) {
      console.error('Error during user data cleanup:', cleanupError);
      
      // Try to force delete the auth user even if data cleanup had issues
      try {
        // Use hard delete to ensure email can be re-registered
        const { error: forceDeleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id, {
          shouldSoftDelete: false // Force hard delete
        });
        
        if (forceDeleteError) {
          console.error('Failed to force delete auth user after cleanup error:', forceDeleteError);
          return new Response(JSON.stringify({ 
            error: 'Failed to delete account after data cleanup issues',
            details: `Cleanup error: ${String(cleanupError)}, Auth delete error: ${forceDeleteError.message}`,
            userId: user.id
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        } else {
          return new Response(JSON.stringify({ 
            success: true,
            message: 'User account deleted with some data cleanup issues',
            details: `Cleanup had issues but auth user was successfully deleted: ${String(cleanupError)}`,
            userId: user.id
          }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
      } catch (finalError) {
        return new Response(JSON.stringify({ 
          error: 'Critical failure during account deletion',
          details: `Original error: ${String(cleanupError)}, Final error: ${String(finalError)}`,
          userId: user.id
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }
  } catch (error) {
    console.error('Unexpected error in delete-user function:', error);
    return new Response(JSON.stringify({ 
      error: 'Unexpected error during account deletion',
      details: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
