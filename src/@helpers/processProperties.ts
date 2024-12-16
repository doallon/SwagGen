import { OpenAPIV2, OpenAPIV3, OpenAPIV3_1 } from "openapi-types";
import { mapOpenAPITypeToTypeScript } from "./mapOpenAPITypeToTypeScript";
import { isReferenceObject } from "./isReferenceObject";
import { OpenAPISchemas } from "swagger-client";
import { transformModelName } from "../@utils/transformModelName";
import { resolveReferenceName } from "../@utils";
import {isIJsonSchema} from "../@utils/iJsonSchemaHandlers/isIJsonSchema";
import {handleIJsonSchema} from "../@utils/iJsonSchemaHandlers/handleIJsonSchema";

/**
 * Processes schema properties and returns TypeScript property definitions.
 * Handles nested objects, arrays, and `$ref` references for imports.
 * @param properties Schema properties.
 * @param schemas All schemas (for reference resolution).
 * @param imports A set to collect imports for referenced schemas.
 * @param modelNameTransform Model name transformation options (e.g., remove "Dto").
 * @returns TypeScript property definitions.
 */

export function processProperties(
    properties: Record<string, any> = {},
    schemas: OpenAPISchemas,
    imports: Set<string>,
    modelNameTransform?: { remove?: string[]; replace?: Record<string, string>; append?: string }
): string[] {
    return Object.entries(properties).map(([key, value]) => {
        const property = value as OpenAPIV2.SchemaObject | OpenAPIV3.ArraySchemaObject | OpenAPIV3_1.ArraySchemaObject;

        let type: string;

        if (isIJsonSchema(property)) {
            // Handle IJsonSchema-specific properties
            type = handleIJsonSchema(property);
        } else if (property.type === "array" && property.items) {
            if (isReferenceObject(property.items)) {
                const refName = resolveReferenceName(property.items.$ref);
                const transformedRefName = modelNameTransform
                    ? transformModelName(refName, modelNameTransform)
                    : refName;
                imports.add(transformedRefName);
                type = `${transformedRefName}[]`;
            } else {
                const itemType = property.items.type;
                type = `${mapOpenAPITypeToTypeScript(itemType, property.items, schemas)}[]`;
            }
        } else if (property.enum) {
            // Handle enums as literal union types
            type = property.enum.map((e) => `'${e}'`).join(" | ");
        } else if ("oneOf" in property || "anyOf" in property) {
            // Handle oneOf/anyOf
            const altSchemas = property.oneOf || property.anyOf || [];
            type = altSchemas
                .map((schema) => {
                    if (isReferenceObject(schema)) {
                        const refName = resolveReferenceName(schema.$ref);
                        const transformedRefName = modelNameTransform
                            ? transformModelName(refName, modelNameTransform)
                            : refName;
                        imports.add(transformedRefName);
                        return transformedRefName;
                    } else {
                        return mapOpenAPITypeToTypeScript(schema.type, schema, schemas);
                    }
                })
                .join(" | ");
        } else if (isReferenceObject(property)) {
            const refName = resolveReferenceName(property.$ref);
            const transformedRefName = modelNameTransform
                ? transformModelName(refName, modelNameTransform)
                : refName;
            imports.add(transformedRefName);
            type = transformedRefName; // Use transformedName instead of the raw refName
        } else if (property.type === "object" && property.properties) {
            // Process nested properties recursively
            const nestedProperties = processProperties(property.properties, schemas, imports, modelNameTransform);
            type = `{ ${nestedProperties.join("\n")} }`;
        } else {
            type = mapOpenAPITypeToTypeScript(property.type, property, schemas);
        }

        // Nullable and optional handling
        const nullable = "nullable" in property && property.nullable ? "?" : "";
        const description = !isReferenceObject(property) && "description" in property
            ? property.description || "No description provided."
            : "No description provided.";

        return `/**
 * ${description}
 */
${key}${nullable}: ${type};`.trim();
    });
}
