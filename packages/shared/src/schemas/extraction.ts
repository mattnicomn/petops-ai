import { z } from 'zod';

export const ServiceTypeEnum = z.enum(['boarding', 'grooming', 'daycare', 'sitting']);
export type ServiceType = z.infer<typeof ServiceTypeEnum>;

export const CompletenessEnum = z.enum(['complete', 'partial', 'incomplete']);
export type Completeness = z.infer<typeof CompletenessEnum>;

export const PetInfoSchema = z.object({
  name: z.string().nullish().default(null),
  species: z.string().nullish().default(null),
  breed: z.string().nullish().default(null),
  age: z.string().nullish().default(null),
  weight: z.string().nullish().default(null),
  uncertainFields: z.array(z.string()).default([]),
});
export type PetInfo = z.infer<typeof PetInfoSchema>;

export const ServiceRequestSchema = z.object({
  type: ServiceTypeEnum,
  startDate: z.string().nullish().default(null),
  endDate: z.string().nullish().default(null),
  checkInTime: z.string().nullish().default(null),
  checkOutTime: z.string().nullish().default(null),
  uncertainFields: z.array(z.string()).default([]),
});
export type ServiceRequest = z.infer<typeof ServiceRequestSchema>;

export const MedicationEntrySchema = z.object({
  name: z.string(),
  dosage: z.string().nullish().default(null),
  frequency: z.string().nullish().default(null),
  route: z.string().nullish().default(null),
  instructions: z.string().nullish().default(null),
  uncertainFields: z.array(z.string()).default([]),
});
export type MedicationEntry = z.infer<typeof MedicationEntrySchema>;

export const VaccinationEntrySchema = z.object({
  name: z.string(),
  expirationDate: z.string().nullish().default(null),
  uncertainFields: z.array(z.string()).default([]),
});
export type VaccinationEntry = z.infer<typeof VaccinationEntrySchema>;

export const ExtractionResultSchema = z.object({
  pet: PetInfoSchema,
  services: z.array(ServiceRequestSchema).default([]),
  medications: z.array(MedicationEntrySchema).default([]),
  allergies: z.array(z.string()).default([]),
  behavioralConcerns: z.array(z.string()).default([]),
  feedingInstructions: z.string().nullish().default(null),
  vaccinations: z.array(VaccinationEntrySchema).default([]),
  specialInstructions: z.string().nullish().default(null),
  overallCompleteness: CompletenessEnum,
});
export type ExtractionResult = z.infer<typeof ExtractionResultSchema>;
