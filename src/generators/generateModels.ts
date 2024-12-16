import * as fs from 'fs';
import * as path from 'path';
import { OpenAPIV2, OpenAPIV3, OpenAPIV3_1 } from 'openapi-types';

/**
 * OpenAPI şemalarından TypeScript modelleri oluşturur.
 * @param schemas OpenAPI şemaları.
 * @param outputDir Çıktı dizini.
 */
export function generateModels(
    schemas: Record<string, OpenAPIV2.SchemaObject | OpenAPIV3.SchemaObject | OpenAPIV3_1.SchemaObject>,
    outputDir: string
) {
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    for (const [schemaName, schema] of Object.entries(schemas)) {
        const modelFilePath = path.join(outputDir, `${schemaName}.ts`);

        // Şema özelliklerini işleyin
        const properties = schema.properties
            ? Object.entries(schema.properties).map(([key, value]) => {
                // `value` değişkenini uygun türe göre kontrol edin
                const property = value as OpenAPIV2.SchemaObject | OpenAPIV3.SchemaObject | OpenAPIV3_1.SchemaObject;
                const type = property.type || 'any';
                return `${key}: ${type};`;
            })
            : [];

        // Model içeriğini oluşturun
        const modelContent = `
export interface ${schemaName} {
  ${properties.join('\n  ')}
}
`;

        // Dosyayı oluşturun
        fs.writeFileSync(modelFilePath, modelContent.trim(), 'utf8');
        console.log(`Model oluşturuldu: ${modelFilePath}`);
    }
}
