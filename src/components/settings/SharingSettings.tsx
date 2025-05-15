
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSettings } from '@/hooks/useSettings';
import { supabase } from '@/integrations/supabase/client';
import { safeFilter } from '@/utils/supabaseTypeUtils';

export const SharingSettings = () => {
  const { settings } = useSettings();
  const [sharedUserEmails, setSharedUserEmails] = useState<Record<string, string>>({});
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('viewer');
  const { addSharedUser, removeSharedUser, isAddingSharedUser, isRemovingSharedUser } = useSettings();

  // Fetch shared user emails when settings change
  useEffect(() => {
    const fetchSharedUserEmails = async () => {
      if (!settings?.sharedUsers?.length) return;
      
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
          const { data, error } = await safeFilter(
            supabase.from('profiles').select('id, email'),
            'id',
            batchIds
          );
          
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
  }, [settings?.sharedUsers]);
  
  const handleAddUser = async () => {
    if (!newUserEmail.trim()) return;
    
    await addSharedUser(newUserEmail, newUserRole);
    setNewUserEmail('');
    setNewUserRole('viewer');
  };
  
  const handleRemoveUser = async (userId: string) => {
    await removeSharedUser(userId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Share your account</h3>
        <p className="text-sm text-muted-foreground">
          Share your breeding data with others (vets, partners, etc)
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="flex space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              placeholder="colleague@example.com"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              className="h-10 px-3 py-2 border rounded-md"
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value)}
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
            </select>
          </div>
          <div className="self-end">
            <Button 
              onClick={handleAddUser}
              disabled={isAddingSharedUser}
            >
              {isAddingSharedUser ? 'Adding...' : 'Add'}
            </Button>
          </div>
        </div>
      </div>
      
      {settings?.sharedUsers && settings.sharedUsers.length > 0 && (
        <div className="border rounded-md">
          <div className="bg-muted p-3 flex items-center text-sm font-medium">
            <div className="w-1/2">Email</div>
            <div className="w-1/3">Role</div>
            <div className="w-1/6"></div>
          </div>
          <div className="divide-y">
            {settings.sharedUsers.map((user) => (
              <div key={user.shared_with_id} className="p-3 flex items-center text-sm">
                <div className="w-1/2">
                  {sharedUserEmails[user.shared_with_id] || 'Loading...'}
                </div>
                <div className="w-1/3 capitalize">
                  {user.role}
                </div>
                <div className="w-1/6 text-right">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-destructive hover:text-destructive/80"
                    onClick={() => handleRemoveUser(user.shared_with_id)}
                    disabled={isRemovingSharedUser}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SharingSettings;
