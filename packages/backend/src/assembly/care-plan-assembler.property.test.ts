import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { assembleCarePlan } from './care-plan-assembler';
import type { ExtractionResult, ValidationResult, AttentionFlag } from '@petops-ai/shared';

const passedValidation: ValidationResult = { status: 'passed', errors: [] };

function arbitraryExtraction(): fc.Arbitrary<ExtractionResult> {
  return fc.record({
    pet: fc.record({
      name: fc.option(fc.string({ minLength: 1, maxLength: 20 })).map(v => v ?? null),
      species: fc.constant(null),
      breed: fc.constant(null),
      age: fc.constant(null),
      weight: fc.constant(null),
      uncertainFields: fc.array(fc.string({ minLength: 1, maxLength: 10 }), { maxLength: 3 }),
    }),
    services: fc.array(fc.record({
      type: fc.constantFrom('boarding', 'grooming', 'daycare', 'sitting') as fc.Arbitrary<'boarding' | 'grooming' | 'daycare' | 'sitting'>,
      startDate: fc.constant(null),
      endDate: fc.constant(null),
      checkInTime: fc.constant(null),
      checkOutTime: fc.constant(null),
      uncertainFields: fc.array(fc.string(), { maxLength: 2 }),
    }), { maxLength: 2 }),
    medications: fc.array(fc.record({
      name: fc.string({ minLength: 1, maxLength: 15 }),
      dosage: fc.option(fc.string()).map(v => v ?? null),
      frequency: fc.option(fc.string()).map(v => v ?? null),
      route: fc.constant(null),
      instructions: fc.constant(null),
      uncertainFields: fc.array(fc.string(), { maxLength: 2 }),
    }), { maxLength: 2 }),
    allergies: fc.array(fc.string({ minLength: 1, maxLength: 15 }), { maxLength: 2 }),
    behavioralConcerns: fc.array(fc.string({ minLength: 1, maxLength: 30 }), { maxLength: 2 }),
    feedingInstructions: fc.constant(null),
    vaccinations: fc.constant([]),
    specialInstructions: fc.option(fc.string({ maxLength: 50 })).map(v => v ?? null),
    overallCompleteness: fc.constantFrom('complete', 'partial', 'incomplete') as fc.Arbitrary<'complete' | 'partial' | 'incomplete'>,
  });
}

describe('Care Plan Assembly Properties', () => {
  it('always produces all required structural sections', () => {
    fc.assert(
      fc.property(arbitraryExtraction(), (extraction) => {
        const plan = assembleCarePlan(extraction, passedValidation, []);
        expect(plan.sections.petInformation).toBeDefined();
        expect(plan.sections.services).toBeDefined();
        expect(plan.sections.schedules).toBeDefined();
        expect(plan.sections.medications).toBeDefined();
        expect(plan.sections.attentionFlags).toBeDefined();
        expect(plan.sections.specialInstructions).toBeDefined();
      }),
      { numRuns: 100 }
    );
  });

  it('uncertainty count is never negative', () => {
    fc.assert(
      fc.property(arbitraryExtraction(), (extraction) => {
        const plan = assembleCarePlan(extraction, passedValidation, []);
        expect(plan.uncertainFieldCount).toBeGreaterThanOrEqual(0);
      }),
      { numRuns: 100 }
    );
  });

  it('does not invent data absent from extraction', () => {
    fc.assert(
      fc.property(arbitraryExtraction(), (extraction) => {
        const plan = assembleCarePlan(extraction, passedValidation, []);
        // Pet info should match extraction
        expect(plan.sections.petInformation.name).toBe(extraction.pet.name);
        // Services count should match
        expect(plan.sections.services.length).toBe(extraction.services.length);
      }),
      { numRuns: 100 }
    );
  });
});
