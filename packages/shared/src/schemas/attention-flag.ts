import { z } from 'zod';

export const FlagSeverityEnum = z.enum(['high', 'medium', 'low']);
export type FlagSeverity = z.infer<typeof FlagSeverityEnum>;

export const FlagCategoryEnum = z.enum([
  'medication_gap',
  'vaccination_timing',
  'behavioral',
  'allergy',
]);
export type FlagCategory = z.infer<typeof FlagCategoryEnum>;

export const AttentionFlagSchema = z.object({
  id: z.string().uuid(),
  severity: FlagSeverityEnum,
  category: FlagCategoryEnum,
  title: z.string(),
  explanation: z.string(),
  sourceText: z.string(),
  fieldPath: z.string(),
});
export type AttentionFlag = z.infer<typeof AttentionFlagSchema>;
