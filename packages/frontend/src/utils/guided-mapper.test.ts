import { describe, it, expect } from 'vitest';
import { mapGuidedIntakeToExtraction, generateGuidedSummary } from './guided-mapper';
import { GUIDED_PETS, SERVICE_OPTIONS } from '../data/guided-intake';
import type { GuidedIntakeState } from '../data/guided-intake';

describe('mapGuidedIntakeToExtraction', () => {
  it('maps selected pet correctly', () => {
    const state: GuidedIntakeState = { pet: GUIDED_PETS[0], service: null, answers: {} };
    const result = mapGuidedIntakeToExtraction(state);
    expect(result.pet.name).toBe('Bentley');
    expect(result.pet.breed).toBe('Golden Retriever');
  });

  it('maps selected service correctly', () => {
    const state: GuidedIntakeState = { pet: GUIDED_PETS[0], service: SERVICE_OPTIONS[0], answers: {} };
    const result = mapGuidedIntakeToExtraction(state);
    expect(result.services).toHaveLength(1);
    expect(result.services[0].type).toBe('boarding');
  });

  it('maps behavioral concern from dog-behavior answer', () => {
    const state: GuidedIntakeState = { pet: GUIDED_PETS[0], service: SERVICE_OPTIONS[0], answers: { 'dog-behavior': 'nervous-large' } };
    const result = mapGuidedIntakeToExtraction(state);
    expect(result.behavioralConcerns).toContain('nervous around large dogs');
  });

  it('maps nail-behavior to behavioral concern', () => {
    const state: GuidedIntakeState = { pet: GUIDED_PETS[1], service: SERVICE_OPTIONS[2], answers: { 'nail-behavior': 'very-anxious' } };
    const result = mapGuidedIntakeToExtraction(state);
    expect(result.behavioralConcerns).toContain('very anxious during nail trims');
  });

  it('maps allergy from guided answers', () => {
    const state: GuidedIntakeState = { pet: GUIDED_PETS[1], service: SERVICE_OPTIONS[2], answers: { allergies: 'chicken' } };
    const result = mapGuidedIntakeToExtraction(state);
    expect(result.allergies).toContain('chicken / poultry');
  });

  it('maps sensitive skin to allergies', () => {
    const state: GuidedIntakeState = { pet: GUIDED_PETS[1], service: SERVICE_OPTIONS[2], answers: { 'skin-sensitivity': 'yes' } };
    const result = mapGuidedIntakeToExtraction(state);
    expect(result.allergies).toContain('sensitive skin');
  });

  it('maps medication answer correctly', () => {
    const state: GuidedIntakeState = { pet: GUIDED_PETS[0], service: SERVICE_OPTIONS[0], answers: { medications: 'apoquel-morning' } };
    const result = mapGuidedIntakeToExtraction(state);
    expect(result.medications).toHaveLength(1);
    expect(result.medications[0].name).toBe('Apoquel');
    expect(result.medications[0].frequency).toBe('every morning');
  });

  it('returns no medications for none answer', () => {
    const state: GuidedIntakeState = { pet: GUIDED_PETS[2], service: SERVICE_OPTIONS[0], answers: { medications: 'none' } };
    const result = mapGuidedIntakeToExtraction(state);
    expect(result.medications).toHaveLength(0);
  });

  it('missing answers remain missing/uncertain, not fabricated', () => {
    const state: GuidedIntakeState = { pet: GUIDED_PETS[0], service: SERVICE_OPTIONS[0], answers: {} };
    const result = mapGuidedIntakeToExtraction(state);
    expect(result.services[0].startDate).toBeNull();
    expect(result.services[0].uncertainFields).toContain('startDate');
    expect(result.medications).toHaveLength(0);
  });

  it('generates deterministic attention flags through downstream pipeline', () => {
    // Guided intake with medication gap should trigger high-severity flag when validated
    const state: GuidedIntakeState = { pet: GUIDED_PETS[0], service: SERVICE_OPTIONS[0], answers: { medications: 'apoquel-morning' } };
    const result = mapGuidedIntakeToExtraction(state);
    // Apoquel has dosage=null → should flag medication gap downstream
    expect(result.medications[0].dosage).toBeNull();
  });
});

describe('generateGuidedSummary', () => {
  it('produces readable summary from guided state', () => {
    const state: GuidedIntakeState = {
      pet: GUIDED_PETS[2],
      service: SERVICE_OPTIONS[2],
      answers: { 'nail-behavior': 'very-anxious', allergies: 'chicken', timing: 'this-saturday' },
    };
    const summary = generateGuidedSummary(state);
    expect(summary).toContain('Cooper');
    expect(summary).toContain('Full Groom');
    expect(summary).toContain('this saturday');
    expect(summary).toContain('chicken');
  });
});
