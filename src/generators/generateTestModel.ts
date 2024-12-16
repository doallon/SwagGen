
import {loadSwaggerSpec} from "../@helpers/swaggerLoader";
import {extractSchemas, processSchemas} from "../@helpers/processSwaggerSchema";
import {processSchemasWithBarrels} from "../@helpers/processSchemasWithBarrels";

/**
 * Generates TypeScript models from OpenAPI schemas, organized by category and type.
 * @param inputPath Path to the Swagger JSON file or URL.
 * @param outputDir Output directory for generated models.
 * @param aliases
 */
export async function generateTestModels1(
    inputPath: string,
    outputDir: string,
    aliases?: Record<string, string>
): Promise<void> {
    try {
        // Load and validate the Swagger/OpenAPI specification
        const swaggerSpec = await loadSwaggerSpec(inputPath);

        // Extract schemas from the specification
        const schemas = extractSchemas(swaggerSpec);

        if (!schemas || Object.keys(schemas).length === 0) {
            console.warn("No schemas found in the Swagger/OpenAPI specification.");
            return;
        }

        // Process each schema and generate models
        /*await processSchemas(schemas, outputDir);*/
        await processSchemasWithBarrels(schemas, outputDir,aliases);

        console.log("All models generated successfully!");
    } catch (error) {
        console.error(
            `Error processing Swagger specification: ${
                error instanceof Error ? error.message : "Unknown error"
            }`
        );
    }
}


/**
 * Generates TypeScript models from OpenAPI schemas, organized by category and type.
 * @param inputPath Path to the Swagger JSON file or URL.
 * @param outputDir Output directory for generated models.
 * @param aliases Optional aliases for resolving imports.
 */
export async function generateTestModels(
    inputPath: string,
    outputDir: string,
    aliases?: Record<string, string>
): Promise<void> {
    try {
        // Load the Swagger/OpenAPI specification
        const swaggerSpec = await loadSwaggerSpec(inputPath);

        // Extract schemas from the specification
        const schemas = extractSchemas(swaggerSpec);

        if (!schemas || Object.keys(schemas).length === 0) {
            console.warn("No schemas found in the Swagger/OpenAPI specification.");
            return;
        }

        // Process schemas and generate models with barrel files
        await processSchemasWithBarrels(schemas, outputDir, aliases);

        console.log("All models generated successfully!");
    } catch (error) {
        console.error(
            `Error processing Swagger specification: ${
                error instanceof Error ? error.message : "Unknown error"
            }`
        );
    }
}
