
import type { ModelFieldMetadata} from '@core/model';
import type { ValidationError } from '../modelValidationError'
import { ValidationType } from '../modelValidationType'
import { validateField } from '@core/model/validation'

/**
 * Validates object fields based on metadata rules.
 */


export const validateObjectField = (value: any, field: ModelFieldMetadata): ValidationError[] => {
  const errors: ValidationError[] = []

  // Eğer değer yoksa ve required ise hata döner
  if (!value) {
    if (field.required) {
      errors.push({ field: field.key!, type: ValidationType.REQUIRED })
    }

    return errors
  }

  // Eğer nestedFields tanımlanmamışsa, sadece tip kontrolü yap
  if (!field.nestedFields || typeof field.nestedFields !== 'object') {
    if (typeof value !== 'object' || Array.isArray(value)) {
      errors.push({
        field: field.key!,
        type: ValidationType.TYPE,
        params: { expected: 'object', actual: typeof value }
      })
    }

    return errors
  }

  // Eğer nestedFields varsa, tüm alt alanları kontrol et
  Object.entries(field.nestedFields).forEach(([nestedKey, nestedMeta]) => {
    const nestedValue = value[nestedKey]
    const nestedErrors = validateField(nestedValue, nestedMeta)

    // Hataları tam alan adıyla ekle
    nestedErrors.forEach(error =>
      errors.push({
        ...error,
        field: `${field.key}.${nestedKey}` // Tam alan adını belirt
      })
    )
  })

  return errors
}
