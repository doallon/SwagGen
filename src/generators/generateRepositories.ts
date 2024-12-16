import * as fs from 'fs';
import * as path from 'path';
import {OpenAPIV2, OpenAPIV3, OpenAPIV3_1} from 'openapi-types';
import {isReferenceObject, parseResponseType} from "../@helpers";

/**
 * Generates TypeScript repository classes from OpenAPI paths.
 * @param paths - The OpenAPI paths object (v2, v3, or v3.1).
 * @param outputDir - The directory where repositories should be generated.
 * @param version - The OpenAPI version ('v2', 'v3', or 'v3.1').
 */


export function generateRepositories(
    paths: OpenAPIV2.PathsObject | OpenAPIV3.PathsObject | OpenAPIV3_1.PathsObject,
    outputDir: string,
    version: 'v2' | 'v3' | 'v3.1'
): void {
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, {recursive: true});
    }

    for (const [endpoint, methods] of Object.entries(paths)) {
        for (const [method, op] of Object.entries(methods)) {
            if (!op || typeof op !== 'object') {
                console.warn(`Invalid operation at endpoint: ${endpoint}, method: ${method}`);
                continue;
            }

            const operation = op as OpenAPIV2.OperationObject | OpenAPIV3.OperationObject | OpenAPIV3_1.OperationObject;

            const operationId = operation.operationId || `UnnamedOperation_${method}`;
            const repositoryName = `${operationId}Repository`;
            const repositoryFilePath = path.join(outputDir, `${repositoryName}.ts`);

            // Extract parameters
            const parameters = (operation.parameters || []).map((param) => {
                if ('in' in param) {
                    const paramName = param.name || 'unknownParam';
                    let paramType = 'any';

                    if ('schema' in param && param.schema) {
                        if (isReferenceObject(param.schema)) {
                            paramType = param.schema.$ref?.split('/').pop() || 'any';
                        } else {
                            paramType = param.schema.type || 'any';
                        }
                    } else if ('type' in param) {
                        paramType = param.type || 'any';
                    }
                    return `${paramName}: ${paramType}`;
                }
                return 'unknownParam: any';
            });

            // Determine response type
            const responseType = parseResponseType(operation.responses || {});

            // Generate repository content
            const repositoryContent = `
import { injectable, inject } from 'inversify';
import { AxiosInstance } from 'axios';
import { TYPES } from '@/container/service.types';
import type { ${operationId}Contract } from '@/@contracts';

@injectable()
export class ${repositoryName} implements ${operationId}Contract {
  private readonly apiClient: AxiosInstance;

  constructor(@inject(TYPES.ApiClient) apiClient: AxiosInstance) {
    this.apiClient = apiClient;
  }

  public async ${method}(${parameters.join(', ')}): Promise<${responseType}> {
    const endpoint = '${endpoint}';
    const response = await this.apiClient.${method}(endpoint, {
      params: { ${parameters.map((p) => p.split(':')[0]).join(', ')} }
    });
    return response.data;
  }
}
`;

            // Write repository file
            fs.writeFileSync(repositoryFilePath, repositoryContent.trim(), 'utf8');
            console.log(`Repository generated: ${repositoryFilePath}`);
        }
    }
}

