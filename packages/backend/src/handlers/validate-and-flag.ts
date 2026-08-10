import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { ValidateAndFlagRequestSchema } from '@petops-ai/shared';
import { validateBusinessRules } from '../validation/business-rules.js';
import { detectAttentionFlags } from '../detection/attention-detector.js';
import { assembleCarePlan } from '../assembly/care-plan-assembler.js';

const MAX_BODY_BYTES = 10240;

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const correlationId = event.headers?.['x-correlation-id'] || randomUUID();

  try {
    // Validate body size
    if (event.body && Buffer.byteLength(event.body, 'utf-8') > MAX_BODY_BYTES) {
      return errorResponse(400, 'Request body exceeds maximum size of 10KB', correlationId);
    }

    // Parse and validate request
    const body = JSON.parse(event.body || '{}');
    const parsed = ValidateAndFlagRequestSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(400, 'Invalid request', correlationId, parsed.error.issues);
    }

    const { extractionResult, originalText } = parsed.data;

    // Business rule validation (deterministic)
    const validationResult = validateBusinessRules(extractionResult);

    // Attention flag detection (deterministic)
    const attentionFlags = detectAttentionFlags(extractionResult, originalText);

    // Assemble proposed care plan
    const proposedCarePlan = assembleCarePlan(extractionResult, validationResult, attentionFlags);

    console.log(JSON.stringify({
      correlationId,
      event: 'validate_and_flag_complete',
      validationStatus: validationResult.status,
      flagCount: attentionFlags.length,
      errorCount: validationResult.errors.length,
    }));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'X-Correlation-Id': correlationId },
      body: JSON.stringify({ correlationId, validationResult, attentionFlags, proposedCarePlan }),
    };
  } catch (err: unknown) {
    const error = err as Error;
    console.error(JSON.stringify({ correlationId, event: 'validate_error', error: error.message }));
    return errorResponse(500, 'An unexpected error occurred during validation', correlationId);
  }
};

function errorResponse(status: number, message: string, correlationId: string, details?: unknown): APIGatewayProxyResultV2 {
  return {
    statusCode: status,
    headers: { 'Content-Type': 'application/json', 'X-Correlation-Id': correlationId },
    body: JSON.stringify({ error: message, correlationId, ...(details ? { details } : {}) }),
  };
}
