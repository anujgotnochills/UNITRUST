import { z } from 'zod';

export const certificateSchema = z.object({
  studentWallet: z.string().min(1, 'Student wallet is required').startsWith('0x', 'Must be a valid wallet address'),
  studentName: z.string().min(1, 'Student name is required'),
  title: z.string().min(1, 'Certificate title is required'),
  course: z.string().min(1, 'Course name is required'),
  issueDate: z.string().min(1, 'Issue date is required'),
  certificateType: z.enum(['Academic', 'Professional', 'Achievement'], {
    required_error: 'Certificate type is required',
  }),
  carbonScore: z.number().min(0).default(0),
  sustainabilityTag: z.enum(['Green', 'Neutral', 'High Impact']).default('Green'),
  ecoDescription: z.string().optional(),
});

export type CertificateFormData = z.infer<typeof certificateSchema>;
