import type { ModelFieldMetadata} from '@core/model';
import type { ValidationError } from '../modelValidationError'
import { ValidationType } from '../modelValidationType'


/**
 * Validates enum fields based on metadata rules.
 */
export const validateEnumField = (value: any, field: ModelFieldMetadata): ValidationError[] => {
  return !field.enumValues || field.enumValues.includes(value)
    ? []
    : [{ field: field.key!, type: ValidationType.ENUM, params: { enum: field.enumValues } }]
}
