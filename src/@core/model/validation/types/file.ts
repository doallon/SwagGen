
import type { ModelFieldMetadata } from '@core/model'
import type { ValidationError } from '../modelValidationError'
import { ValidationType } from '../modelValidationType'


/**
 * Validates FILE fields based on metadata rules.
 */
export const validateFileField = (value: any, field: ModelFieldMetadata): ValidationError[] => {
  const errors: ValidationError[] = []

  // Değerin varlığını ve türünü kontrol et
  if (!value || typeof value !== 'object') {
    errors.push({ field: field.key!, type: ValidationType.TYPE, params: { expected: 'object', actual: typeof value } })

    return errors
  }

  // Dosyanın varlığını kontrol et
  if (!value) {
    errors.push({ field: field.key!, type: ValidationType.REQUIRED })
  }

  // Dosya uzantısını kontrol et
  if (field.rules?.allowedExtensions) {
    const actualExtension = value.extension || 'undefined'

    if (!field.rules.allowedExtensions.includes(actualExtension)) {
      errors.push({
        field: field.key!,
        type: ValidationType.TYPE,
        params: { expected: field.rules.allowedExtensions.join(', '), actual: actualExtension }
      })
    }
  }

  // Dosya türünü kontrol et
  if (field.rules?.allowedTypes) {
    const actualType = value.type || 'undefined'

    if (!field.rules.allowedTypes.includes(actualType)) {
      errors.push({
        field: field.key!,
        type: ValidationType.TYPE,
        params: { expected: field.rules.allowedTypes.join(', '), actual: actualType }
      })
    }
  }

  // Dosya boyutunu kontrol et
  if (field.rules?.maxSize && value.size > field.rules.maxSize) {
    errors.push({
      field: field.key!,
      type: ValidationType.MAX,
      params: { max: field.rules.maxSize, actual: value.size }
    })
  }

  return errors
}
