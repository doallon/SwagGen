import type { ModelFieldMetadata } from '@core/model';
import { ModelFieldType } from '@core/model';
import type { ValidationError } from '@core/model/validation/modelValidationError';
import {
  validateArrayField,
  validateBooleanField,
  validateClassField,
  validateColorField,
  validateDateField,
  validateEnumField,
  validateFileField,
  validateHiddenField,
  validateNumberField,
  validateObjectField,
  validateStringField,
  validateDefaultField,
} from '@core/model/validation/types';

// İşleyici atamayı kolaylaştıran yardımcı fonksiyon
function assignHandler(
  types: ModelFieldType[],
  handler: (value: any, field: ModelFieldMetadata) => ValidationError[] | ValidationError | null
): Record<ModelFieldType, typeof handler> {
  return types.reduce((handlers, type) => {
    handlers[type] = handler;

return handlers;
  }, {} as Record<ModelFieldType, typeof handler>);
}

// Tüm tiplere uygun validasyon işleyicileri
const validationHandlers: Record<
  ModelFieldType,
  (value: any, field: ModelFieldMetadata) => ValidationError[] | ValidationError | null
> = {
  ...assignHandler(
    [ModelFieldType.STRING, ModelFieldType.TEXTAREA, ModelFieldType.EMAIL, ModelFieldType.PASSWORD, ModelFieldType.URL, ModelFieldType.TEL],
    validateStringField
  ),
  ...assignHandler([ModelFieldType.NUMBER, ModelFieldType.RANGE], validateNumberField),
  [ModelFieldType.BOOLEAN]: validateBooleanField,
  [ModelFieldType.CHECKBOX]: validateBooleanField,
  [ModelFieldType.RADIO]: validateBooleanField,
  [ModelFieldType.DATE]: validateDateField,
  [ModelFieldType.TIME]: validateDateField,
  [ModelFieldType.DATETIME]: validateDateField,
  [ModelFieldType.SELECT]: validateEnumField,
  [ModelFieldType.ENUM]: validateEnumField,
  [ModelFieldType.OBJECT]: validateObjectField,
  [ModelFieldType.CLASS]: validateClassField,
  [ModelFieldType.ARRAY]: validateArrayField,
  [ModelFieldType.FILE]: validateFileField,
  [ModelFieldType.COLOR]: validateColorField,
  [ModelFieldType.HIDDEN]: validateHiddenField,
};


// Ana validasyon fonksiyonu
export const validateField = (value: any, field: ModelFieldMetadata): ValidationError[] => {
  const validateFn = validationHandlers[field.type] || validateDefaultField;

  const validationResult = validateFn(value, field);

  return Array.isArray(validationResult)
    ? validationResult
    : validationResult
      ? [{ ...validationResult, field: String(field.name || 'unknown') }]
      : [];
};
