// src/@core/model/modelValidationType.ts

export enum ValidationType {
  // Genel validasyon tipleri
  REQUIRED = 'required', // Alan zorunlu
  PATTERN = 'pattern', // Regex eşleşmesi
  MIN = 'min', // Minimum değer
  MAX = 'max', // Maksimum değer
  ENUM = 'enum', // Belirtilen değerler arasında olmalı
  TYPE = 'type', // Tip doğrulama

  // Karmaşık yapılara özgü validasyon tipleri
  OBJECT = 'object', // Nesne düzeyinde hata
  ARRAY = 'array', // Dizi düzeyinde hata
  NESTED = 'nested', // Nested (iç içe) alanlardaki hatalar

  // Özelleştirilmiş validasyon tipleri
  UNIQUE = 'unique', // Benzersiz olmalı (ör. e-posta, kullanıcı adı)
  DEPENDENCY = 'dependency', // Diğer alanlara bağlı validasyon (ör. bir alan diğer alan doluysa zorunlu olmalı)
  CUSTOM = 'custom', // Kullanıcı tanımlı validasyon kuralları

  // Desteklenmeyen durumlar
  UNSUPPORTED = 'unsupported', // Geçersiz veya desteklenmeyen bir yapı
}
