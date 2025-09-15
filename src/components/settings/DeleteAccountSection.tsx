
import React, { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const DeleteAccountSection: React.FC = () => {
  const { user, deleteAccount } = useAuth();
  const { t } = useTranslation('settings');
  const [isOpen, setIsOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user) {
      toast.error(t('account.deleteAccount.errors.notLoggedIn'));
      return;
    }

    if (confirmEmail.toLowerCase() !== user.email.toLowerCase()) {
      toast.error(t('account.deleteAccount.errors.emailMismatch'));
      return;
    }

    setIsDeleting(true);
    try {
      const success = await deleteAccount();
      if (success) {
        setIsOpen(false);
        // The user will be redirected to login page by AuthProvider's signOut
      }
    } catch (error) {
      toast.error(t('account.deleteAccount.errors.deletionFailed'));
      console.error("Account deletion error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="border border-destructive/20 rounded-lg p-6 bg-destructive/5">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-destructive">
          <Trash2 className="h-5 w-5" />
          <h3 className="text-lg font-medium">{t('account.deleteAccount.title')}</h3>
        </div>
        
        <p className="text-sm text-muted-foreground">
          {t('account.deleteAccount.description')}
        </p>
        
        <Button 
          variant="destructive" 
          onClick={() => setIsOpen(true)}
          className="w-full sm:w-auto"
        >
          {t('account.deleteAccount.button')}
        </Button>
      </div>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('account.deleteAccount.confirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('account.deleteAccount.confirmDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <Label htmlFor="confirmEmail" className="text-sm font-medium">
              {t('account.deleteAccount.emailConfirmLabel')} <span className="font-mono">{user?.email}</span>:
            </Label>
            <Input 
              id="confirmEmail"
              type="email" 
              value={confirmEmail} 
              onChange={(e) => setConfirmEmail(e.target.value)}
              placeholder={t('account.deleteAccount.emailPlaceholder')}
              className="mt-2"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{t('account.deleteAccount.cancelButton')}</AlertDialogCancel>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAccount}
              disabled={isDeleting || confirmEmail.toLowerCase() !== (user?.email || '').toLowerCase()}
              className="gap-2"
            >
              {isDeleting ? t('account.deleteAccount.deleting') : t('account.deleteAccount.confirmButton')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DeleteAccountSection;
