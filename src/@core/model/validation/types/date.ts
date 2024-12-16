import type { ModelFieldMetadata} from '@core/model';
import type { ValidationError } from '../modelValidationError'
import { ValidationType } from '../modelValidationType'


/**
 * Validates date/time fields based on metadata rules.
 */
export const validateDateField = (value: any, field: ModelFieldMetadata): ValidationError[] => {
  const parsedDate = new Date(value)

  return isNaN(parsedDate.getTime())
    ? [{ field: field.key!, type: ValidationType.TYPE, params: { expected: 'date', actual: typeof value } }]
    : []
}
