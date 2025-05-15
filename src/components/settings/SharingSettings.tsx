import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { UserSettings, SharedUser } from '@/types/settings';
import { useSettings } from '@/hooks/useSettings';
import { format } from 'date-fns';
import { Mail, Shield, Pencil, Eye, Trash2, UserPlus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from '@/integrations/supabase/client';
import { isSupabaseError, safeGet } from '@/utils/supabaseErrorHandler';

const inviteFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['admin', 'editor', 'viewer'], {
    required_error: "Please select a user role",
  }),
});

type InviteFormValues = z.infer<typeof inviteFormSchema>;

interface SharingSettingsProps {
  settings: UserSettings;
}

const SharingSettings: React.FC<SharingSettingsProps> = ({ settings }) => {
  const { addSharedUser, removeSharedUser, isAddingSharedUser, isRemovingSharedUser } = useSettings();
  const [userToRemove, setUserToRemove] = useState<SharedUser | null>(null);
  const [sharedUserEmails, setSharedUserEmails] = useState<Record<string, string>>({});
  
  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: '',
      role: 'viewer',
    },
  });

  // Fetch shared user emails
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
              if (profile) {
                const id = safeGet(profile, 'id', '');
                const email = safeGet(profile, 'email', '');
                if (id && email) {
                  emailMap[id] = email;
                }
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
  
  const onSubmit = (data: InviteFormValues) => {
    addSharedUser(data.email, data.role);
    form.reset();
  };
  
  const handleRemoveUser = () => {
    if (!userToRemove) return;
    removeSharedUser(userToRemove.shared_with_id);
    setUserToRemove(null);
  };
  
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4 text-red-500" />;
      case 'editor':
        return <Pencil className="h-4 w-4 text-amber-500" />;
      default:
        return <Eye className="h-4 w-4 text-green-500" />;
    }
  };
  
  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return "bg-red-100 text-red-800 border-red-200";
      case 'editor':
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-green-100 text-green-800 border-green-200";
    }
  };
  
  const roleDescriptions = {
    admin: "Can manage all aspects of the account, including adding/removing users",
    editor: "Can edit breeding records and manage dogs but cannot change account settings",
    viewer: "Can view all information but cannot make changes"
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Share Your Account</CardTitle>
          <CardDescription>
            Invite others to collaborate on your breeding records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="colleague@example.com" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div>
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="mt-2">
                <h4 className="text-sm font-medium mb-1">Role Description</h4>
                <p className="text-sm text-muted-foreground">
                  {roleDescriptions[form.watch('role') || 'viewer']}
                </p>
              </div>
              
              <div className="mt-4">
                <Button 
                  type="submit" 
                  disabled={isAddingSharedUser}
                  className="w-full md:w-auto"
                >
                  {isAddingSharedUser ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></span>
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Send Invitation
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Shared Users</CardTitle>
          <CardDescription>
            People who have access to your breeding records
          </CardDescription>
        </CardHeader>
        <CardContent>
          {settings.sharedUsers && settings.sharedUsers.length > 0 ? (
            <div className="space-y-3">
              {settings.sharedUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{sharedUserEmails[user.shared_with_id] || user.shared_with_id}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full border capitalize flex items-center gap-1 ${getRoleBadgeClass(user.role)}`}>
                          {getRoleIcon(user.role)}
                          {user.role}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {user.status === 'pending' ? 'Invitation sent' : 'Active'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setUserToRemove(user)}
                    disabled={isRemovingSharedUser}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-6 border border-dashed rounded-md">
              <UserPlus className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium">No shared users yet</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Invite collaborators to work together on your breeding records
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Confirmation dialog for removing a user */}
      <AlertDialog open={!!userToRemove} onOpenChange={(open) => !open && setUserToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Shared User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {userToRemove && sharedUserEmails[userToRemove.shared_with_id] || userToRemove?.shared_with_id} from your shared users?
              They will no longer have access to your breeding records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SharingSettings;
