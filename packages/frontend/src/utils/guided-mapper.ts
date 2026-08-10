/**
 * Maps Guided Intake state into the same ExtractionResult-compatible structure
 * used by the AI Quick Intake pipeline.
 *
 * This mapper is deterministic — no AI is involved.
 * Both paths converge into: validation → attention detection → care plan assembly → review.
 */
import type { GuidedIntakeState } from '../data/guided-intake';

export interface MappedExtraction {
  pet: {
    name: string | null;
    species: string | null;
    breed: string | null;
    age: string | null;
    weight: string | null;
    uncertainFields: string[];
  };
  services: Array<{
    type: 'boarding' | 'grooming' | 'daycare' | 'sitting';
    startDate: string | null;
    endDate: string | null;
    checkInTime: string | null;
    checkOutTime: string | null;
    uncertainFields: string[];
  }>;
  medications: Array<{
    name: string;
    dosage: string | null;
    frequency: string | null;
    route: string | null;
    instructions: string | null;
    uncertainFields: string[];
  }>;
  allergies: string[];
  behavioralConcerns: string[];
  feedingInstructions: string | null;
  vaccinations: Array<{
    name: string;
    expirationDate: string | null;
    uncertainFields: string[];
  }>;
  specialInstructions: string | null;
  overallCompleteness: 'complete' | 'partial' | 'incomplete';
}

export function mapGuidedIntakeToExtraction(state: GuidedIntakeState): MappedExtraction {
  const { pet, service, answers } = state;

  // Pet info
  const petInfo = pet
    ? { name: pet.name, species: pet.species, breed: pet.breed, age: pet.age, weight: pet.weight, uncertainFields: [] as string[] }
    : { name: null, species: null, breed: null, age: null, weight: null, uncertainFields: ['name', 'species'] };

  // Service
  const services = service
    ? [{ type: service.type, startDate: mapTimingToDate(answers.timing), endDate: mapEndDate(answers.timing, service.type), checkInTime: mapTimeOfDay(answers['time-of-day']), checkOutTime: null, uncertainFields: getTimingUncertainties(answers) }]
    : [];

  // Medications
  const medications = mapMedications(answers.medications);

  // Allergies
  const allergies = mapAllergies(answers.allergies, answers['skin-sensitivity']);

  // Behavioral concerns
  const behavioralConcerns = mapBehavior(answers['dog-behavior'], answers['nail-behavior']);

  // Special instructions
  const specialInstructions = buildSpecialInstructions(answers, service);

  // Completeness
  const overallCompleteness = pet && service ? (Object.keys(answers).length >= 3 ? 'complete' : 'partial') : 'incomplete';

  return {
    pet: petInfo,
    services,
    medications,
    allergies,
    behavioralConcerns,
    feedingInstructions: null,
    vaccinations: [],
    specialInstructions,
    overallCompleteness,
  };
}

function mapTimingToDate(timing: string | undefined): string | null {
  if (!timing) return null;
  const today = new Date();
  if (timing === 'this-saturday') {
    const sat = new Date(today);
    sat.setDate(today.getDate() + (6 - today.getDay()));
    return sat.toISOString().split('T')[0];
  }
  if (timing === 'this-sunday') {
    const sun = new Date(today);
    sun.setDate(today.getDate() + (7 - today.getDay()));
    return sun.toISOString().split('T')[0];
  }
  if (timing === 'next-week') {
    const next = new Date(today);
    next.setDate(today.getDate() + 7);
    return next.toISOString().split('T')[0];
  }
  return null;
}

function mapEndDate(timing: string | undefined, serviceType: string): string | null {
  if (serviceType !== 'boarding') return null;
  const start = mapTimingToDate(timing);
  if (!start) return null;
  const end = new Date(start);
  end.setDate(end.getDate() + 3); // Default 3-night boarding
  return end.toISOString().split('T')[0];
}

function mapTimeOfDay(timeOfDay: string | undefined): string | null {
  if (timeOfDay === 'morning') return '09:00';
  if (timeOfDay === 'midday') return '12:00';
  if (timeOfDay === 'afternoon') return '15:00';
  return null;
}

function getTimingUncertainties(answers: Record<string, string>): string[] {
  const uncertain: string[] = [];
  if (!answers.timing) uncertain.push('startDate');
  if (!answers['time-of-day']) uncertain.push('checkInTime');
  return uncertain;
}

function mapMedications(medAnswer: string | undefined): MappedExtraction['medications'] {
  if (!medAnswer || medAnswer === 'none') return [];
  if (medAnswer === 'apoquel-morning') {
    return [{ name: 'Apoquel', dosage: null, frequency: 'every morning', route: null, instructions: null, uncertainFields: ['dosage'] }];
  }
  if (medAnswer === 'other') {
    return [{ name: 'Unknown medication', dosage: null, frequency: null, route: null, instructions: null, uncertainFields: ['name', 'dosage', 'frequency'] }];
  }
  return [];
}

function mapAllergies(allergyAnswer: string | undefined, skinAnswer: string | undefined): string[] {
  const allergies: string[] = [];
  if (allergyAnswer && allergyAnswer !== 'none') {
    if (allergyAnswer === 'chicken') allergies.push('chicken / poultry');
    else if (allergyAnswer === 'grain') allergies.push('grain');
    else if (allergyAnswer === 'other') allergies.push('unspecified allergy');
  }
  if (skinAnswer === 'yes') allergies.push('sensitive skin');
  return allergies;
}

function mapBehavior(dogBehavior: string | undefined, nailBehavior: string | undefined): string[] {
  const concerns: string[] = [];
  if (dogBehavior === 'nervous-large') concerns.push('nervous around large dogs');
  if (dogBehavior === 'reactive') concerns.push('reactive — needs separation from other dogs');
  if (dogBehavior === 'selective') concerns.push('selective with other dogs');
  if (nailBehavior === 'nervous') concerns.push('nervous during nail trims');
  if (nailBehavior === 'very-anxious') concerns.push('very anxious during nail trims');
  return concerns;
}

function buildSpecialInstructions(answers: Record<string, string>, service: GuidedIntakeState['service']): string | null {
  const instructions: string[] = [];
  if (answers['skin-sensitivity'] === 'yes') instructions.push('Use hypoallergenic products only');
  if (answers['nail-behavior'] === 'very-anxious' || answers['nail-behavior'] === 'nervous') {
    instructions.push('Go slow with nail trims');
  }
  if (service?.id === 'full-groom') instructions.push('Full groom: bath, haircut, nails, ears');
  if (service?.id === 'bath-tidy') instructions.push('Bath and tidy up');
  if (service?.id === 'nails-ears') instructions.push('Nail trim and ear cleaning only');
  return instructions.length > 0 ? instructions.join('. ') : null;
}

/** Generate a readable summary of guided answers (used as "source request" in review) */
export function generateGuidedSummary(state: GuidedIntakeState): string {
  const parts: string[] = [];
  if (state.pet) parts.push(`Pet: ${state.pet.name} (${state.pet.breed}, ${state.pet.age}, ${state.pet.weight})`);
  if (state.service) parts.push(`Service: ${state.service.label}`);
  const { answers } = state;
  if (answers.timing) parts.push(`Timing: ${answers.timing.replace('-', ' ')}`);
  if (answers['time-of-day']) parts.push(`Time: ${answers['time-of-day']}`);
  if (answers['dog-behavior'] && answers['dog-behavior'] !== 'friendly') parts.push(`Behavior: ${answers['dog-behavior'].replace(/-/g, ' ')}`);
  if (answers['nail-behavior'] && answers['nail-behavior'] !== 'great' && answers['nail-behavior'] !== 'fine') parts.push(`Nail trims: ${answers['nail-behavior'].replace(/-/g, ' ')}`);
  if (answers.allergies && answers.allergies !== 'none') parts.push(`Allergies: ${answers.allergies}`);
  if (answers['skin-sensitivity'] === 'yes') parts.push('Sensitive skin: yes');
  if (answers.medications && answers.medications !== 'none') parts.push(`Medications: ${answers.medications.replace(/-/g, ' ')}`);
  return parts.join('\n');
}
