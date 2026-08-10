import { z } from 'zod';

export const ValidationErrorSchema = z.object({
  fieldPath: z.string(),
  rule: z.string(),
  message: z.string(),
});
export type ValidationError = z.infer<typeof ValidationErrorSchema>;

export const ValidationResultSchema = z.object({
  status: z.enum(['passed', 'failed']),
  errors: z.array(ValidationErrorSchema),
});
export type ValidationResult = z.infer<typeof ValidationResultSchema>;
