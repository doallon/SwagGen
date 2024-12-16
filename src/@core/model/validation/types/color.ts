
import type { ModelFieldMetadata } from '@core/model'
import type { ValidationError } from '../modelValidationError'
import { ValidationType } from '../modelValidationType'

/**
 * Validates COLOR fields based on metadata rules.
 */
export const validateColorField = (value: any, field: ModelFieldMetadata): ValidationError[] => {
  const colorPattern = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

  return colorPattern.test(value) ? [] : [{ field: field.key!, type: ValidationType.PATTERN }]
}
