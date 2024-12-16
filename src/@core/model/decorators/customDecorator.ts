// src/@core/model/decorators/customDecorator.ts

import 'reflect-metadata';

/**
 * Decorator to attach custom validation functions to a model field.
 * Supports multiple validation functions per field.
 * @param validationFn - A function that validates the value and returns a string (error) or null.
 */
export function CustomValidation(validationFn: (value: any) => string | null) {
  return function (target: object, propertyKey: string | symbol): void {
    const existingValidations =
      Reflect.getMetadata('customValidations', target, propertyKey) || [];

    Reflect.defineMetadata(
      'customValidations',
      [...existingValidations, validationFn],
      target,
      propertyKey
    );
  };
}

/**
 * Helper to retrieve all custom validation functions for a field.
 * @param target - The target object (class instance).
 * @param propertyKey - The property key.
 * @returns An array of validation functions.
 */
export function getCustomValidations(
  target: object,
  propertyKey: string | symbol
): Array<(value: any) => string | null> {
  return Reflect.getMetadata('customValidations', target, propertyKey) || [];
}

/**
 * Runs all custom validation functions for a field.
 * @param target - The target object (class instance).
 * @param propertyKey - The property key.
 * @param value - The value to validate.
 * @returns An array of error messages, or an empty array if all validations pass.
 */
export function runCustomValidations(
  target: object,
  propertyKey: string | symbol,
  value: any
): string[] {
  const validations = getCustomValidations(target, propertyKey);
  const errors: string[] = [];

  for (const validationFn of validations) {
    const error = validationFn(value);

    if (error) {
      errors.push(error);
    }
  }


return errors;
}
