
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Eye, EyeOff, Lock, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  validatePasswordStrength,
  getPasswordStrengthColor,
  getPasswordStrengthLabel
} from '@/utils/passwordValidation';

const resetPasswordSchema = z.object({
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "Password must contain at least one special character"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isValidRecovery, setIsValidRecovery] = useState(false);
  const [isCheckingRecovery, setIsCheckingRecovery] = useState(true);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema)
  });

  const newPassword = watch('newPassword', '');
  const passwordStrength = validatePasswordStrength(newPassword);

  // Handle password recovery token verification
  useEffect(() => {
    const verifyRecoveryToken = async () => {
      try {
        // Check for recovery parameters in URL
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const type = searchParams.get('type');

        console.log('Recovery parameters:', { accessToken: !!accessToken, refreshToken: !!refreshToken, type });

        if (type === 'recovery' && accessToken && refreshToken) {
          console.log('Valid recovery parameters found, setting session');
          
          // Set the session using the tokens from the URL
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error('Error setting recovery session:', error);
            setRecoveryError('Invalid or expired recovery link. Please request a new password reset.');
            setIsValidRecovery(false);
          } else if (data.session) {
            console.log('Recovery session established successfully');
            setIsValidRecovery(true);
            setRecoveryError(null);
          } else {
            console.error('No session created from recovery tokens');
            setRecoveryError('Unable to establish recovery session. Please try again.');
            setIsValidRecovery(false);
          }
        } else {
          console.log('No valid recovery parameters found in URL');
          setRecoveryError('This page can only be accessed through a valid password reset link.');
          setIsValidRecovery(false);
        }
      } catch (error) {
        console.error('Unexpected error during recovery verification:', error);
        setRecoveryError('An error occurred while verifying the recovery link.');
        setIsValidRecovery(false);
      } finally {
        setIsCheckingRecovery(false);
      }
    };

    verifyRecoveryToken();

    // Listen for auth state changes during recovery
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change during recovery:', event, !!session);
      
      if (event === 'PASSWORD_RECOVERY' && session) {
        console.log('Password recovery event with session detected');
        setIsValidRecovery(true);
        setRecoveryError(null);
        setIsCheckingRecovery(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [searchParams]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!isValidRecovery) {
      toast.error('Invalid recovery session. Please request a new password reset.');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Attempting to update password');
      
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword
      });

      if (error) {
        console.error('Password update error:', error);
        
        if (error.message.includes('session_not_found') || error.message.includes('Session not found')) {
          toast.error('Your recovery session has expired. Please request a new password reset.');
          setTimeout(() => navigate('/login'), 2000);
        } else {
          toast.error('Failed to update password. Please try again.');
        }
        return;
      }

      console.log('Password updated successfully');
      toast.success('Password updated successfully! You are now logged in.');
      
      // Clear the URL parameters and redirect
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Unexpected error during password update:', error);
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

  // Show loading state while checking recovery
  if (isCheckingRecovery) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-warmbeige-50 to-warmbeige-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-warmgreen-600 mb-4"></div>
            <p className="text-center text-muted-foreground">Verifying recovery link...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state if recovery is invalid
  if (!isValidRecovery || recoveryError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-warmbeige-50 to-warmbeige-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-red-900">Access Denied</CardTitle>
            <CardDescription className="text-red-700">
              {recoveryError || 'This page can only be accessed through a valid password reset link.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                onClick={() => navigate('/login')}
                className="w-full bg-warmgreen-600 hover:bg-warmgreen-700"
              >
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-warmbeige-50 to-warmbeige-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-warmgreen-100">
            <Lock className="h-6 w-6 text-warmgreen-600" />
          </div>
          <CardTitle>Reset Your Password</CardTitle>
          <CardDescription>
            Enter your new password below. Make sure it's strong and secure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                    After resetting your password, you'll remain logged in to your account.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="space-y-3">
              <Button 
                type="submit"
                disabled={isLoading || !passwordStrength.meetsRequirements}
                className="w-full bg-warmgreen-600 hover:bg-warmgreen-700 text-white"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating Password...
                  </div>
                ) : (
                  "Update Password"
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/login')}
                disabled={isLoading}
                className="w-full"
              >
                Back to Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
