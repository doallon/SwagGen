import * as fs from 'fs';
import * as path from 'path';
import {OpenAPIV2, OpenAPIV3, OpenAPIV3_1} from 'openapi-types';

/**
 * Şema adını analiz ederek kategori ve tür (model, request, response) bilgilerini döner.
 * @param schemaName Şema adı.
 * @returns Kategori ve tür bilgisi.
 */

function analyzeSchemaName(schemaName: string): { category: string; type: string } {
    // Şema adı request, response içeriyor mu?
    const isRequest = schemaName.toLowerCase().includes('request');
    const isResponse = schemaName.toLowerCase().includes('response');

    // Tür belirle
    const type = isRequest ? 'request' : isResponse ? 'response' : 'model';

    // Şema adı içindeki büyük harfle başlayan kelimeleri yakala
    const categoryMatch = schemaName.match(/[A-Z][a-z]+/g);

    // Kategori belirle (ilk kelime genellikle ana kategori olur)
    const category = categoryMatch ? categoryMatch[0] : 'common';

    return { category, type };
}


/**
 * Şemalara uygun TypeScript modellerini oluşturur.
 * @param schemas OpenAPI şemaları.
 * @param outputDir Çıktı dizini.
 */
export function generateModelsByCategoryAndCommon(
    schemas: Record<string, OpenAPIV2.SchemaObject | OpenAPIV3.SchemaObject | OpenAPIV3_1.SchemaObject>,
    outputDir: string
) {
    for (const [schemaName, schema] of Object.entries(schemas)) {
        // Şema adı analiz edilir
        const { category, type } = analyzeSchemaName(schemaName);

        // Kategoriye göre çıktı dizinini oluştur
        const categoryDir = path.join(outputDir, category, type);
        ensureDirectoryExists(categoryDir);

        // Şema dosya yolu
        const modelFilePath = path.join(categoryDir, `${schemaName}.ts`);

        // Şema içeriğini oluştur ve dosyaya yaz (schemas parametresini ekle)
        writeModelToFile(schemaName, schema, modelFilePath, schemas);
    }
}

/**
 * TypeScript modeli dosyaya yazar.
 * @param schemaName Şema adı.
 * @param schema Şema içeriği.
 * @param filePath Dosya yolu.
 */
/**
 * TypeScript modeli dosyaya yazar.
 * @param schemaName Şema adı.
 * @param schema Şema içeriği.
 * @param filePath Dosya yolu.
 * @param schemas Tüm şemalar (referans çözme için).
 */
function writeModelToFile(
    schemaName: string,
    schema: OpenAPIV2.SchemaObject | OpenAPIV3.SchemaObject | OpenAPIV3_1.SchemaObject,
    filePath: string,
    schemas: Record<string, OpenAPIV2.SchemaObject | OpenAPIV3.SchemaObject | OpenAPIV3_1.SchemaObject>
) {
    let properties: string[] = [];
    let extendsList: string[] = [];

    // `allOf` varsa işleriz
    if ('allOf' in schema && schema.allOf) {
        for (const item of schema.allOf) {
            if ('$ref' in item && item.$ref) {
                // Referansı çöz
                const refName = item.$ref.split('/').pop();
                if (refName && schemas[refName]) {
                    extendsList.push(refName); // TypeScript `extends` için
                }
            } else if ('properties' in item) {
                // `properties` içeren bir `allOf` parçasıysa
                properties.push(
                    ...Object.entries(item.properties || {}).map(([key, value]) => {
                        const property = value as OpenAPIV2.SchemaObject | OpenAPIV3.SchemaObject | OpenAPIV3_1.SchemaObject;

                        let type: string | undefined;

                        if (Array.isArray(property.type)) {
                            type = mapOpenAPITypeToTypeScript(property.type[0]); // İlk eleman
                        } else {
                            type = mapOpenAPITypeToTypeScript(property.type);
                        }

                        return `
                            /**
                             * ${property.description || ''}
                             */
                            ${key}: ${type};`;
                    })
                );
            }
        }
    }

    // Ek özellikler varsa bunları da ekleriz
    if (schema.properties) {
        properties.push(
            ...Object.entries(schema.properties).map(([key, value]) => {
                const property = value as OpenAPIV2.SchemaObject | OpenAPIV3.SchemaObject | OpenAPIV3_1.SchemaObject;

                let type: string | undefined;

                if (Array.isArray(property.type)) {
                    type = mapOpenAPITypeToTypeScript(property.type[0]); // İlk eleman
                } else {
                    type = mapOpenAPITypeToTypeScript(property.type);
                }

                return `
                    /**
                     * ${property.description || ''}
                     */
                    ${key}: ${type};`;
            })
        );
    }

    // TypeScript içeriğini oluştur
    const modelContent = `
/**
 * ${schema.description || ''}
 */
export interface ${schemaName} ${extendsList.length > 0 ? `extends ${extendsList.join(', ')}` : ''} {
  ${properties.join('\n  ')}
}
`;

    fs.writeFileSync(filePath, modelContent.trim(), 'utf8');
    console.log(`Model oluşturuldu: ${filePath}`);
}




/**
 * Klasör oluşturmayı kolaylaştırır.
 * @param dirPath Klasör yolu.
 */
function ensureDirectoryExists(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, {recursive: true});
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
