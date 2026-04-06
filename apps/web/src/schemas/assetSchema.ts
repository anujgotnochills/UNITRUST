import { z } from 'zod';

export const assetSchema = z.object({
  name: z.string().min(1, 'Asset name is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.enum(['Electronics', 'Document', 'Property', 'Vehicle', 'Other'], {
    required_error: 'Category is required',
  }),
  carbonScore: z.number().min(0).default(0),
  sustainabilityTag: z.enum(['Green', 'Neutral', 'High Impact']).default('Green'),
  ecoDescription: z.string().optional(),
});

export type AssetFormData = z.infer<typeof assetSchema>;
