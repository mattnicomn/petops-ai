import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { validateBusinessRules } from './business-rules';
import type { ExtractionResult } from '@petops-ai/shared';

function makeExtraction(services: ExtractionResult['services']): ExtractionResult {
  return {
    pet: { name: 'Test', species: null, breed: null, age: null, weight: null, uncertainFields: [] },
    services,
    medications: [],
    allergies: [],
    behavioralConcerns: [],
    feedingInstructions: null,
    vaccinations: [],
    specialInstructions: null,
    overallCompleteness: 'partial',
  };
}

describe('Business Rules Properties', () => {
  it('deterministic: identical input always produces identical output', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('boarding', 'grooming', 'daycare', 'sitting') as fc.Arbitrary<'boarding' | 'grooming' | 'daycare' | 'sitting'>,
        fc.oneof(fc.constant(null), fc.constant('2024-08-15'), fc.constant('2024-08-20'), fc.constant('2025-01-01')),
        fc.oneof(fc.constant(null), fc.constant('2024-08-18'), fc.constant('2024-08-25'), fc.constant('2024-07-01')),
        (type, startDate, endDate) => {
          const services = [{ type, startDate, endDate, checkInTime: null, checkOutTime: null, uncertainFields: [] as string[] }];
          const result1 = validateBusinessRules(makeExtraction(services));
          const result2 = validateBusinessRules(makeExtraction(services));
          expect(result1).toEqual(result2);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('end date before start date always produces a dateRange error', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2024-01-02'), max: new Date('2025-12-31') }),
        (endDate) => {
          const start = new Date(endDate);
          start.setDate(start.getDate() + 1); // start is AFTER end
          const services = [{
            type: 'boarding' as const,
            startDate: start.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            checkInTime: null, checkOutTime: null, uncertainFields: [] as string[],
          }];
          const extraction = makeExtraction(services);
          extraction.pet.name = 'Test'; // satisfy required field
          const result = validateBusinessRules(extraction);
          expect(result.errors.some(e => e.rule === 'dateRange')).toBe(true);
        }
      ),
      { numRuns: 50 }
    );
  });
});
