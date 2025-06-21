import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { Eye, EyeOff, Lock, Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from 'sonner';
import { 
  passwordSchema, 
  type PasswordFormData, 
  validatePasswordStrength,
  getPasswordStrengthColor,
  getPasswordStrengthLabel
} from '@/utils/passwordValidation';

const ChangePasswordForm: React.FC = () => {
  const { updatePassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema)
  });

  const newPassword = watch('newPassword', '');
  const passwordStrength = validatePasswordStrength(newPassword);

  const onSubmit = async (data: PasswordFormData) => {
    setIsLoading(true);
    try {
      const success = await updatePassword(data.currentPassword, data.newPassword);
      
      if (success) {
        toast.success('Password updated successfully');
        reset();
      } else {
        toast.error('Failed to update password. Please check your current password.');
      }
    } catch (error) {
      console.error('Password update error:', error);
      toast.error('An unexpected error occurred while updating your password');
    } finally {
      setIsLoading(false);
    }
  };

  const PasswordStrengthIndicator = () => {
    if (!newPassword) return null;

    const progressValue = (passwordStrength.score / 4) * 100;
    const colorClass = getPasswordStrengthColor(passwordStrength.score);
    const strengthLabel = getPasswordStrengthLabel(passwordStrength.score);

    return (
      <div className="space-y-2 mt-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Password strength</Label>
          <span className={`text-xs font-medium ${colorClass}`}>
            {strengthLabel}
          </span>
        </div>
        <Progress value={progressValue} className="h-2" />
        {passwordStrength.feedback.length > 0 && (
          <ul className="text-xs text-muted-foreground space-y-1">
            {passwordStrength.feedback.map((item, index) => (
              <li key={index} className="flex items-center gap-1">
                <span className="w-1 h-1 bg-muted-foreground rounded-full" />
                {item}
              </li>
            ))}
          </ul>
        )}
        {passwordStrength.meetsRequirements && (
          <div className="flex items-center gap-1 text-xs text-green-600">
            <CheckCircle className="w-3 h-3" />
            All requirements met
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Change Password
        </CardTitle>
        <CardDescription>
          Update your account password. You'll need to provide your current password for security.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder="Enter your current password"
                {...register('currentPassword')}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-sm text-red-600">{errors.currentPassword.message}</p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Enter your new password"
                {...register('newPassword')}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-sm text-red-600">{errors.newPassword.message}</p>
            )}
            <PasswordStrengthIndicator />
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your new password"
                {...register('confirmPassword')}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Security Notice */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Security Notice</p>
                <p className="text-xs mt-1">
                  Changing your password will sign you out of all other devices for security.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  type="button"
                  disabled={isLoading || !passwordStrength.meetsRequirements}
                  className="bg-warmgreen-600 hover:bg-warmgreen-700 text-white"
                >
                  {isLoading ? "Updating..." : "Update Password"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Password Change</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to change your password? This action will sign you out of all other devices for security.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleSubmit(onSubmit)}
                    className="bg-warmgreen-600 hover:bg-warmgreen-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Updating..." : "Yes, Change Password"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChangePasswordForm;