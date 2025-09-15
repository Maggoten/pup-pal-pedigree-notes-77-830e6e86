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
import { Badge } from '@/components/ui/badge';
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
import { useTranslation } from 'react-i18next';

const createInviteFormSchema = (t: (key: string) => string) => z.object({
  email: z.string().email(t('account.sharing.validation.invalidEmail')),
  role: z.enum(['admin', 'editor', 'viewer'], {
    required_error: t('account.sharing.validation.roleRequired'),
  }),
});

type InviteFormValues = z.infer<ReturnType<typeof createInviteFormSchema>>;

interface SharingSettingsProps {
  settings: UserSettings;
}

const SharingSettings: React.FC<SharingSettingsProps> = ({ settings }) => {
  const { addSharedUser, removeSharedUser, isAddingSharedUser, isRemovingSharedUser } = useSettings();
  const { t } = useTranslation('settings');
  const [userToRemove, setUserToRemove] = useState<SharedUser | null>(null);
  const [sharedUserEmails, setSharedUserEmails] = useState<Record<string, string>>({});
  
  const inviteFormSchema = createInviteFormSchema(t);
  
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
      
      const userIds = settings.sharedUsers.map(user => user.shared_with_id);
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email')
          .in('id', userIds);
          
        if (error) {
          console.error('Error fetching shared user emails:', error);
          return;
        }
        
        if (data) {
          const emailMap: Record<string, string> = {};
          data.forEach(profile => {
            emailMap[profile.id] = profile.email;
          });
          setSharedUserEmails(emailMap);
        }
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
  
  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return t('account.sharing.roleDescriptions.admin');
      case 'editor':
        return t('account.sharing.roleDescriptions.editor');
      default:
        return t('account.sharing.roleDescriptions.viewer');
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('account.sharing.title')}</CardTitle>
              <CardDescription>
                {t('account.sharing.description')}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
              {t('account.sharing.comingSoon')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-6 border border-dashed rounded-md bg-muted/30">
            <div className="text-center">
              <UserPlus className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium">{t('account.sharing.comingSoonTitle')}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t('account.sharing.comingSoonDescription')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('account.sharing.sharedUsersTitle')}</CardTitle>
          <CardDescription>
            {t('account.sharing.sharedUsersDescription')}
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
                          {user.status === 'pending' ? t('account.sharing.status.pending') : t('account.sharing.status.active')}
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
              <h3 className="text-lg font-medium">{t('account.sharing.emptyState.title')}</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                {t('account.sharing.emptyState.description')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Confirmation dialog for removing a user */}
      <AlertDialog open={!!userToRemove} onOpenChange={(open) => !open && setUserToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('account.sharing.removeDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('account.sharing.removeDialog.description', {
                email: sharedUserEmails[userToRemove?.shared_with_id || ''] || userToRemove?.shared_with_id
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('account.sharing.removeDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('account.sharing.removeDialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SharingSettings;
