
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSettings } from '@/hooks/useSettings';
import { supabase } from '@/integrations/supabase/client';
import { convertSafely } from '@/utils/supabaseTypeUtils';

const SharingSettings = () => {
  const { settings, addSharedUser, removeSharedUser, isAddingSharedUser, isRemovingSharedUser } = useSettings();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [sharedUserEmails, setSharedUserEmails] = useState<Record<string, string>>({});
  
  // Fetch email addresses for shared user IDs when component mounts or settings change
  useEffect(() => {
    const fetchSharedUserEmails = async () => {
      if (!settings?.sharedUsers?.length) return;
      
      try {
        const emails: Record<string, string> = {};
        
        // Fetch emails for each shared user ID
        for (const sharedUser of settings.sharedUsers) {
          const { data } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', sharedUser.shared_with_id)
            .single();
          
          if (data?.email) {
            emails[sharedUser.shared_with_id] = data.email;
          }
        }
        
        setSharedUserEmails(emails);
      } catch (error) {
        console.error('Error fetching shared user emails:', error);
      }
    };
    
    fetchSharedUserEmails();
  }, [settings?.sharedUsers]);
  
  const handleAddUser = async () => {
    if (!email) return;
    await addSharedUser(email, role);
    setEmail('');
  };
  
  const handleRemoveUser = async (userId: string) => {
    await removeSharedUser(userId);
  };
  
  if (!settings) {
    return <div className="text-center text-muted-foreground">Loading...</div>;
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Share Your Account</h3>
        <p className="text-sm text-muted-foreground">
          Share your account with family members or staff to help manage your breeding program.
        </p>
      </div>
      
      <div className="grid gap-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <Input
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        
        <Button 
          onClick={handleAddUser} 
          disabled={isAddingSharedUser || !email}
        >
          {isAddingSharedUser ? 'Adding...' : 'Add User'}
        </Button>
      </div>
      
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Shared With</h4>
        
        {settings.sharedUsers?.length === 0 ? (
          <p className="text-sm text-muted-foreground">You haven't shared your account with anyone yet.</p>
        ) : (
          <ul className="space-y-2">
            {settings.sharedUsers?.map((user) => (
              <li key={user.id} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <span>{sharedUserEmails[user.shared_with_id] || user.shared_with_id}</span>
                  <span className="text-xs text-muted-foreground ml-2 capitalize">({user.role})</span>
                  <span className="text-xs bg-yellow-100 text-yellow-800 rounded px-1 ml-2 uppercase">{user.status}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleRemoveUser(user.shared_with_id)}
                  disabled={isRemovingSharedUser}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SharingSettings;
