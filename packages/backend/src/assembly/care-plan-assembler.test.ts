import { describe, it, expect } from 'vitest';
import { assembleCarePlan } from './care-plan-assembler';
import type { ExtractionResult, ValidationResult, AttentionFlag } from '@petops-ai/shared';

function makeExtraction(overrides: Partial<ExtractionResult> = {}): ExtractionResult {
  return {
    pet: { name: 'Bentley', species: 'dog', breed: 'Golden Retriever', age: '4', weight: '65 lbs', uncertainFields: ['age'] },
    services: [{ type: 'boarding', startDate: '2024-08-15', endDate: '2024-08-18', checkInTime: null, checkOutTime: null, uncertainFields: ['checkInTime'] }],
    medications: [{ name: 'Apoquel', dosage: '5mg', frequency: 'every morning', route: 'oral', instructions: 'with food', uncertainFields: [] }],
    allergies: [],
    behavioralConcerns: ['nervous around large dogs'],
    feedingInstructions: '2 cups twice daily',
    vaccinations: [{ name: 'rabies', expirationDate: '2025-01-01', uncertainFields: [] }],
    specialInstructions: 'Bath before pickup',
    overallCompleteness: 'complete',
    ...overrides,
  };
}

const passedValidation: ValidationResult = { status: 'passed', errors: [] };
const failedValidation: ValidationResult = {
  status: 'failed',
  errors: [{ fieldPath: 'services[0].startDate', rule: 'required', message: 'Start date is required for boarding service' }],
};

const sampleFlags: AttentionFlag[] = [
  { id: 'flag-1', severity: 'medium', category: 'behavioral', title: 'Behavioral concern', explanation: 'Nervous around large dogs', sourceText: 'nervous around large dogs', fieldPath: 'behavioralConcerns[0]' },
];

describe('assembleCarePlan', () => {
  it('produces all required sections', () => {
    const plan = assembleCarePlan(makeExtraction(), passedValidation, sampleFlags);
    expect(plan.sections.petInformation).toBeDefined();
    expect(plan.sections.services).toBeDefined();
    expect(plan.sections.schedules).toBeDefined();
    expect(plan.sections.medications).toBeDefined();
    expect(plan.sections.attentionFlags).toBeDefined();
    expect(plan.sections.specialInstructions).toBeDefined();
  });

  it('includes pet information from extraction', () => {
    const plan = assembleCarePlan(makeExtraction(), passedValidation, []);
    expect(plan.sections.petInformation.name).toBe('Bentley');
    expect(plan.sections.petInformation.breed).toBe('Golden Retriever');
  });

  it('carries attention flags through', () => {
    const plan = assembleCarePlan(makeExtraction(), passedValidation, sampleFlags);
    expect(plan.sections.attentionFlags).toHaveLength(1);
    expect(plan.sections.attentionFlags[0].severity).toBe('medium');
  });

  it('creates medication schedule entries', () => {
    const plan = assembleCarePlan(makeExtraction(), passedValidation, []);
    expect(plan.sections.medications.length).toBeGreaterThan(0);
    expect(plan.sections.medications[0].medicationName).toBe('Apoquel');
  });

  it('generates missing field placeholders from validation errors', () => {
    const plan = assembleCarePlan(makeExtraction(), failedValidation, []);
    expect(plan.missingFields.length).toBeGreaterThan(0);
    expect(plan.missingFields[0].fieldPath).toContain('startDate');
  });

  it('returns empty missingFields when validation passes', () => {
    const plan = assembleCarePlan(makeExtraction(), passedValidation, []);
    expect(plan.missingFields).toHaveLength(0);
  });

  it('counts uncertain fields correctly', () => {
    const plan = assembleCarePlan(makeExtraction(), passedValidation, []);
    // pet has 1 uncertainField ('age') + service has 1 ('checkInTime') = 2
    expect(plan.uncertainFieldCount).toBe(2);
  });

  it('includes special instructions', () => {
    const plan = assembleCarePlan(makeExtraction(), passedValidation, []);
    expect(plan.sections.specialInstructions).toContain('Bath before pickup');
  });

  it('includes feeding instructions in special instructions', () => {
    const plan = assembleCarePlan(makeExtraction(), passedValidation, []);
    expect(plan.sections.specialInstructions).toContain('2 cups twice daily');
  });

  it('does not fabricate information not in extraction', () => {
    const extraction = makeExtraction({ specialInstructions: null, feedingInstructions: null });
    const plan = assembleCarePlan(extraction, passedValidation, []);
    expect(plan.sections.specialInstructions).toHaveLength(0);
  });
});
