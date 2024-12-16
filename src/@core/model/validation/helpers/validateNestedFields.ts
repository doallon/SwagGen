// src/@core/model/validation/helpers/validateNestedFields.ts

import { validateField } from '../index'
import type { ModelFieldMetadata } from '@core/model/modelMetadata';
import type { ValidationError } from '@core/model/validation/modelValidationError'

export const validateNestedFields = (
  value: any,
  nestedFields: Record<string, ModelFieldMetadata>,
  parentFieldKey: string
): ValidationError[] => {
  const errors: ValidationError[] = [];

  Object.entries(nestedFields).forEach(([nestedKey, nestedMeta]) => {
    const nestedValue = value[nestedKey];
    const nestedErrors = validateField(nestedValue, nestedMeta);

    nestedErrors.forEach((error) =>
      errors.push({
        ...error,
        field: `${parentFieldKey}.${nestedKey}`,
      })
    );
  });

return errors;
};
