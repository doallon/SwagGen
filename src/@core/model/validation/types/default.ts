// src/@core/model/validation/types/default.ts

import { ValidationType } from '../modelValidationType';
import type { ValidationError } from '../modelValidationError';
import type { ModelFieldMetadata } from '@core/model/modelMetadata';

/**
 * Default validator for unsupported field types.
 * Returns a ValidationError indicating unsupported type.
 */
export const validateDefaultField = (value: any, field: ModelFieldMetadata): ValidationError[] => {
  return [
    {
      field: String(field.key || 'unknown'), // Güvenli dönüşüm
      type: ValidationType.UNSUPPORTED,
      params: { key: 'validation.unsupportedType', values: { type: field.type } }, // Lokalizasyon desteği
    },
  ];
};
