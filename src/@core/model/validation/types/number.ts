import type { ModelFieldMetadata} from '@core/model';
import type { ValidationError } from '../modelValidationError'
import { ValidationType } from '../modelValidationType'

/**
 * Validates number fields based on metadata rules.
 */
export const validateNumberField = (value: any, field: ModelFieldMetadata): ValidationError[] => {
  const errors: ValidationError[] = []

  if (typeof value !== 'number') {
    errors.push({ field: field.key!, type: ValidationType.TYPE, params: { expected: 'number', actual: typeof value } })
  }

  if (field.min != undefined && value < field.min) {
    errors.push({ field: field.key!, type: ValidationType.MIN, params: { min: field.min } })
  }

  if (field.max != undefined && value > field.max) {
    errors.push({ field: field.key!, type: ValidationType.MAX, params: { max: field.max } })
  }

  return errors
}
