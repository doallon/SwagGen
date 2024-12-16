import fs from "fs";
import path from "path";
import { OpenAPIObject, OpenAPISchemas } from "swagger-client";
import {
    ensureDirectoryExists, resolveReferenceName,
} from "../@utils";
import { processProperties } from "./processProperties";
import {transformModelName} from "../@utils/transformModelName";
import {ModelNameTransformOptions} from "../@utils/modelNameTransformOptions";
import {isReferenceObject} from "./isReferenceObject";

/**
 * Writes a TypeScript model file from an OpenAPI schema:
 * 1. Resolves `allOf` inheritance and properties.
 * 2. Processes schema properties.
 * 3. Generates import statements (barrel files or relative paths).
 * 4. Generates and writes the TypeScript interface to the target file.
 */


export async function writeModelToFile(
    schemaName: string,
    schema: OpenAPIObject,
    filePath: string,
    schemas: OpenAPISchemas,
    modelNameTransform?: ModelNameTransformOptions
): Promise<void> {
    const properties: string[] = [];
    const extendsList: string[] = [];
    const imports: Set<string> = new Set();

    const transformedSchemaName = modelNameTransform
        ? transformModelName(schemaName, modelNameTransform)
        : schemaName;

    if ("allOf" in schema && schema.allOf) {
        for (const item of schema.allOf) {
            if (isReferenceObject(item)) {
                const refName = resolveReferenceName(item.$ref);
                const transformedRefName = modelNameTransform
                    ? transformModelName(refName, modelNameTransform)
                    : refName;

                if (refName && schemas[refName]) {
                    extendsList.push(transformedRefName);
                    imports.add(transformedRefName);
                }
            } else if ("properties" in item) {
                properties.push(
                    ...processProperties(item.properties, schemas, imports, modelNameTransform)
                );
            }
        }
    }

    if (schema.properties) {
        properties.push(
            ...processProperties(schema.properties, schemas, imports, modelNameTransform)
        );
    }

    const modelContent = `
/**
 * ${schema.description || `Model for ${transformedSchemaName}`}
 */
export interface ${schemaName} ${extendsList.length ? `extends ${extendsList.join(", ")}` : ""} {
  ${properties.join("\n  ")}
}
`;

    const resolvedDir = path.dirname(filePath);
    ensureDirectoryExists(resolvedDir);

    try {
        fs.writeFileSync(filePath, modelContent.trim(), "utf8");
        /*console.log(`Model written successfully: ${filePath}`);*/
    } catch (error) {
        console.error(`Failed to write model file "${filePath}":`, error);
        throw error;
    }
}
