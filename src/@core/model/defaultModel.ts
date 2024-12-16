import 'reflect-metadata';

import type { FieldValues } from 'react-hook-form';

import { BaseModel } from '@core/model/baseModel';

/**
 * DefaultModel extends BaseModel and serves as a basic template for models.
 * Implements FieldValues from react-hook-form for form handling compatibility.
 */
export class DefaultModel extends BaseModel implements FieldValues {
  // No fields or methods are defined by default.
  // Extend this class to create custom models with specific fields.
}
