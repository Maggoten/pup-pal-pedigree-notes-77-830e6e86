
// Only updating the problematic query part of the file
import { safeFilter } from '@/utils/supabaseTypeUtils';

// In the useEffect where we fetch shared user emails
useEffect(() => {
  const fetchSharedUserEmails = async () => {
    if (!settings.sharedUsers?.length) return;
    
    try {
      // Create an array of user IDs we need to fetch
      const userIds = settings.sharedUsers.map(user => user.shared_with_id);
      
      // Initialize an empty object for our email mapping
      const emailMap: Record<string, string> = {};
      
      // Fetch profiles in batches to avoid potential in() clause limitations
      const batchSize = 10;
      for (let i = 0; i < userIds.length; i += batchSize) {
        const batchIds = userIds.slice(i, i + batchSize);
        
        // Use any casting for now to bypass TypeScript errors with Supabase types
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email')
          .in('id', batchIds as any);
          
        if (error) {
          console.error('Error fetching shared user emails:', error);
          continue;
        }
        
        // Add results to our map if we have valid data
        if (data) {
          data.forEach(profile => {
            if (profile && profile.id && profile.email) {
              emailMap[profile.id] = profile.email;
            }
          });
        }
      }
      
      setSharedUserEmails(emailMap);
    } catch (err) {
      console.error('Exception fetching shared user emails:', err);
    }
  };
  
  fetchSharedUserEmails();
}, [settings.sharedUsers]);
