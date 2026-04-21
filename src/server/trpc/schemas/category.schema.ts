import { z } from 'zod/v4';

export const getAllCategoriesSchema = z.object({
  includeUnpublished: z.boolean().optional().default(false)
});
