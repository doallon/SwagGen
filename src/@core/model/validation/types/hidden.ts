
import type { ModelFieldMetadata } from '@core/model'
import type { ValidationError } from '../modelValidationError'
import { ValidationType } from '../modelValidationType'


/**
 * Validates HIDDEN fields based on metadata rules.
 */
export const validateHiddenField = (value: any, field: ModelFieldMetadata): ValidationError[] => {
  return field.required && (value === null || value === undefined || value === '')
    ? [{ field: field.key!, type: ValidationType.REQUIRED }]
    : []
}
