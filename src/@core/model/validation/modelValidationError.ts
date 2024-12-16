// src/@core/model/modelValidationError.ts

import type { ValidationType } from "./modelValidationType";

export type ValidationError<T = any> = {
  field: keyof T; // Alanın adı (örneğin: "firstName", "email")
  type: ValidationType; // Hata tipi: 'required', 'pattern', 'min', 'max', vs.
  params?: Record<string, any>; // Ek parametreler: min, max, pattern, vs.
};
