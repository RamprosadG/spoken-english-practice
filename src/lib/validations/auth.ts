import { z } from "zod";

const nameSchema = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters.")
  .max(150, "Name cannot exceed 150 characters.");

const emailSchema = z
  .email("Please provide a valid email address.")
  .transform((value) => value.trim().toLowerCase());

const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters.")
  .max(128, "Password cannot exceed 128 characters.");

const passwordConfirmation = {
  message: "Password and confirm password do not match.",
  path: ["confirmPassword"],
};

export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm password is required."),
  })
  .refine((data) => data.password === data.confirmPassword, passwordConfirmation);

export const registerAdminSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm password is required."),
    adminSecretKey: z.string().min(1, "Admin secret key is required."),
  })
  .refine((data) => data.password === data.confirmPassword, passwordConfirmation);

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required."),
});

export const googleLoginSchema = z.object({
  googleAccessToken: z.string().min(1, "Google access token is required."),
});

export const completeProfileSchema = z
  .object({
    name: nameSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm password is required."),
  })
  .refine((data) => data.password === data.confirmPassword, passwordConfirmation);

export const updateProfileSchema = z.object({
  name: nameSchema,
});

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm password is required."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirm password do not match.",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type RegisterAdminInput = z.infer<typeof registerAdminSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CompleteProfileInput = z.infer<typeof completeProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
