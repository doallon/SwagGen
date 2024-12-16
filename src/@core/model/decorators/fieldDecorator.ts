// src/@core/model/decorators/fieldDecorator.ts

import 'reflect-metadata';
import type { ModelFieldType } from '@core/model';
import { defineModelMetadata } from '@core/model';

/**
 * Decorator to define metadata for a model field with i18n support.
 * @param options - Configuration options for the model field.
 * @returns A decorator function to attach metadata to the target property.
 */
export function ModelField(options: {
  type: ModelFieldType;
  defaultValue?: any | (() => any);
  required?: boolean;
  pattern?: RegExp;
  enumValues?: any[];
  min?: number;
  max?: number;
  label?: string; // Can be a translation key
  placeholder?: string; // Can be a translation key
}) {
  return function (target: object, propertyKey: string | symbol): void {
    // Define metadata with support for i18n keys
    defineModelMetadata(target, propertyKey, {
      type: options.type,
      defaultValue: options.defaultValue ?? null,
      required: options.required ?? false,
      pattern: options.pattern ?? null,
      enumValues: options.enumValues ?? null,
      min: options.min ?? null,
      max: options.max ?? null,
      label: options.label  ?? null, // Prefix with 'fields.' for i18n keys
      placeholder: options.placeholder ?? null, // Prefix with 'fields.'
    });
  };
}




