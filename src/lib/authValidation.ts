import { z } from 'zod';

/**
 * Authentication form validation schemas using Zod
 */

// Strong password requirements
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character");

// Email validation
export const emailSchema = z
  .string()
  .email("Invalid email address")
  .max(255, "Email must be less than 255 characters")
  .trim()
  .toLowerCase();

// Sign up form schema
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  captcha: z.string().min(1, "Please complete the CAPTCHA"),
});

// Login form schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

// Password reset schema
export const passwordResetSchema = z.object({
  email: emailSchema,
});

// Type exports for TypeScript
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type PasswordResetFormData = z.infer<typeof passwordResetSchema>;
