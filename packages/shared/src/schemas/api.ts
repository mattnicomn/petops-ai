import { z } from 'zod';
import { ExtractionResultSchema } from './extraction.js';
import { AttentionFlagSchema } from './attention-flag.js';
import { ProposedCarePlanSchema, CarePlanSummarySchema, StoredCarePlanSchema } from './care-plan.js';
import { ValidationResultSchema } from './validation.js';

// POST /api/extract
export const ExtractRequestSchema = z.object({
  text: z.string().min(1).max(5000),
  correlationId: z.string().optional(),
});
export type ExtractRequest = z.infer<typeof ExtractRequestSchema>;

export const ExtractResponseSchema = z.object({
  correlationId: z.string(),
  extractionResult: ExtractionResultSchema,
  processingTimeMs: z.number(),
});
export type ExtractResponse = z.infer<typeof ExtractResponseSchema>;

// POST /api/validate-and-flag
export const ValidateAndFlagRequestSchema = z.object({
  extractionResult: ExtractionResultSchema,
  originalText: z.string(),
  correlationId: z.string(),
});
export type ValidateAndFlagRequest = z.infer<typeof ValidateAndFlagRequestSchema>;

export const ValidateAndFlagResponseSchema = z.object({
  correlationId: z.string(),
  validationResult: ValidationResultSchema,
  attentionFlags: z.array(AttentionFlagSchema),
  proposedCarePlan: ProposedCarePlanSchema,
});
export type ValidateAndFlagResponse = z.infer<typeof ValidateAndFlagResponseSchema>;

// POST /api/care-plans
export const CreateCarePlanRequestSchema = z.object({
  originalRequest: z.string(),
  extractionResult: ExtractionResultSchema,
  attentionFlags: z.array(AttentionFlagSchema),
  carePlan: ProposedCarePlanSchema,
  status: z.literal('approved'),
  correlationId: z.string(),
});
export type CreateCarePlanRequest = z.infer<typeof CreateCarePlanRequestSchema>;

export const CreateCarePlanResponseSchema = z.object({
  id: z.string().uuid(),
  status: z.literal('approved'),
  createdAt: z.string(),
  correlationId: z.string(),
});
export type CreateCarePlanResponse = z.infer<typeof CreateCarePlanResponseSchema>;

// GET /api/care-plans
export const ListCarePlansResponseSchema = z.object({
  items: z.array(CarePlanSummarySchema),
  correlationId: z.string(),
});
export type ListCarePlansResponse = z.infer<typeof ListCarePlansResponseSchema>;

// GET /api/care-plans/:id
export const GetCarePlanResponseSchema = z.object({
  carePlan: StoredCarePlanSchema,
  correlationId: z.string(),
});
export type GetCarePlanResponse = z.infer<typeof GetCarePlanResponseSchema>;

// Error response
export const ApiErrorResponseSchema = z.object({
  error: z.string(),
  details: z.any().optional(),
  correlationId: z.string(),
});
export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;
