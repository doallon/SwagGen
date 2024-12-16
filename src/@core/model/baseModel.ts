// src/@core/model/baseModel.ts

import type { ModelFieldMetadata } from './modelMetadata';
import { getModelMetadata } from './modelMetadata';
import { ModelFieldType } from '@core/model/modelFieldType';
import type { ValidationError } from '@core/model/validation/modelValidationError';
import { validateField } from '@core/model/validation';

export abstract class BaseModel {
  private static analyzedModelsCache = new Map<any, Record<string, ModelFieldMetadata>>();

  /**
   * Modelin metadata'sını analiz eder ve cache'ler.
   */
  static analyzeModel<T extends object>(
    model: T | (new () => T),
    depth = 0,
    maxDepth = 5,
    visited = new WeakSet<object>()
  ): Record<string, ModelFieldMetadata> {
    if (depth > maxDepth) {
      throw new Error(`Maximum recursion depth (${maxDepth}) reached.`);
    }

    if (this.analyzedModelsCache.has(model)) {
      return this.analyzedModelsCache.get(model)!;
    }

    const instance: T = typeof model === 'function' ? new model() : model;
    const analyzedModel: Record<string, ModelFieldMetadata> = {};

    for (const key of Object.keys(instance)) {
      const fieldMeta = getModelMetadata(instance, key);

      if (fieldMeta) {
        analyzedModel[key] = fieldMeta;

        // Nested model kontrolü
        if (fieldMeta.type === ModelFieldType.CLASS || fieldMeta.type === ModelFieldType.OBJECT) {
          const nestedModelConstructor = fieldMeta.defaultValue;

          if (nestedModelConstructor && typeof nestedModelConstructor === 'function') {
            fieldMeta.nestedFields = this.analyzeModel(
              new nestedModelConstructor(),
              depth + 1,
              maxDepth,
              visited
            );
          }
        }
      }
    }

    this.analyzedModelsCache.set(model, analyzedModel);

return analyzedModel;
  }

  /**
   * Model alanlarının dinamik validasyonunu yapar.
   */
  static validateDynamicRules<T extends BaseModel>(instance: T): ValidationError[] {
    const errors: ValidationError[] = [];
    const analyzedModel = this.analyzeModel(instance);

    for (const [field, meta] of Object.entries(analyzedModel)) {
      const value = (instance as any)[field];
      const fieldErrors = validateField(value, meta);

      // Nested alanların validasyonu
      if (meta.nestedFields && value) {
        const nestedErrors = BaseModel.validateDynamicRules(value);

        errors.push(
          ...nestedErrors.map((error) => ({
            ...error,
            field: `${String(field)}.${String(error.field)}`, // Safely convert to string
          }))
        );
      }

      errors.push(...fieldErrors);
    }

    return errors;
  }

  /**
   * Validasyon işlemini başlatır (hem dinamik hem özel kurallar).
   */
  async validate(): Promise<ValidationError[]> {
    const dynamicErrors = BaseModel.validateDynamicRules(this);
    const customErrors = await this.validateCustomRules();

    return [...dynamicErrors, ...customErrors];
  }

  /**
   * Özel validasyon kurallarını implementasyon sınıfında belirleyin.
   */
  protected async validateCustomRules(): Promise<ValidationError[]> {
    return [];
  }
}

