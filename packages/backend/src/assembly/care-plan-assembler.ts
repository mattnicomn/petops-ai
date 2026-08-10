import type {
  ExtractionResult,
  AttentionFlag,
  ValidationResult,
  ProposedCarePlan,
  MedicationScheduleEntry,
  DailySchedule,
  MissingFieldPlaceholder,
} from '@petops-ai/shared';

export function assembleCarePlan(
  extraction: ExtractionResult,
  validationResult: ValidationResult,
  attentionFlags: AttentionFlag[]
): ProposedCarePlan {
  return {
    sections: {
      petInformation: extraction.pet,
      services: extraction.services,
      schedules: buildDailySchedules(extraction),
      medications: buildMedicationSchedule(extraction),
      attentionFlags,
      specialInstructions: buildSpecialInstructions(extraction),
    },
    validationResult,
    missingFields: buildMissingFieldPlaceholders(validationResult),
    uncertainFieldCount: countUncertainFields(extraction),
  };
}

function buildMedicationSchedule(extraction: ExtractionResult): MedicationScheduleEntry[] {
  return extraction.medications.map((med) => ({
    medicationName: med.name,
    time: parseTimeFromFrequency(med.frequency),
    dosage: med.dosage || 'Not specified',
    instructions: med.instructions || med.route || 'No specific instructions',
  })).sort((a, b) => a.time.localeCompare(b.time));
}

function buildDailySchedules(extraction: ExtractionResult): DailySchedule[] {
  // For MVP, create a single representative day schedule
  if (extraction.medications.length === 0) return [];

  const entries = extraction.medications.map((med) => ({
    time: parseTimeFromFrequency(med.frequency),
    type: 'medication' as const,
    description: `${med.name}${med.dosage ? ` (${med.dosage})` : ''}`,
  })).sort((a, b) => a.time.localeCompare(b.time));

  const startDate = extraction.services[0]?.startDate || new Date().toISOString().split('T')[0];

  return [{ date: startDate, entries }];
}

function buildSpecialInstructions(extraction: ExtractionResult): string[] {
  const instructions: string[] = [];
  if (extraction.feedingInstructions) {
    instructions.push(extraction.feedingInstructions);
  }
  if (extraction.specialInstructions) {
    instructions.push(extraction.specialInstructions);
  }
  return instructions;
}

function buildMissingFieldPlaceholders(validationResult: ValidationResult): MissingFieldPlaceholder[] {
  if (validationResult.status === 'passed') return [];

  return validationResult.errors
    .filter((e) => e.rule === 'required')
    .map((error) => ({
      fieldPath: error.fieldPath,
      label: error.message,
      requiredFor: extractServiceType(error.message),
    }));
}

function extractServiceType(message: string): string {
  const match = message.match(/for (\w+) service/);
  return match ? match[1] : 'service';
}

function countUncertainFields(extraction: ExtractionResult): number {
  let count = extraction.pet.uncertainFields.length;
  for (const service of extraction.services) {
    count += service.uncertainFields.length;
  }
  for (const med of extraction.medications) {
    count += med.uncertainFields.length;
  }
  for (const vax of extraction.vaccinations) {
    count += vax.uncertainFields.length;
  }
  return count;
}

function parseTimeFromFrequency(frequency: string | null): string {
  if (!frequency) return '08:00';
  const lower = frequency.toLowerCase();
  if (lower.includes('morning') || lower.includes('am')) return '08:00';
  if (lower.includes('noon') || lower.includes('midday')) return '12:00';
  if (lower.includes('evening') || lower.includes('pm') || lower.includes('night')) return '18:00';
  if (lower.includes('twice')) return '08:00'; // first dose
  return '08:00';
}
