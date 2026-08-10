import { z } from 'zod';
import { PetInfoSchema, ServiceRequestSchema, MedicationEntrySchema } from './extraction.js';
import { ValidationResultSchema } from './validation.js';
import { AttentionFlagSchema } from './attention-flag.js';

export const MissingFieldPlaceholderSchema = z.object({
  fieldPath: z.string(),
  label: z.string(),
  requiredFor: z.string(),
});
export type MissingFieldPlaceholder = z.infer<typeof MissingFieldPlaceholderSchema>;

export const ScheduleEntrySchema = z.object({
  time: z.string(),
  type: z.enum(['medication', 'feeding', 'service']),
  description: z.string(),
});
export type ScheduleEntry = z.infer<typeof ScheduleEntrySchema>;

export const DailyScheduleSchema = z.object({
  date: z.string(),
  entries: z.array(ScheduleEntrySchema),
});
export type DailySchedule = z.infer<typeof DailyScheduleSchema>;

export const MedicationScheduleEntrySchema = z.object({
  medicationName: z.string(),
  time: z.string(),
  dosage: z.string(),
  instructions: z.string(),
});
export type MedicationScheduleEntry = z.infer<typeof MedicationScheduleEntrySchema>;

export const ProposedCarePlanSchema = z.object({
  sections: z.object({
    petInformation: PetInfoSchema,
    services: z.array(ServiceRequestSchema),
    schedules: z.array(DailyScheduleSchema),
    medications: z.array(MedicationScheduleEntrySchema),
    attentionFlags: z.array(AttentionFlagSchema),
    specialInstructions: z.array(z.string()),
  }),
  validationResult: ValidationResultSchema,
  missingFields: z.array(MissingFieldPlaceholderSchema),
  uncertainFieldCount: z.number().int().min(0),
});
export type ProposedCarePlan = z.infer<typeof ProposedCarePlanSchema>;

export const CarePlanStatusEnum = z.enum(['draft', 'approved', 'rejected']);
export type CarePlanStatus = z.infer<typeof CarePlanStatusEnum>;

export const StoredCarePlanSchema = z.object({
  id: z.string().uuid(),
  status: CarePlanStatusEnum,
  createdAt: z.string(),
  updatedAt: z.string(),
  decisionAt: z.string().nullable(),
  originalRequest: z.string(),
  extractionResult: z.lazy(() => z.any()), // Full ExtractionResult stored as JSON
  attentionFlags: z.array(AttentionFlagSchema),
  carePlan: ProposedCarePlanSchema,
  correlationId: z.string(),
  petName: z.string(),
  serviceType: z.string(),
});
export type StoredCarePlan = z.infer<typeof StoredCarePlanSchema>;

export const CarePlanSummarySchema = z.object({
  id: z.string().uuid(),
  petName: z.string(),
  serviceType: z.string(),
  status: CarePlanStatusEnum,
  createdAt: z.string(),
});
export type CarePlanSummary = z.infer<typeof CarePlanSummarySchema>;
