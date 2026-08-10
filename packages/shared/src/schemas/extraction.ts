import { z } from 'zod';

export const ServiceTypeEnum = z.enum(['boarding', 'grooming', 'daycare', 'sitting']);
export type ServiceType = z.infer<typeof ServiceTypeEnum>;

export const CompletenessEnum = z.enum(['complete', 'partial', 'incomplete']);
export type Completeness = z.infer<typeof CompletenessEnum>;

export const PetInfoSchema = z.object({
  name: z.string().nullable(),
  species: z.string().nullable(),
  breed: z.string().nullable(),
  age: z.string().nullable(),
  weight: z.string().nullable(),
  uncertainFields: z.array(z.string()),
});
export type PetInfo = z.infer<typeof PetInfoSchema>;

export const ServiceRequestSchema = z.object({
  type: ServiceTypeEnum,
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  checkInTime: z.string().nullable(),
  checkOutTime: z.string().nullable(),
  uncertainFields: z.array(z.string()),
});
export type ServiceRequest = z.infer<typeof ServiceRequestSchema>;

export const MedicationEntrySchema = z.object({
  name: z.string(),
  dosage: z.string().nullable(),
  frequency: z.string().nullable(),
  route: z.string().nullable(),
  instructions: z.string().nullable(),
  uncertainFields: z.array(z.string()),
});
export type MedicationEntry = z.infer<typeof MedicationEntrySchema>;

export const VaccinationEntrySchema = z.object({
  name: z.string(),
  expirationDate: z.string().nullable(),
  uncertainFields: z.array(z.string()),
});
export type VaccinationEntry = z.infer<typeof VaccinationEntrySchema>;

export const ExtractionResultSchema = z.object({
  pet: PetInfoSchema,
  services: z.array(ServiceRequestSchema),
  medications: z.array(MedicationEntrySchema),
  allergies: z.array(z.string()),
  behavioralConcerns: z.array(z.string()),
  feedingInstructions: z.string().nullable(),
  vaccinations: z.array(VaccinationEntrySchema),
  specialInstructions: z.string().nullable(),
  overallCompleteness: CompletenessEnum,
});
export type ExtractionResult = z.infer<typeof ExtractionResultSchema>;
