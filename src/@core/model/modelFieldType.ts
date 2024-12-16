
// src/@core/model/modelFieldType.ts
import 'reflect-metadata';

/**
 * Enum representing different types of model fields.
 * These types are commonly used for form inputs and data representation.
 */
export enum ModelFieldType {

  // Text-based input types
  STRING = 'text',
  TEXTAREA = 'textarea',
  EMAIL = 'email',
  PASSWORD = 'password',
  URL = 'url',
  TEL = 'tel',

  // Number-based input types
  NUMBER = 'number',
  RANGE = 'range',

  // Boolean-based input types
  BOOLEAN = 'boolean',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',

  // Date and time input types
  DATE = 'date',
  TIME = 'time',
  DATETIME = 'datetime-local',

  // Object-related types
  OBJECT = 'object',
  ARRAY = 'array',
  CLASS = 'class',

  // File and color input types
  FILE = 'file',
  COLOR = 'color',

  // Selection-based input types
  SELECT = 'select',

  // Hidden input type
  HIDDEN = 'hidden',

  // Enum-based type
  ENUM = 'enum',
}


/**
 * Maps ModelFieldType to HTML input types.
 * @param type - The ModelFieldType.
 * @returns Corresponding HTML input type as a string.
 */

/**
 * Maps ModelFieldType to HTML input types or specific React components.
 * @param type - The ModelFieldType.
 * @returns Corresponding HTML input type or component as a string.
 */
export const modelFieldTypeToInputType = (type: ModelFieldType): string => {
  switch (type) {
    case ModelFieldType.STRING:
    case ModelFieldType.TEXTAREA:
    case ModelFieldType.EMAIL:
    case ModelFieldType.PASSWORD:
    case ModelFieldType.URL:
    case ModelFieldType.TEL:
      return 'text';
    case ModelFieldType.NUMBER:
    case ModelFieldType.RANGE:
      return 'number';
    case ModelFieldType.DATE:
      return 'date';
    case ModelFieldType.TIME:
      return 'time';
    case ModelFieldType.DATETIME:
      return 'datetime-local';
    case ModelFieldType.COLOR:
      return 'color';
    case ModelFieldType.FILE:
      return 'file';
    case ModelFieldType.RADIO:
      return 'radio';
    case ModelFieldType.CHECKBOX:
      return 'checkbox';
    case ModelFieldType.HIDDEN:
      return 'hidden';
    case ModelFieldType.SELECT:
    case ModelFieldType.ENUM:
      return 'select';
    case ModelFieldType.BOOLEAN:
      return 'checkbox'; // Boolean için checkbox kullanıyoruz
    case ModelFieldType.CLASS:
    case ModelFieldType.OBJECT:
    case ModelFieldType.ARRAY:
      return 'object';
    default:
      return 'text'; // Varsayılan olarak 'text' döner
  }
};
