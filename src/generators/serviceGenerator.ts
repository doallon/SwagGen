import * as fs from 'fs';
import * as path from 'path';
import { OpenAPIV2, OpenAPIV3, OpenAPIV3_1 } from 'openapi-types';
import { parseResponseType, isReferenceObject } from '../@helpers';

/**
 * Generates TypeScript service classes from OpenAPI paths.
 * @param paths - The OpenAPI paths object (v2, v3, or v3.1).
 * @param outputDir - The directory where services should be generated.
 * @param version - The OpenAPI version ('v2', 'v3', or 'v3.1').
 */
export function generateServices(
    paths: OpenAPIV2.PathsObject | OpenAPIV3.PathsObject | OpenAPIV3_1.PathsObject,
    outputDir: string,
    version: 'v2' | 'v3' | 'v3.1'
): void {
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    for (const [endpoint, methods] of Object.entries(paths)) {
        for (const [method, op] of Object.entries(methods)) {
            if (!op || typeof op !== 'object') {
                console.warn(`Invalid operation at endpoint: ${endpoint}, method: ${method}`);
                continue;
            }

            const operation = op as OpenAPIV2.OperationObject | OpenAPIV3.OperationObject | OpenAPIV3_1.OperationObject;

            const operationId = operation.operationId || `UnnamedOperation_${method}`;
            const serviceName = `${operationId}Service`;
            const repositoryName = `${operationId}Repository`;
            const contractName = `${operationId}Contract`;
            const serviceFilePath = path.join(outputDir, `${serviceName}.ts`);

            // Determine parameters
            const parameters = (operation.parameters || []).map((param: any) => {
                if (version === 'v3' || version === 'v3.1') {
                    const paramV3 = param as OpenAPIV3.ParameterObject;
                    const paramName = paramV3.name || 'unknownParam';

                    let paramType = 'any';
                    if (paramV3.schema) {
                        paramType = isReferenceObject(paramV3.schema)
                            ? 'any'
                            : (paramV3.schema as OpenAPIV3.SchemaObject).type || 'any';
                    }

                    return `${paramName}: ${paramType}`;
                } else {
                    const paramV2 = param as OpenAPIV2.ParameterObject;
                    const paramName = paramV2.name || 'unknownParam';
                    const paramType = (paramV2 as any).type || 'any';
                    return `${paramName}: ${paramType}`;
                }
            });

            // Determine response type
            const responseType = parseResponseType(operation.responses || {});

            // Generate service content
            const serviceContent = `
import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import { AxiosRequestConfig } from 'axios';

import type { ${contractName} } from '@/@contracts';
import { TYPES } from '@/container/service.types';

/**
 * ${serviceName} is responsible for managing business logic related to ${operationId}.
 */
@injectable()
export class ${serviceName} {
  protected readonly ${operationId}Repository: ${contractName};

  /**
   * Constructor for ${serviceName}
   *
   * @param ${operationId}Repository - The repository responsible for ${operationId}-related API requests
   */
  constructor(
    @inject(TYPES.${repositoryName}) ${operationId}Repository: ${contractName}
  ) {
    this.${operationId}Repository = ${operationId}Repository;
  }

  /**
   * Calls the ${method.toUpperCase()} method in the ${repositoryName}.
   *
   * @param ${parameters.join(', ')}
   * @param config - Optional Axios configuration.
   * @returns The response from the repository.
   */
  public async ${method}(
    ${parameters.join(', ')},
    config?: AxiosRequestConfig
  ): Promise<${responseType}> {
    // Add business logic here if needed
    return this.${operationId}Repository.${method}(${parameters
                .map((p) => p.split(':')[0])
                .join(', ')}, config);
  }
}
`;

            // Write the service file
            fs.writeFileSync(serviceFilePath, serviceContent.trim(), 'utf8');
            console.log(`Service generated: ${serviceFilePath}`);
        }
    }
}
