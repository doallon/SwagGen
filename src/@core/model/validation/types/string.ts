// src/@core/model/validation/types/string.ts

import type { ModelFieldMetadata } from '@core/model/modelMetadata';
import type { ValidationError } from '../modelValidationError'
import { ValidationType } from '../modelValidationType'

export const validateStringField = (value: any, field: ModelFieldMetadata): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (typeof value !== 'string') {
    errors.push({ field: field.key!, type: ValidationType.TYPE, params: { expected: 'string', actual: typeof value } });
  }

  if (field.pattern && !field.pattern.test(value)) {
    errors.push({ field: field.key!, type: ValidationType.PATTERN, params: { pattern: field.pattern.toString() } });
  }

  return errors;
};
