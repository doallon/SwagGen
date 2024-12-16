import * as fs from 'fs';
import * as path from 'path';
import { OpenAPIV2, OpenAPIV3, OpenAPIV3_1 } from 'openapi-types';
import {isReferenceObject, parseResponseType} from "../@helpers";

/**
 * Contract dosyalarını oluşturur.
 * @param paths Swagger JSON içindeki paths kısmı.
 * @param outputDir Çıktı dizini.
 * @param version Swagger versiyonu ('v2', 'v3', 'v3.1').
 */
export function generateContracts(
    paths: OpenAPIV2.PathsObject | OpenAPIV3.PathsObject | OpenAPIV3_1.PathsObject,
    outputDir: string,
    version: 'v2' | 'v3' | 'v3.1'
) {
    // Çıktı dizini oluştur
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    for (const [endpoint, methods] of Object.entries(paths)) {
        for (const [method, op] of Object.entries(methods)) {
            if (!op || typeof op !== 'object') {
                console.warn(`Geçersiz işlem: ${endpoint} -> ${method}`);
                continue;
            }

            // `op` değişkenini uygun türde işaretleyin
            const operation = op as OpenAPIV2.OperationObject | OpenAPIV3.OperationObject | OpenAPIV3_1.OperationObject;

            const operationId = operation.operationId || 'UnknownOperation';
            const contractName = `${operationId}Contract`;
            const contractFilePath = path.join(outputDir, `${contractName}.ts`);

            // Yanıt türünü belirleyin
            const responseType = parseResponseType(operation.responses || {});

            // Parametreleri topla
            // Extract parameters
            const parameters = (operation.parameters || []).map((param: any) => {
                if (version === 'v3' || version === 'v3.1') {
                    const paramV3 = param as OpenAPIV3.ParameterObject | OpenAPIV3_1.ParameterObject;

                    if (paramV3.schema) {
                        // Check if the schema is a ReferenceObject
                        if (isReferenceObject(paramV3.schema)) {
                            return `${paramV3.name}: any /* referenced type */`;
                        } else {
                            const name = paramV3.name || 'unknownParam';
                            const type = paramV3.schema.type || 'any';
                            return `${name}: ${type}`;
                        }
                    }
                    return `${paramV3.name || 'unknownParam'}: any`; // Fallback for undefined schema
                } else {
                    const paramV2 = param as OpenAPIV2.ParameterObject;
                    const name = paramV2.name || 'unknownParam';
                    const type = (paramV2 as any).type || 'any';
                    return `${name}: ${type}`;
                }
            });

            // Contract dosya içeriğini oluştur
            const contractContent = `
import { AxiosRequestConfig } from 'axios';

export interface ${contractName} {
  ${method}(${parameters.join(', ')}): Promise<${responseType}>;
}
`;

            // Dosyayı yaz
            fs.writeFileSync(contractFilePath, contractContent.trim(), 'utf8');
            console.log(`Contract oluşturuldu: ${contractFilePath}`);
        }
    }
}
