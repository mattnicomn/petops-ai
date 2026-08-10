import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { validateCustomerRequestText } from './input-validator';

describe('Input Validation Properties', () => {
  it('never throws for arbitrary string input', () => {
    fc.assert(
      fc.property(fc.string(), (text) => {
        const result = validateCustomerRequestText(text);
        expect(result).toBeDefined();
        expect(typeof result.valid).toBe('boolean');
        expect(Array.isArray(result.errors)).toBe(true);
      }),
      { numRuns: 200 }
    );
  });

  it('rejects all strings exceeding 5000 characters', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 5001, maxLength: 10000 }),
        (text) => {
          const result = validateCustomerRequestText(text);
          expect(result.valid).toBe(false);
          expect(result.errors.some(e => e.rule === 'maxLength')).toBe(true);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('accepts all non-empty strings within length limit that contain non-whitespace', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 5000 }).filter(s => s.trim().length > 0),
        (text) => {
          const result = validateCustomerRequestText(text);
          expect(result.valid).toBe(true);
        }
      ),
      { numRuns: 200 }
    );
  });

  it('returns a defined result for arbitrary non-string inputs', () => {
    fc.assert(
      fc.property(
        fc.oneof(fc.integer(), fc.boolean(), fc.constant(null), fc.constant(undefined), fc.array(fc.integer())),
        (input) => {
          const result = validateCustomerRequestText(input);
          expect(result.valid).toBe(false);
        }
      ),
      { numRuns: 50 }
    );
  });
});
