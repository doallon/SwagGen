import 'reflect-metadata';
import type { ModelFieldType } from './modelFieldType';
import type { ValidationError } from './validation/modelValidationError'


/**
 * Interface representing metadata for a model field.
 */
export interface ModelFieldMetadata {
  key: string; // Alanın benzersiz anahtarı
  name?: string;
  type: ModelFieldType;
  defaultValue: any;
  required: boolean;
  pattern?: RegExp | null;
  enumValues?: any[] | null;
  min?: number | null | undefined;
  max?: number | null | undefined;
  label?: string | null;
  placeholder?: string | null;
  nestedFields?: Record<string, ModelFieldMetadata> | null;
  rules?: Record<string, any> | null;
  customValidator?: (value: any) => ValidationError[]; // Özel validasyon fonksiyonu
}

// WeakMap to cache metadata for models, ensuring efficient memory usage
const modelMetadataCache = new WeakMap<object, Record<string, ModelFieldMetadata>>();

/**
 * Defines metadata for a model field.
 * @param target - The target object.
 * @param propertyKey - The key of the property to define metadata for.
 * @param metadata - The metadata to associate with the property.
 */
export function defineModelMetadata(
  target: object,
  propertyKey: string | symbol,
  metadata: Partial<ModelFieldMetadata>
): void {
  // Retrieve or initialize metadata for the target object
  const existingMetadata = modelMetadataCache.get(target) || {};
  const prototypeMetadata = modelMetadataCache.get(target.constructor.prototype) || {};

  // Ensure `propertyKey` is string-compatible
  const key = typeof propertyKey === 'string' ? propertyKey : propertyKey.toString();

  // Merge metadata
  const mergedMetadata = {
    ...existingMetadata[key],
    ...metadata,
  };

  // Save merged metadata to target and prototype
  existingMetadata[key] = mergedMetadata;
  prototypeMetadata[key] = mergedMetadata;

  modelMetadataCache.set(target, existingMetadata);
  modelMetadataCache.set(target.constructor.prototype, prototypeMetadata);

  // Debugging Output
/*
  console.log(`Metadata set for "${String(propertyKey)}":`, mergedMetadata);
*/

}

/**
 * Retrieves metadata for a specific property of a model.
 * @param target - The target object.
 * @param propertyKey - The property key to retrieve metadata for.
 * @returns The associated metadata or undefined if not found.
 */
export function getModelMetadata(
  target: object,
  propertyKey: string | symbol
): ModelFieldMetadata | undefined {
  // Check metadata in `target` and `target.constructor.prototype`
  const metadata = modelMetadataCache.get(target) || modelMetadataCache.get(target.constructor.prototype);

  return metadata ? metadata[propertyKey as string] : undefined;
}

/**
 * Retrieves all metadata for a model.
 * @param target - The target object or its prototype.
 * @param filterFn
 * @returns An object containing all field metadata.
 */
export function getAllModelMetadata(
  target: object,
  filterFn?: (key: string, metadata: ModelFieldMetadata) => boolean
): Record<string, ModelFieldMetadata> | undefined {
  const metadata =
    modelMetadataCache.get(target) || modelMetadataCache.get(target.constructor.prototype);

  if (!metadata) {
    return undefined;
  }

  if (filterFn) {
    // Apply filter function
    return Object.fromEntries(
      Object.entries(metadata).filter(([key, meta]) => filterFn(key, meta))
    );
  }

  return metadata;
}


/**
 * Retrieves the metadata for a specific field from the analyzed model.
 * @param fieldName - The name of the field.
 * @param analyzedModel - The analyzed model containing metadata for fields.
 * @returns Metadata of the field, or undefined if not found.
 */

export const getModelFieldMeta = (
  fieldName: string,
  analyzedModel: Record<string, ModelFieldMetadata>
): ModelFieldMetadata | undefined => {
  const keys = fieldName.split('.'); // Alan adını ayır
  let currentMeta = analyzedModel; // Başlangıç meta verisi

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const fieldMeta = currentMeta[key];

    if (!fieldMeta) {
return undefined; // Eğer alan bulunamazsa undefined döner
    }

    // Eğer en son anahtar ise meta veriyi döndür
    if (i === keys.length - 1) {
      return fieldMeta;
    }

    // Eğer nestedFields mevcutsa alt meta veriye geç
    if (fieldMeta.nestedFields) {
      currentMeta = fieldMeta.nestedFields;
    } else {
return undefined;
    }
  }

  return undefined; // Eğer hiçbir şey bulunmazsa undefined döner
};
