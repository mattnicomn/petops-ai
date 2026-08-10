import type { ExtractionResult, ServiceRequest, ValidationResult, ValidationError } from '@petops-ai/shared';

const REQUIRED_FIELDS_BY_SERVICE: Record<string, string[]> = {
  boarding: ['pet.name', 'startDate', 'endDate'],
  grooming: ['pet.name', 'startDate'],
  daycare: ['pet.name', 'startDate'],
  sitting: ['pet.name', 'startDate', 'endDate'],
};

export function validateBusinessRules(extraction: ExtractionResult): ValidationResult {
  const errors: ValidationError[] = [];

  // Date range validation for each service
  for (let i = 0; i < extraction.services.length; i++) {
    const service = extraction.services[i];
    validateDateRange(service, i, errors);
    validateRequiredFields(service, extraction, i, errors);
  }

  return {
    status: errors.length === 0 ? 'passed' : 'failed',
    errors,
  };
}

function validateDateRange(
  service: ServiceRequest,
  index: number,
  errors: ValidationError[]
): void {
  if (service.startDate && service.endDate) {
    const start = new Date(service.startDate);
    const end = new Date(service.endDate);
    if (end < start) {
      errors.push({
        fieldPath: `services[${index}].endDate`,
        rule: 'dateRange',
        message: `Check-out date (${service.endDate}) is earlier than check-in date (${service.startDate})`,
      });
    }
  }
}

function validateRequiredFields(
  service: ServiceRequest,
  extraction: ExtractionResult,
  index: number,
  errors: ValidationError[]
): void {
  const required = REQUIRED_FIELDS_BY_SERVICE[service.type];
  if (!required) return;

  for (const field of required) {
    if (field === 'pet.name') {
      if (!extraction.pet.name) {
        errors.push({
          fieldPath: 'pet.name',
          rule: 'required',
          message: `Pet name is required for ${service.type} service`,
        });
      }
    } else if (field === 'startDate') {
      if (!service.startDate) {
        errors.push({
          fieldPath: `services[${index}].startDate`,
          rule: 'required',
          message: `Start date is required for ${service.type} service`,
        });
      }
    } else if (field === 'endDate') {
      if (!service.endDate) {
        errors.push({
          fieldPath: `services[${index}].endDate`,
          rule: 'required',
          message: `End date is required for ${service.type} service`,
        });
      }
    }
  }
}
