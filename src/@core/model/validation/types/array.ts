import type { ModelFieldMetadata} from '@core/model';
import type { ValidationError } from '../modelValidationError'
import { ValidationType } from '../modelValidationType'
import { validateField } from '@core/model/validation'


/**
 * Validates ARRAY fields based on metadata rules.
 */
export const validateArrayField = (value: any, field: ModelFieldMetadata): ValidationError[] => {
  const errors: ValidationError[] = []

  // Eğer değer yoksa veya dizi değilse
  if (!value || !Array.isArray(value)) {
    errors.push({
      field: field.key!,
      type: ValidationType.TYPE,
      params: { expected: 'array', actual: typeof value }
    })

    return errors
  }

  // Dizi elemanlarını doğrula
  value.forEach((item, index) => {
    const itemErrors = validateField(item, field)

    errors.push(
      ...itemErrors.map(error => ({
        ...error,
        field: `${field.key}[${index}]`
      }))
    )
  })

  return errors
}
