
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

const DeleteAccountSection: React.FC = () => {
  const { user, deleteAccount } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user) {
      toast.error("You must be logged in to delete your account");
      return;
    }

    if (confirmEmail.toLowerCase() !== user.email.toLowerCase()) {
      toast.error("Email address doesn't match your account email");
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
      toast.error("Failed to delete account. Please try again later.");
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
          <h3 className="text-lg font-medium">Delete Account</h3>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        
        <Button 
          variant="destructive" 
          onClick={() => setIsOpen(true)}
          className="w-full sm:w-auto"
        >
          Delete My Account
        </Button>
      </div>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account
              and remove all of your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <Label htmlFor="confirmEmail" className="text-sm font-medium">
              Type your email <span className="font-mono">{user?.email}</span> to confirm:
            </Label>
            <Input 
              id="confirmEmail"
              type="email" 
              value={confirmEmail} 
              onChange={(e) => setConfirmEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="mt-2"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAccount}
              disabled={isDeleting || confirmEmail.toLowerCase() !== (user?.email || '').toLowerCase()}
              className="gap-2"
            >
              {isDeleting ? "Deleting..." : "Delete My Account"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DeleteAccountSection;
