import { z } from 'zod';

export const createAnalysisSchema = z.object({
  input: z.string().min(1),
});

export const idParamSchema = z.object({
  id: z.uuid(),
});
