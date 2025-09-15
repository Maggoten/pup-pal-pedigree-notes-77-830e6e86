import { z } from 'zod';

export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  meetsRequirements: boolean;
}

export const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
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

export type PasswordFormData = z.infer<typeof passwordSchema>;

export const validatePasswordStrength = (password: string, t?: (key: string) => string): PasswordStrength => {
  const feedback: string[] = [];
  let score = 0;

  // Check length
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push(t ? t('account.password.strength.feedback.minLength') : "Use at least 8 characters");
  }

  // Check for uppercase
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push(t ? t('account.password.strength.feedback.addUppercase') : "Add uppercase letters");
  }

  // Check for lowercase
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push(t ? t('account.password.strength.feedback.addLowercase') : "Add lowercase letters");
  }

  // Check for numbers
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push(t ? t('account.password.strength.feedback.addNumbers') : "Add numbers");
  }

  // Check for special characters
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 1;
  } else {
    feedback.push(t ? t('account.password.strength.feedback.addSpecialChars') : "Add special characters");
  }

  // Bonus points for length
  if (password.length >= 12) {
    score = Math.min(score + 0.5, 4);
  }

  const meetsRequirements = score >= 4;

  return {
    score: Math.min(score, 4),
    feedback,
    meetsRequirements
  };
};

export const getPasswordStrengthColor = (score: number): string => {
  if (score < 2) return "text-red-600";
  if (score < 3) return "text-orange-600";
  if (score < 4) return "text-yellow-600";
  return "text-green-600";
};

export const getPasswordStrengthLabel = (score: number, t?: (key: string) => string): string => {
  if (!t) {
    if (score < 2) return "Weak";
    if (score < 3) return "Fair";
    if (score < 4) return "Good";
    return "Strong";
  }
  
  if (score < 2) return t('account.password.strength.labels.weak');
  if (score < 3) return t('account.password.strength.labels.fair');
  if (score < 4) return t('account.password.strength.labels.good');
  return t('account.password.strength.labels.strong');
};