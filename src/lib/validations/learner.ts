import { z } from "zod";
import { LEARNER_ROLES } from "@/types/learner";

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

const roleSchema = z.enum(LEARNER_ROLES).default("public");

const confirmationMismatch = {
  message: "Password and confirm password do not match.",
  path: ["confirmPassword"],
};

/** A new account cannot log in without a password, so it is mandatory here. */
export const learnerCreateInputSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    role: roleSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm password is required."),
  })
  .refine((data) => data.password === data.confirmPassword, confirmationMismatch);

/**
 * On an update both password fields may stay empty, which means "keep the
 * password that is already stored". Anything typed must still be a full
 * password and must still match its confirmation.
 */
export const learnerUpdateInputSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    role: roleSchema,
    password: z.string().default(""),
    confirmPassword: z.string().default(""),
  })
  .refine((data) => data.password === data.confirmPassword, confirmationMismatch)
  .refine(
    (data) => data.password === "" || passwordSchema.safeParse(data.password).success,
    { message: "Password must be at least 6 characters.", path: ["password"] },
  );

export type LearnerCreateInput = z.infer<typeof learnerCreateInputSchema>;
export type LearnerUpdateInput = z.infer<typeof learnerUpdateInputSchema>;
