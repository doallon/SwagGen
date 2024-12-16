import {OpenAPISchemas} from "swagger-client";

/**
 * Extracts schemas from a Swagger/OpenAPI specification.
 * @param swaggerSpec The loaded Swagger/OpenAPI specification.
 * @returns The schemas from the specification.
 */
export function extractSchemas(
    swaggerSpec: any
): OpenAPISchemas  {
    // OpenAPI 3.x: components.schemas
    if (swaggerSpec.components?.schemas) {
        return swaggerSpec.components.schemas;
    }

    // OpenAPI 2.0: definitions
    if (swaggerSpec.definitions) {
        return swaggerSpec.definitions;
    }

    return {}; // No schemas found
}
