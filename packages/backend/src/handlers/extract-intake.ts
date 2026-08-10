import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import { randomUUID } from 'crypto';
import { ExtractionResultSchema, ExtractRequestSchema } from '@petops-ai/shared';

const client = new BedrockRuntimeClient({ region: 'us-east-1' });
const MODEL_ID = 'us.anthropic.claude-haiku-4-5-20251001-v1:0';
const MAX_BODY_BYTES = 10240;

const SYSTEM_PROMPT = `You are an AI extraction assistant for a pet-care business operations system called PetOps AI.

Your job is to extract structured information from unstructured customer requests about pet care services.
You MUST respond with ONLY a valid JSON object — no markdown, no code fences, no explanation text.

Extract the following when present:
- Pet information: name, species, breed, age, weight
- Services requested: boarding, grooming, daycare, sitting (with dates/times)
- Medications: name, dosage, frequency, route, instructions
- Allergies
- Behavioral concerns
- Feeding instructions
- Vaccinations: name, expiration date
- Special instructions

Rules:
- Respond with ONLY the JSON object, nothing else
- If information is not present or is ambiguous, set the field to null
- Add the field name to the "uncertainFields" array when you are not confident about a value
- Use ISO 8601 format for dates (YYYY-MM-DD)
- Use HH:mm format for times
- Set overallCompleteness to "complete" if all key fields are present, "partial" if some are missing, "incomplete" if very little was extractable
- Do not fabricate information. Only extract what is explicitly stated or clearly implied.
- For service type, choose from: boarding, grooming, daycare, sitting

Required JSON structure:
{"pet":{"name":null,"species":null,"breed":null,"age":null,"weight":null,"uncertainFields":[]},"services":[],"medications":[],"allergies":[],"behavioralConcerns":[],"feedingInstructions":null,"vaccinations":[],"specialInstructions":null,"overallCompleteness":"incomplete"}`;

// Bedrock-compatible JSON Schema for structured output constraint
const EXTRACTION_JSON_SCHEMA = JSON.stringify({
  type: 'object',
  properties: {
    pet: {
      type: 'object',
      properties: {
        name: { anyOf: [{ type: 'string' }, { type: 'null' }] },
        species: { anyOf: [{ type: 'string' }, { type: 'null' }] },
        breed: { anyOf: [{ type: 'string' }, { type: 'null' }] },
        age: { anyOf: [{ type: 'string' }, { type: 'null' }] },
        weight: { anyOf: [{ type: 'string' }, { type: 'null' }] },
        uncertainFields: { type: 'array', items: { type: 'string' } },
      },
      required: ['name', 'species', 'breed', 'age', 'weight', 'uncertainFields'],
      additionalProperties: false,
    },
    services: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['boarding', 'grooming', 'daycare', 'sitting'] },
          startDate: { anyOf: [{ type: 'string' }, { type: 'null' }] },
          endDate: { anyOf: [{ type: 'string' }, { type: 'null' }] },
          checkInTime: { anyOf: [{ type: 'string' }, { type: 'null' }] },
          checkOutTime: { anyOf: [{ type: 'string' }, { type: 'null' }] },
          uncertainFields: { type: 'array', items: { type: 'string' } },
        },
        required: ['type', 'startDate', 'endDate', 'checkInTime', 'checkOutTime', 'uncertainFields'],
        additionalProperties: false,
      },
    },
    medications: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          dosage: { anyOf: [{ type: 'string' }, { type: 'null' }] },
          frequency: { anyOf: [{ type: 'string' }, { type: 'null' }] },
          route: { anyOf: [{ type: 'string' }, { type: 'null' }] },
          instructions: { anyOf: [{ type: 'string' }, { type: 'null' }] },
          uncertainFields: { type: 'array', items: { type: 'string' } },
        },
        required: ['name', 'dosage', 'frequency', 'route', 'instructions', 'uncertainFields'],
        additionalProperties: false,
      },
    },
    allergies: { type: 'array', items: { type: 'string' } },
    behavioralConcerns: { type: 'array', items: { type: 'string' } },
    feedingInstructions: { anyOf: [{ type: 'string' }, { type: 'null' }] },
    vaccinations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          expirationDate: { anyOf: [{ type: 'string' }, { type: 'null' }] },
          uncertainFields: { type: 'array', items: { type: 'string' } },
        },
        required: ['name', 'expirationDate', 'uncertainFields'],
        additionalProperties: false,
      },
    },
    specialInstructions: { anyOf: [{ type: 'string' }, { type: 'null' }] },
    overallCompleteness: { type: 'string', enum: ['complete', 'partial', 'incomplete'] },
  },
  required: ['pet', 'services', 'medications', 'allergies', 'behavioralConcerns', 'feedingInstructions', 'vaccinations', 'specialInstructions', 'overallCompleteness'],
  additionalProperties: false,
});

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const correlationId = event.headers?.['x-correlation-id'] || randomUUID();
  const startTime = Date.now();

  try {
    // Validate body size
    if (event.body && Buffer.byteLength(event.body, 'utf-8') > MAX_BODY_BYTES) {
      return errorResponse(400, 'Request body exceeds maximum size of 10KB', correlationId);
    }

    // Parse and validate request
    const body = JSON.parse(event.body || '{}');
    const parsed = ExtractRequestSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(400, 'Invalid request', correlationId, parsed.error.issues);
    }

    const { text } = parsed.data;

    // Validate text is not whitespace-only
    if (text.trim().length === 0) {
      return errorResponse(400, 'Customer request cannot be empty or contain only whitespace', correlationId);
    }

    // Call Bedrock with Structured Outputs
    const extractionResult = await invokeBedrockWithRetry(text, correlationId);

    // Local Zod validation (defense in depth — even with Structured Outputs)
    const validated = ExtractionResultSchema.safeParse(extractionResult);
    if (!validated.success) {
      console.error(JSON.stringify({ correlationId, event: 'zod_validation_failed', errors: validated.error.issues }));
      return errorResponse(422, 'AI extraction produced invalid structure. Please try again.', correlationId);
    }

    const processingTimeMs = Date.now() - startTime;
    console.log(JSON.stringify({ correlationId, event: 'extraction_complete', processingTimeMs }));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'X-Correlation-Id': correlationId },
      body: JSON.stringify({ correlationId, extractionResult: validated.data, processingTimeMs }),
    };
  } catch (err: unknown) {
    const error = err as Error;
    console.error(JSON.stringify({ correlationId, event: 'extraction_error', error: error.message, name: error.name }));

    if (error.name === 'ThrottlingException' || error.name === 'ServiceUnavailableException') {
      return errorResponse(503, 'AI processing is temporarily unavailable. Please try again.', correlationId);
    }
    if (error.message?.includes('timeout') || error.name === 'TimeoutError') {
      return errorResponse(504, 'Processing took too long. Please try again.', correlationId);
    }
    return errorResponse(500, 'An unexpected error occurred', correlationId);
  }
};

async function invokeBedrockWithRetry(text: string, correlationId: string): Promise<unknown> {
  try {
    return await invokeConverse(text, correlationId);
  } catch (err: unknown) {
    const error = err as Error;
    // Retry once for transient errors
    if (error.name === 'ThrottlingException' || error.name === 'ServiceUnavailableException' || error.name === 'InternalServerException') {
      console.log(JSON.stringify({ correlationId, event: 'bedrock_retry', reason: error.name }));
      await new Promise((r) => setTimeout(r, 1000));
      return await invokeConverse(text, correlationId);
    }
    throw error;
  }
}

async function invokeConverse(text: string, correlationId: string): Promise<unknown> {
  const command = new ConverseCommand({
    modelId: MODEL_ID,
    messages: [
      {
        role: 'user',
        content: [{ text: `Extract structured information from this customer request:\n\n${text}` }],
      },
    ],
    system: [{ text: SYSTEM_PROMPT }],
    inferenceConfig: { maxTokens: 2048, temperature: 0 },
    // PRIMARY PATH: Bedrock Structured Outputs constrains model to valid JSON schema
    outputConfig: {
      textFormat: {
        type: 'json_schema',
        structure: {
          jsonSchema: {
            name: 'petops_ai_extraction',
            description: 'Structured pet-care intake extraction result',
            schema: EXTRACTION_JSON_SCHEMA,
          },
        },
      },
    },
  });

  const response = await client.send(command);

  console.log(JSON.stringify({
    correlationId,
    event: 'bedrock_response',
    stopReason: response.stopReason,
    inputTokens: response.usage?.inputTokens,
    outputTokens: response.usage?.outputTokens,
  }));

  const content = response.output?.message?.content;
  if (!content || content.length === 0) {
    throw new Error('Empty response from Bedrock');
  }

  // Find text block explicitly
  const textBlock = content.find((block) => 'text' in block && block.text);
  if (!textBlock || !('text' in textBlock) || !textBlock.text) {
    throw new Error(`No text content in Bedrock response. Block types: ${content.map((b) => Object.keys(b)).join(',')}`);
  }

  const rawText = textBlock.text.trim();

  // PRIMARY PATH: Structured Outputs returns clean JSON directly.
  // DEFENSIVE FALLBACK: If normalization needed (should not occur with bundled SDK).
  const jsonText = rawText.startsWith('{') ? rawText : stripMarkdownFences(rawText);

  if (!rawText.startsWith('{')) {
    console.warn(JSON.stringify({ correlationId, event: 'unexpected_normalization_required', firstChar: rawText[0] }));
  }

  const parsed = JSON.parse(jsonText);
  return parsed;
}

/** Fallback: strip markdown code fences if Structured Outputs was bypassed */
function stripMarkdownFences(text: string): string {
  if (text.startsWith('```')) {
    return text
      .replace(/^```(?:json)?\s*\n?/, '')
      .replace(/\n?```\s*$/, '')
      .trim();
  }
  return text;
}

function errorResponse(status: number, message: string, correlationId: string, details?: unknown): APIGatewayProxyResultV2 {
  return {
    statusCode: status,
    headers: { 'Content-Type': 'application/json', 'X-Correlation-Id': correlationId },
    body: JSON.stringify({ error: message, correlationId, ...(details ? { details } : {}) }),
  };
}
