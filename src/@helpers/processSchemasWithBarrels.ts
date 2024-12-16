import path from "path";
import { OpenAPIV2, OpenAPIV3, OpenAPIV3_1 } from "openapi-types";
import {extractCategories} from "./extractCategories";
import {ensureDirectoryExists} from "../@utils";
import {writeModelToFile} from "./writeModelToFile";
import {determineCategory} from "./determineCategory";
import {determineFolderName} from "./determineFolderName";

/**
 * Processes schemas and generates TypeScript models with barrel files.
 * @param schemas The schemas to process.
 * @param outputDir The output directory for the models.
 * @param aliases Optional alias mappings.
 */
export async function processSchemasWithBarrels(
    schemas: Record<
        string,
        OpenAPIV2.SchemaObject | OpenAPIV3.SchemaObject | OpenAPIV3_1.SchemaObject
    >,
    outputDir: string,
    aliases?: Record<string, string>
): Promise<void> {
    const knownCategories = extractCategories(schemas);
    const barrelFiles: Record<string, Set<string>> = {};

    for (const [schemaName, schema] of Object.entries(schemas)) {
        try {
            const category = determineCategory(schemaName, knownCategories, "common");
            const type = determineFolderName(schemaName, "model");

            const categoryDir = path.join(outputDir, category);
            const typeDir = path.join(categoryDir, type);
            ensureDirectoryExists(typeDir);

            const modelFilePath = path.join(typeDir, `${schemaName}.ts`);
            /*await writeModelToFile(schemaName, schema, modelFilePath, schemas, outputDir);*/
        } catch (error) {
            console.error(
                `Error generating model for schema "${schemaName}": ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
        }
    }
}
