import { extractCategories, writeModelToFile } from "../@helpers";
import path from "path";
import { ensureDirectoryExists, resolveReferenceName } from "../@utils";
import { OpenAPISchemas } from "swagger-client";
import { determineCategory } from "./determineCategory";
import { transformModelName } from "../@utils/transformModelName";
import {resolveModelDependencies} from "../@utils/resolveModelDependencies";
import {determineFolderName} from "./determineFolderName";


/**
 * Processes each schema and generates TypeScript models.
 * Additionally, resolves dependencies for each schema.
 * @param schemas The schemas to process.
 * @param rootDir The root directory for generated models.
 * @param baseDir The base directory for the models.
 * @param subDir Optional manual sub-directory for resolution.
 * @param options Additional configuration options.
 */

export async function ProcessSchemas(
    schemas: OpenAPISchemas,
    rootDir: string,
    baseDir: string,
    subDir?: string,
    options?: {
        beforeWrite?: (schemaName: string, filePath: string) => void;
        afterWrite?: (schemaName: string, filePath: string) => void;
        defaultCategory?: string;
        defaultType?: string;
        modelNameTransform?: { remove?: string[]; replace?: Record<string, string>; append?: string ,prepend?: string};
    }
): Promise<Record<string, string[]>> {
    const basePath = path.resolve(rootDir, baseDir, subDir || "");
    const knownCategories = extractCategories(schemas);

    if (knownCategories.length === 0) {
        console.warn("No categories extracted from schemas.");
    }

    const dependencyMap: Record<string, string[]> = {}; // Bağımlılıkları saklama
    const failedSchemas: string[] = [];

    // Her şemayı işleme
    for (const [schemaName, schema] of Object.entries(schemas)) {
        try {
            // Model adı dönüşümü
            let transformedSchemaName = schemaName;
            if (options?.modelNameTransform) {
                transformedSchemaName = transformModelName(schemaName, options.modelNameTransform);
            }

            const category = determineCategory(schemaName, knownCategories, options?.defaultCategory || "common");
            const type = determineFolderName(schemaName, options?.defaultType || "model");
            const categoryDir = path.resolve(basePath, category, type);
            const filePath = path.resolve(categoryDir, `${transformedSchemaName}.ts`);

            ensureDirectoryExists(filePath);

            // Bağımlılıkları çöz
/*            dependencyMap[transformedSchemaName] = resolveModelDependencies(
                schema,
                schemas,
                options?.modelNameTransform
            );*/

            // Resolve dependencies
            const dependencies = resolveModelDependencies(schema, schemas, options?.modelNameTransform);
            dependencyMap[transformedSchemaName] = dependencies.map((dep) => dep.name);


            if (options?.beforeWrite) {
                options.beforeWrite(transformedSchemaName, filePath);
            }

            await writeModelToFile(transformedSchemaName, schema, filePath, schemas, options?.modelNameTransform);

            if (options?.afterWrite) {
                options.afterWrite(transformedSchemaName, filePath);
            }
        } catch (error) {
            console.error(
                `Error processing schema "${schemaName}": ${error instanceof Error ? error.message : "Unknown error"}`
            );
            failedSchemas.push(schemaName);
        }
    }

    if (failedSchemas.length > 0) {
        console.warn(`Failed to process the following schemas: ${failedSchemas.join(", ")}`);
    }

    return dependencyMap;
}
