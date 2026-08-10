import { describe, it, expect } from 'vitest';
import { detectAttentionFlags } from './attention-detector';
import type { ExtractionResult } from '@petops-ai/shared';

function makeExtraction(overrides: Partial<ExtractionResult> = {}): ExtractionResult {
  return {
    pet: { name: 'Test', species: null, breed: null, age: null, weight: null, uncertainFields: [] },
    services: [{ type: 'boarding', startDate: '2024-08-15', endDate: '2024-08-20', checkInTime: null, checkOutTime: null, uncertainFields: [] }],
    medications: [],
    allergies: [],
    behavioralConcerns: [],
    feedingInstructions: null,
    vaccinations: [],
    specialInstructions: null,
    overallCompleteness: 'partial',
    ...overrides,
  };
}

describe('detectAttentionFlags', () => {
  describe('medication gaps', () => {
    it('flags medication with missing dosage', () => {
      const extraction = makeExtraction({
        medications: [{ name: 'Apoquel', dosage: null, frequency: 'daily', route: null, instructions: null, uncertainFields: [] }],
      });
      const flags = detectAttentionFlags(extraction, 'Takes Apoquel daily');
      expect(flags.some(f => f.category === 'medication_gap' && f.severity === 'high')).toBe(true);
    });

    it('flags medication with missing frequency', () => {
      const extraction = makeExtraction({
        medications: [{ name: 'Apoquel', dosage: '5mg', frequency: null, route: null, instructions: null, uncertainFields: [] }],
      });
      const flags = detectAttentionFlags(extraction, 'Takes Apoquel 5mg');
      expect(flags.some(f => f.category === 'medication_gap')).toBe(true);
    });

    it('does not flag medication with complete information', () => {
      const extraction = makeExtraction({
        medications: [{ name: 'Apoquel', dosage: '5mg', frequency: 'daily', route: 'oral', instructions: 'with food', uncertainFields: [] }],
      });
      const flags = detectAttentionFlags(extraction, 'Takes Apoquel 5mg daily oral with food');
      expect(flags.filter(f => f.category === 'medication_gap')).toHaveLength(0);
    });

    it('does NOT make clinical medication-interaction claims', () => {
      const extraction = makeExtraction({
        medications: [
          { name: 'DrugA', dosage: '5mg', frequency: 'daily', route: 'oral', instructions: null, uncertainFields: [] },
          { name: 'DrugB', dosage: '10mg', frequency: 'daily', route: 'oral', instructions: null, uncertainFields: [] },
        ],
      });
      const flags = detectAttentionFlags(extraction, 'Takes DrugA 5mg and DrugB 10mg daily');
      // Should NOT have any medication_interaction flags
      expect(flags.filter(f => f.explanation.toLowerCase().includes('interaction'))).toHaveLength(0);
    });
  });

  describe('vaccination timing', () => {
    it('flags vaccination expiring before service end', () => {
      const extraction = makeExtraction({
        vaccinations: [{ name: 'rabies', expirationDate: '2024-08-18', uncertainFields: [] }],
      });
      const flags = detectAttentionFlags(extraction, 'Rabies vaccine expires Aug 18');
      expect(flags.some(f => f.category === 'vaccination_timing' && f.severity === 'medium')).toBe(true);
    });

    it('flags vaccination expiring during service period', () => {
      const extraction = makeExtraction({
        vaccinations: [{ name: 'bordetella', expirationDate: '2024-08-17', uncertainFields: [] }],
      });
      const flags = detectAttentionFlags(extraction, 'Bordetella expires Aug 17');
      expect(flags.some(f => f.category === 'vaccination_timing')).toBe(true);
    });

    it('does not flag vaccination expiring after service', () => {
      const extraction = makeExtraction({
        vaccinations: [{ name: 'rabies', expirationDate: '2025-01-01', uncertainFields: [] }],
      });
      const flags = detectAttentionFlags(extraction, 'Rabies valid through 2025');
      expect(flags.filter(f => f.category === 'vaccination_timing')).toHaveLength(0);
    });

    it('does not flag vaccination without expiration date', () => {
      const extraction = makeExtraction({
        vaccinations: [{ name: 'rabies', expirationDate: null, uncertainFields: [] }],
      });
      const flags = detectAttentionFlags(extraction, 'Rabies is current');
      expect(flags.filter(f => f.category === 'vaccination_timing')).toHaveLength(0);
    });

    it('does NOT claim pet is ineligible for service', () => {
      const extraction = makeExtraction({
        vaccinations: [{ name: 'rabies', expirationDate: '2024-08-16', uncertainFields: [] }],
      });
      const flags = detectAttentionFlags(extraction, 'Rabies expires soon');
      const vacFlags = flags.filter(f => f.category === 'vaccination_timing');
      for (const flag of vacFlags) {
        expect(flag.explanation.toLowerCase()).not.toContain('ineligible');
        expect(flag.explanation.toLowerCase()).not.toContain('cannot board');
        expect(flag.explanation).toContain('staff review');
      }
    });
  });

  describe('behavioral concerns', () => {
    it('flags behavioral concern with medium severity', () => {
      const extraction = makeExtraction({
        behavioralConcerns: ['nervous around large dogs'],
      });
      const flags = detectAttentionFlags(extraction, 'He is nervous around large dogs');
      expect(flags.some(f => f.category === 'behavioral' && f.severity === 'medium')).toBe(true);
    });

    it('returns empty flags when no concerns', () => {
      const extraction = makeExtraction({ behavioralConcerns: [] });
      const flags = detectAttentionFlags(extraction, 'No concerns');
      expect(flags.filter(f => f.category === 'behavioral')).toHaveLength(0);
    });
  });

  describe('allergy flags', () => {
    it('flags allergy with low severity', () => {
      const extraction = makeExtraction({ allergies: ['chicken'] });
      const flags = detectAttentionFlags(extraction, 'Has a chicken allergy');
      expect(flags.some(f => f.category === 'allergy' && f.severity === 'low')).toBe(true);
    });

    it('returns empty when no allergies', () => {
      const extraction = makeExtraction({ allergies: [] });
      const flags = detectAttentionFlags(extraction, 'No allergies');
      expect(flags.filter(f => f.category === 'allergy')).toHaveLength(0);
    });
  });

  describe('explanations', () => {
    it('includes source text reference', () => {
      const extraction = makeExtraction({ behavioralConcerns: ['anxious'] });
      const flags = detectAttentionFlags(extraction, 'The dog is anxious during grooming');
      expect(flags[0].sourceText.length).toBeGreaterThan(0);
    });

    it('uses factual statements traceable to input', () => {
      const extraction = makeExtraction({ behavioralConcerns: ['reactive to other dogs'] });
      const flags = detectAttentionFlags(extraction, 'He is reactive to other dogs');
      expect(flags[0].explanation).toContain('reactive to other dogs');
    });
  });
});
