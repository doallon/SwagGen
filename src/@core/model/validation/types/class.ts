import type { ModelFieldMetadata} from '@core/model';
import { BaseModel} from '@core/model'
import type { ValidationError } from '../modelValidationError'
import { ValidationType } from '../modelValidationType'
import { validateField } from '@core/model/validation'


/**
 * Validates class fields based on metadata rules.
 */
export const validateClassField = (value: any, field: ModelFieldMetadata): ValidationError[] => {
  const errors: ValidationError[] = []

  // Eğer değer yoksa ve required ise hata döner
  if (!value) {
    if (field.required) {
      errors.push({ field: field.key!, type: ValidationType.REQUIRED })
    }

    return errors
  }

  // Default değer olarak bir sınıf constructor'ı bekleniyor
  const nestedModel = field.defaultValue

  // Eğer `defaultValue` bir sınıf değilse, tip hatası döndür
  if (!nestedModel || typeof nestedModel !== 'function') {
    errors.push({
      field: field.key!,
      type: ValidationType.UNSUPPORTED,
      params: { reason: 'defaultValue is not a valid class constructor' }
    })

    return errors
  }

  // Alt modelin instance'ını oluştur ve analiz et
  const nestedInstance = new nestedModel()
  const analyzedFields = BaseModel.analyzeModel(nestedInstance)

  // Alt modelin her alanını analiz et
  Object.entries(analyzedFields).forEach(([key, meta]) => {
    const nestedValue = value[key] // Alt modelin değerini al
    const nestedErrors = validateField(nestedValue, meta) // validateField ile doğrula

    // Eğer bir hata varsa tam alan adıyla ekle
    nestedErrors.forEach(error =>
      errors.push({
        ...error,
        field: `${field.key}.${key}` // Tam alan adını belirt
      })
    )
  })

  return errors
}
