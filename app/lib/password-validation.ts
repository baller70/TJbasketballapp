import { z } from 'zod';

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
  score: number;
}

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password must be less than 128 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  let score = 0;

  // Length validation
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else if (password.length >= 8) {
    score += 1;
  }

  if (password.length >= 12) {
    score += 1;
  }

  // Character type validation
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecialChars = /[^a-zA-Z0-9]/.test(password);

  if (!hasLowercase) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    score += 1;
  }

  if (!hasUppercase) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    score += 1;
  }

  if (!hasNumbers) {
    errors.push('Password must contain at least one number');
  } else {
    score += 1;
  }

  if (!hasSpecialChars) {
    errors.push('Password must contain at least one special character');
  } else {
    score += 1;
  }

  // Additional security checks
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }

  // Check for common patterns
  const commonPatterns = [
    /(.)\1{2,}/g, // Repeated characters (aaa, 111, etc.)
    /123|abc|qwerty|password|admin/i, // Common sequences
  ];

  commonPatterns.forEach(pattern => {
    if (pattern.test(password)) {
      score -= 1;
      errors.push('Password contains common patterns that make it less secure');
    }
  });

  // Determine strength
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (score >= 5) {
    strength = 'strong';
  } else if (score >= 3) {
    strength = 'medium';
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    score: Math.max(0, score),
  };
}

export function getPasswordStrengthColor(strength: 'weak' | 'medium' | 'strong'): string {
  switch (strength) {
    case 'weak':
      return 'text-red-500';
    case 'medium':
      return 'text-yellow-500';
    case 'strong':
      return 'text-green-500';
    default:
      return 'text-gray-500';
  }
}

export function getPasswordStrengthText(strength: 'weak' | 'medium' | 'strong'): string {
  switch (strength) {
    case 'weak':
      return 'Weak';
    case 'medium':
      return 'Medium';
    case 'strong':
      return 'Strong';
    default:
      return 'Unknown';
  }
}

// Common weak passwords list (subset)
const commonWeakPasswords = [
  'password',
  '123456',
  'password123',
  'admin',
  'qwerty',
  'letmein',
  'welcome',
  'monkey',
  'dragon',
  'master',
];

export function isCommonWeakPassword(password: string): boolean {
  return commonWeakPasswords.includes(password.toLowerCase());
} 