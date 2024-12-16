// src/@core/model/index.ts

// Exporting all modules for centralized access

export { ModelFieldType } from './modelFieldType'

// Diğer model dosyalarını da buradan dışa aktarabilirsiniz:
export { BaseModel } from './baseModel'
export {
  getModelMetadata,
  defineModelMetadata,
  getAllModelMetadata,
  getModelFieldMeta,
  type ModelFieldMetadata
} from './modelMetadata'

// Eğer başka validasyonlar varsa:
export * from './validation'
export * from './decorators'
export * from './defaultModel'
