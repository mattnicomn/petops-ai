import { ValidationError } from '@petops-ai/shared';

export interface InputValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

const MAX_TEXT_LENGTH = 5000;
const MAX_BODY_SIZE_BYTES = 10240; // 10KB

export function validateCustomerRequestText(text: unknown): InputValidationResult {
  const errors: ValidationError[] = [];

  if (typeof text !== 'string') {
    errors.push({
      fieldPath: 'text',
      rule: 'type',
      message: 'Text must be a string',
    });
    return { valid: false, errors };
  }

  if (text.trim().length === 0) {
    errors.push({
      fieldPath: 'text',
      rule: 'required',
      message: 'Customer request cannot be empty or contain only whitespace',
    });
  }

  if (text.length > MAX_TEXT_LENGTH) {
    errors.push({
      fieldPath: 'text',
      rule: 'maxLength',
      message: `Customer request must not exceed ${MAX_TEXT_LENGTH} characters (received ${text.length})`,
    });
  }

  return { valid: errors.length === 0, errors };
}

export function validateRequestBodySize(bodyString: string): InputValidationResult {
  const byteLength = Buffer.byteLength(bodyString, 'utf-8');
  if (byteLength > MAX_BODY_SIZE_BYTES) {
    return {
      valid: false,
      errors: [
        {
          fieldPath: 'body',
          rule: 'maxSize',
          message: `Request body exceeds maximum size of ${MAX_BODY_SIZE_BYTES} bytes`,
        },
      ],
    };
  }
  return { valid: true, errors: [] };
}
