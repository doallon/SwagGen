import type { ModelFieldMetadata} from '@core/model';
import type { ValidationError } from '../modelValidationError'
import { ValidationType } from '../modelValidationType'


/**
 * Validates boolean fields based on metadata rules.
 */
export const validateBooleanField = (value: any, field: ModelFieldMetadata): ValidationError[] => {
  return typeof value === 'boolean'
    ? []
    : [{ field: field.key!, type: ValidationType.TYPE, params: { expected: 'boolean', actual: typeof value } }]
}
