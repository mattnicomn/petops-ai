import { describe, it, expect } from 'vitest';
import { validateBusinessRules } from './business-rules';
import type { ExtractionResult } from '@petops-ai/shared';

function makeExtraction(overrides: Partial<ExtractionResult> = {}): ExtractionResult {
  return {
    pet: { name: null, species: null, breed: null, age: null, weight: null, uncertainFields: [] },
    services: [],
    medications: [],
    allergies: [],
    behavioralConcerns: [],
    feedingInstructions: null,
    vaccinations: [],
    specialInstructions: null,
    overallCompleteness: 'incomplete',
    ...overrides,
  };
}

describe('validateBusinessRules', () => {
  it('returns passed when no services exist', () => {
    const result = validateBusinessRules(makeExtraction());
    expect(result.status).toBe('passed');
    expect(result.errors).toHaveLength(0);
  });

  it('flags missing start date for boarding', () => {
    const result = validateBusinessRules(makeExtraction({
      pet: { name: 'Bentley', species: null, breed: null, age: null, weight: null, uncertainFields: [] },
      services: [{ type: 'boarding', startDate: null, endDate: '2024-08-18', checkInTime: null, checkOutTime: null, uncertainFields: [] }],
    }));
    expect(result.status).toBe('failed');
    expect(result.errors.some(e => e.fieldPath.includes('startDate') && e.rule === 'required')).toBe(true);
  });

  it('flags missing end date for boarding', () => {
    const result = validateBusinessRules(makeExtraction({
      pet: { name: 'Bentley', species: null, breed: null, age: null, weight: null, uncertainFields: [] },
      services: [{ type: 'boarding', startDate: '2024-08-15', endDate: null, checkInTime: null, checkOutTime: null, uncertainFields: [] }],
    }));
    expect(result.status).toBe('failed');
    expect(result.errors.some(e => e.fieldPath.includes('endDate') && e.rule === 'required')).toBe(true);
  });

  it('flags end date before start date', () => {
    const result = validateBusinessRules(makeExtraction({
      pet: { name: 'Bentley', species: null, breed: null, age: null, weight: null, uncertainFields: [] },
      services: [{ type: 'boarding', startDate: '2024-08-18', endDate: '2024-08-15', checkInTime: null, checkOutTime: null, uncertainFields: [] }],
    }));
    expect(result.status).toBe('failed');
    expect(result.errors.some(e => e.rule === 'dateRange')).toBe(true);
  });

  it('passes with valid date range', () => {
    const result = validateBusinessRules(makeExtraction({
      pet: { name: 'Bentley', species: null, breed: null, age: null, weight: null, uncertainFields: [] },
      services: [{ type: 'boarding', startDate: '2024-08-15', endDate: '2024-08-18', checkInTime: null, checkOutTime: null, uncertainFields: [] }],
    }));
    expect(result.status).toBe('passed');
  });

  it('flags missing pet name for grooming', () => {
    const result = validateBusinessRules(makeExtraction({
      services: [{ type: 'grooming', startDate: '2024-08-15', endDate: null, checkInTime: null, checkOutTime: null, uncertainFields: [] }],
    }));
    expect(result.status).toBe('failed');
    expect(result.errors.some(e => e.fieldPath === 'pet.name')).toBe(true);
  });

  it('collects multiple errors exhaustively', () => {
    const result = validateBusinessRules(makeExtraction({
      services: [
        { type: 'boarding', startDate: null, endDate: null, checkInTime: null, checkOutTime: null, uncertainFields: [] },
      ],
    }));
    expect(result.status).toBe('failed');
    // Should have: missing pet.name, missing startDate, missing endDate = 3 errors
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });

  it('does not flag endDate for grooming (not required)', () => {
    const result = validateBusinessRules(makeExtraction({
      pet: { name: 'Luna', species: null, breed: null, age: null, weight: null, uncertainFields: [] },
      services: [{ type: 'grooming', startDate: '2024-08-15', endDate: null, checkInTime: null, checkOutTime: null, uncertainFields: [] }],
    }));
    expect(result.status).toBe('passed');
  });
});
