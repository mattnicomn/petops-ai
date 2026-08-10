import { randomUUID } from 'crypto';
import type { ExtractionResult, AttentionFlag, ServiceRequest } from '@petops-ai/shared';

export function detectAttentionFlags(
  extraction: ExtractionResult,
  originalText: string
): AttentionFlag[] {
  const flags: AttentionFlag[] = [];

  detectMedicationGaps(extraction, originalText, flags);
  detectVaccinationTiming(extraction, originalText, flags);
  detectBehavioralConcerns(extraction, originalText, flags);
  detectAllergies(extraction, originalText, flags);

  return flags;
}

function detectMedicationGaps(
  extraction: ExtractionResult,
  originalText: string,
  flags: AttentionFlag[]
): void {
  for (let i = 0; i < extraction.medications.length; i++) {
    const med = extraction.medications[i];
    const gaps: string[] = [];

    if (!med.frequency) gaps.push('frequency/schedule missing');
    if (!med.dosage) gaps.push('dosage not specified');
    if (!med.route && !med.instructions) gaps.push('administration instructions unclear');

    if (gaps.length > 0) {
      const sourceFragment = findRelevantFragment(originalText, med.name);
      flags.push({
        id: randomUUID(),
        severity: 'high',
        category: 'medication_gap',
        title: `Incomplete medication instructions: ${med.name}`,
        explanation: `The medication "${med.name}" was mentioned but has incomplete instructions (${gaps.join(', ')}). Staff cannot confidently execute the owner's stated instructions without clarification.`,
        sourceText: sourceFragment,
        fieldPath: `medications[${i}]`,
      });
    }
  }
}

function detectVaccinationTiming(
  extraction: ExtractionResult,
  originalText: string,
  flags: AttentionFlag[]
): void {
  const serviceEndDate = getLatestServiceEndDate(extraction.services);
  if (!serviceEndDate) return;

  for (let i = 0; i < extraction.vaccinations.length; i++) {
    const vax = extraction.vaccinations[i];
    if (!vax.expirationDate) continue;

    const expiration = new Date(vax.expirationDate);
    const serviceEnd = new Date(serviceEndDate);

    if (expiration <= serviceEnd) {
      const sourceFragment = findRelevantFragment(originalText, vax.name);
      flags.push({
        id: randomUUID(),
        severity: 'medium',
        category: 'vaccination_timing',
        title: `Vaccination timing: ${vax.name}`,
        explanation: `Vaccination information requires staff review because the provided expiration date (${vax.expirationDate}) overlaps the requested service period (ends ${serviceEndDate}).`,
        sourceText: sourceFragment,
        fieldPath: `vaccinations[${i}]`,
      });
    }
  }
}

function detectBehavioralConcerns(
  extraction: ExtractionResult,
  originalText: string,
  flags: AttentionFlag[]
): void {
  for (let i = 0; i < extraction.behavioralConcerns.length; i++) {
    const concern = extraction.behavioralConcerns[i];
    const sourceFragment = findRelevantFragment(originalText, concern);
    flags.push({
      id: randomUUID(),
      severity: 'medium',
      category: 'behavioral',
      title: `Behavioral concern: ${concern}`,
      explanation: `The owner reported a behavioral concern: "${concern}". Staff should be aware and consider appropriate handling arrangements.`,
      sourceText: sourceFragment,
      fieldPath: `behavioralConcerns[${i}]`,
    });
  }
}

function detectAllergies(
  extraction: ExtractionResult,
  originalText: string,
  flags: AttentionFlag[]
): void {
  for (let i = 0; i < extraction.allergies.length; i++) {
    const allergen = extraction.allergies[i];
    const sourceFragment = findRelevantFragment(originalText, allergen);
    flags.push({
      id: randomUUID(),
      severity: 'low',
      category: 'allergy',
      title: `Allergy: ${allergen}`,
      explanation: `The owner reported an allergy to "${allergen}". Staff should avoid this allergen during feeding and treatment.`,
      sourceText: sourceFragment,
      fieldPath: `allergies[${i}]`,
    });
  }
}

function getLatestServiceEndDate(services: ServiceRequest[]): string | null {
  let latest: string | null = null;
  for (const service of services) {
    const end = service.endDate || service.startDate;
    if (end && (!latest || end > latest)) {
      latest = end;
    }
  }
  return latest;
}

function findRelevantFragment(text: string, keyword: string): string {
  const lowerText = text.toLowerCase();
  const lowerKeyword = keyword.toLowerCase();
  const idx = lowerText.indexOf(lowerKeyword);

  if (idx === -1) {
    // Return first 100 chars as fallback
    return text.slice(0, 100);
  }

  const start = Math.max(0, idx - 20);
  const end = Math.min(text.length, idx + keyword.length + 80);
  return text.slice(start, end);
}
