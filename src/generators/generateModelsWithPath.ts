import { OpenAPIV2, OpenAPIV3, OpenAPIV3_1 } from 'openapi-types';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Tag'ler ile şemaları eşleştirir.
 * @param paths OpenAPI paths nesnesi.
 * @returns Tag'e göre şema isimlerini gruplandırır.
 */
function mapSchemasToTags(
    paths: Record<string, any>
): Record<string, Set<string>> {
    const tagToSchemas: Record<string, Set<string>> = {};

    for (const [endpoint, methods] of Object.entries(paths)) {
        for (const [method, operation] of Object.entries<any>(methods)) {
            if (operation.tags && Array.isArray(operation.tags)) {
                for (const tag of operation.tags) {
                    if (!tagToSchemas[tag]) {
                        tagToSchemas[tag] = new Set<string>();
                    }

                    // Şema isimlerini `$ref` ile ilişkilendir
                    const refs = JSON.stringify(operation).match(/"#\/components\/schemas\/([a-zA-Z0-9_]*)"/g);
                    if (refs) {
                        refs.forEach((ref) => {
                            const schemaName = ref.split('/').pop()?.replace('"', '');
                            if (schemaName) {
                                tagToSchemas[tag].add(schemaName);
                            }
                        });
                    }
                }
            }
        }
    }

    return tagToSchemas;
}

/**
 * Şemalara uygun TypeScript modellerini tag'e göre oluşturur.
 * @param schemas OpenAPI şemaları.
 * @param paths OpenAPI paths nesnesi.
 * @param outputDir Çıktı dizini.
 */
export function generateModelsByTags(
    schemas: Record<string, OpenAPIV2.SchemaObject | OpenAPIV3.SchemaObject | OpenAPIV3_1.SchemaObject>,
    paths: Record<string, any>,
    outputDir: string
) {
    const tagToSchemas = mapSchemasToTags(paths);

    for (const [tag, schemaNames] of Object.entries(tagToSchemas)) {
        console.log(`Tag İşleniyor: ${tag}`);
        const tagOutputDir = path.join(outputDir, tag, 'model');
        ensureDirectoryExists(tagOutputDir);

        schemaNames.forEach((schemaName) => {
            const schema = schemas[schemaName];
            if (!schema) return;

            const modelFilePath = path.join(tagOutputDir, `${schemaName}.ts`);

            const properties = schema.properties
                ? Object.entries(schema.properties).map(([key, value]) => {
                    const property = value as OpenAPIV2.SchemaObject | OpenAPIV3.SchemaObject | OpenAPIV3_1.SchemaObject;

                    let type: string | undefined;

                    if (Array.isArray(property.type)) {
                        type = mapOpenAPITypeToTypeScript(property.type[0]); // İlk eleman
                    } else {
                        type = mapOpenAPITypeToTypeScript(property.type);
                    }

                    if (property.type === 'array' && property.items) {
                        const items = property.items as OpenAPIV2.SchemaObject | OpenAPIV3.SchemaObject | OpenAPIV3_1.SchemaObject;

                        let itemsType: string | undefined;

                        if (Array.isArray(items.type)) {
                            itemsType = mapOpenAPITypeToTypeScript(items.type[0]); // İlk eleman
                        } else {
                            itemsType = mapOpenAPITypeToTypeScript(items.type);
                        }

                        type = `${itemsType}[]`;
                    } else if ('$ref' in property && property.$ref) {
                        type = property.$ref.split('/').pop() || 'any';
                    }

                    return `${key}: ${type};`;
                })
                : [];

            const modelContent = `
export interface ${schemaName} {
  ${properties.join('\n  ')}
}
`;

            fs.writeFileSync(modelFilePath, modelContent.trim(), 'utf8');
            console.log(`Model oluşturuldu: ${modelFilePath}`);
        });
    }
}

/**
 * Klasör oluşturmayı kolaylaştırır.
 * @param dirPath Klasör yolu.
 */
function ensureDirectoryExists(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

/**
 * OpenAPI türlerini TypeScript türlerine eşler.
 * @param type OpenAPI türü.
 * @returns TypeScript türü.
 */
function mapOpenAPITypeToTypeScript(type: string | undefined): string {
    switch (type) {
        case 'integer':
            return 'number';
        case 'array':
            return 'any[]';
        case 'boolean':
            return 'boolean';
        case 'string':
            return 'string';
        case 'object':
            return 'Record<string, any>';
        default:
            return 'any';
    }
}
