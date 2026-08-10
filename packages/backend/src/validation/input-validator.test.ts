import { describe, it, expect } from 'vitest';
import { validateCustomerRequestText, validateRequestBodySize } from './input-validator';

describe('validateCustomerRequestText', () => {
  it('accepts valid text', () => {
    const result = validateCustomerRequestText('Bentley needs boarding');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects empty string', () => {
    const result = validateCustomerRequestText('');
    expect(result.valid).toBe(false);
    expect(result.errors[0].rule).toBe('required');
  });

  it('rejects whitespace-only string', () => {
    const result = validateCustomerRequestText('   \n\t  ');
    expect(result.valid).toBe(false);
    expect(result.errors[0].rule).toBe('required');
  });

  it('rejects text exceeding 5000 characters', () => {
    const longText = 'a'.repeat(5001);
    const result = validateCustomerRequestText(longText);
    expect(result.valid).toBe(false);
    expect(result.errors[0].rule).toBe('maxLength');
  });

  it('accepts text at exactly 5000 characters', () => {
    const maxText = 'a'.repeat(5000);
    const result = validateCustomerRequestText(maxText);
    expect(result.valid).toBe(true);
  });

  it('rejects non-string input', () => {
    const result = validateCustomerRequestText(123 as unknown);
    expect(result.valid).toBe(false);
    expect(result.errors[0].rule).toBe('type');
  });

  it('accepts single character', () => {
    const result = validateCustomerRequestText('x');
    expect(result.valid).toBe(true);
  });
});

describe('validateRequestBodySize', () => {
  it('accepts body under 10KB', () => {
    const result = validateRequestBodySize('{"text":"hello"}');
    expect(result.valid).toBe(true);
  });

  it('rejects body over 10KB', () => {
    const largeBody = JSON.stringify({ text: 'x'.repeat(11000) });
    const result = validateRequestBodySize(largeBody);
    expect(result.valid).toBe(false);
    expect(result.errors[0].rule).toBe('maxSize');
  });
});
