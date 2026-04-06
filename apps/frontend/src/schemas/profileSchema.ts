import { z } from 'zod';

export const userProfileSchema = z.object({
  name: z.string().optional(),
  profilePic: z.string().optional(),
});

export const instituteProfileSchema = z.object({
  instituteName: z.string().min(1, 'Institute name is required'),
  logo: z.string().optional(),
});

export type UserProfileFormData = z.infer<typeof userProfileSchema>;
export type InstituteProfileFormData = z.infer<typeof instituteProfileSchema>;
