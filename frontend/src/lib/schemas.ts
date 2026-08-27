import { z } from "zod";

/**
 * Form schemas, mirroring the backend's `src/schemas/*`.
 *
 * These exist so the form validates with exactly the rules the server will
 * apply — the user gets the same message inline that they would have got from a
 * round trip, and the two cannot drift into disagreeing about what is valid.
 *
 * If a rule changes in the backend, change it here in the same commit.
 */

export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(128, "That is too long.")
  .regex(/[a-z]/, "Include a lowercase letter.")
  .regex(/[A-Z]/, "Include an uppercase letter.")
  .regex(/[0-9]/, "Include a number.");

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Tell us your name.")
    .max(80, "That name is too long."),
  email: z.string().trim().toLowerCase().email("That is not a valid email."),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("That is not a valid email."),
  password: z.string().min(1, "Enter your password."),
});

/** Today as YYYY-MM-DD, compared as a string to avoid timezone drift. */
function todayAsDateString(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export const bookingSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Tell us who the booking is for.")
    .max(80, "That name is too long."),
  date: z
    .string()
    .min(1, "Pick a date.")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the date picker to choose a day.")
    // Lexicographic order matches chronological order for zero-padded dates.
    .refine((value) => value >= todayAsDateString(), "You cannot book a date in the past."),
  persons: z.coerce
    .number()
    .int("Enter a whole number of people.")
    .min(1, "At least one person.")
    .max(20, "For groups over 20, please contact us."),
});

export const reviewSchema = z.object({
  rating: z.coerce
    .number()
    .int()
    .min(1, "Pick at least one star.")
    .max(5, "Five stars is the maximum."),
  title: z.string().trim().max(120, "Keep the title under 120 characters.").optional(),
  body: z
    .string()
    .trim()
    .min(10, "Tell us a little more — at least 10 characters.")
    .max(2000, "That review is too long."),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Tell us your name.").max(80, "That name is too long."),
});

export type RegisterValues = z.infer<typeof registerSchema>;
export type LoginValues = z.infer<typeof loginSchema>;
export type BookingValues = z.infer<typeof bookingSchema>;
export type ReviewValues = z.infer<typeof reviewSchema>;
export type ProfileValues = z.infer<typeof profileSchema>;
