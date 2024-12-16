import { IJsonSchema, OpenAPIV2, OpenAPIV3, OpenAPIV3_1 } from "openapi-types";
import { isReferenceObject } from "./isReferenceObject";
import { OpenAPISchemas } from "swagger-client";

/**
 * Maps OpenAPI types to TypeScript types, including nested and referenced schemas.
 * @param type OpenAPI type.
 * @param property The schema property.
 * @param schemas All schemas for reference resolution.
 * @param parentSchemaName Parent schema name (for nested type resolution).
 * @returns The TypeScript type or full interface.
 */
export function mapOpenAPITypeToTypeScript(
    type: string | string[] | undefined,
    property?: OpenAPIV2.SchemaObject | OpenAPIV3.SchemaObject | OpenAPIV3_1.SchemaObject | OpenAPIV3.ReferenceObject | OpenAPIV3_1.ReferenceObject | IJsonSchema,
    schemas: OpenAPISchemas = {},
    parentSchemaName?: string
): string {
    // Handle array of types (e.g., union types)
    if (Array.isArray(type)) {
        type = type[0];
    }

    // Handle references
    if (property && isReferenceObject(property)) {
        const refName = resolveReference(property, schemas);
        return refName || "any";
    }

    // Handle OpenAPI types
    switch (type) {
        case "integer":
        case "number":
            return "number";
        case "array":
            return handleArrayType(property, schemas);
        case "boolean":
            return "boolean";
        case "string":
            return handleStringType(property);
        case "object":
            return handleObjectType(property, schemas, parentSchemaName);
        default:
            return "any";
    }
}

/**
 * Resolves a $ref to its schema name.
 * @param property The reference object.
 * @param schemas All schemas.
 * @returns The resolved schema name or undefined.
 */
function resolveReference(
    property: OpenAPIV3.ReferenceObject | OpenAPIV3_1.ReferenceObject,
    schemas: Record<string, any>
): string | undefined {
    const refName = property.$ref.split("/").pop();
    return refName && schemas[refName] ? refName : undefined;
}

/**
 * Handles array types and maps their items to TypeScript types.
 * @param property The schema property.
 * @param schemas All schemas for reference resolution.
 * @returns The TypeScript type for the array.
 */
function handleArrayType(
    property:
        | OpenAPIV2.SchemaObject
        | OpenAPIV3.SchemaObject
        | OpenAPIV3_1.SchemaObject
        | OpenAPIV3.ReferenceObject
        | OpenAPIV3_1.ReferenceObject
        | IJsonSchema
        | undefined,
    schemas: Record<string, any>
): string {
    if (property && "items" in property && property.items) {
        if (isReferenceObject(property.items)) {
            const refName = resolveReference(property.items, schemas);
            return `${refName}[]`;
        } else if ("type" in property.items) {
            const itemType = Array.isArray(property.items.type)
                ? property.items.type[0]
                : property.items.type;
            return `${mapOpenAPITypeToTypeScript(itemType, property.items, schemas)}[]`;
        }
    }
    return "any[]";
}

/**
 * Handles object types and maps their properties to TypeScript types.
 * @param property The schema property.
 * @param schemas All schemas for reference resolution.
 * @param parentSchemaName Parent schema name (for nested type resolution).
 * @returns The TypeScript type for the object.
 */
function handleObjectType(
    property:
        | OpenAPIV2.SchemaObject
        | OpenAPIV3.SchemaObject
        | OpenAPIV3_1.SchemaObject
        | IJsonSchema
        | undefined,
    schemas: Record<string, any>,
    parentSchemaName?: string
): string {
    if (property && "properties" in property && property.properties) {
        const nestedProperties = Object.entries(property.properties)
            .map(([key, nestedProperty]) => {
                if (isReferenceObject(nestedProperty)) {
                    const refName = resolveReference(nestedProperty, schemas);
                    return `${key}: ${refName || "any"};`;
                } else {
                    const propertyType = Array.isArray(nestedProperty.type)
                        ? nestedProperty.type[0]
                        : nestedProperty.type;

                    return `${key}: ${mapOpenAPITypeToTypeScript(
                        propertyType,
                        nestedProperty,
                        schemas,
                        parentSchemaName
                    )};`;
                }
            })
            .join(" ");
        return `{ ${nestedProperties} }`;
    }
    return "Record<string, any>";
}

/**
 * Handles string types with additional constraints like enums or formats.
 * @param property The schema property.
 * @returns The TypeScript type for the string.
 */
function handleStringType(
    property:
        | OpenAPIV2.SchemaObject
        | OpenAPIV3.SchemaObject
        | OpenAPIV3_1.SchemaObject
        | IJsonSchema
        | undefined
): string {
    if (property && property.enum) {
        return property.enum.map((e) => `'${e}'`).join(" | ");
    }

    if (property && "format" in property && property.format) {
        switch (property.format) {
            case "date-time":
            case "date":
                return "string"; // Can be replaced with `Date` if preferred
            case "email":
            case "uuid":
                return "string";
            default:
                return "string";
        }
    }

    return "string";
}
