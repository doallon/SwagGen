import {IJsonSchema, OpenAPIV2, OpenAPIV3, OpenAPIV3_1} from "openapi-types";

type ExtendedSchemaObject =
    | OpenAPIV2.SchemaObject
    | OpenAPIV3.SchemaObject
    | OpenAPIV3_1.SchemaObject
    | OpenAPIV3.ReferenceObject
    | OpenAPIV3_1.ReferenceObject
    | IJsonSchema;

/**
 * Type guard to check if a schema is a ReferenceObject.
 * @param schema - The schema to check.
 * @returns True if the schema is a ReferenceObject.
 */
export function isReferenceObject(
    schema: ExtendedSchemaObject
): schema is OpenAPIV2.ReferenceObject | OpenAPIV3.ReferenceObject | OpenAPIV3_1.ReferenceObject {
    return schema && typeof schema === "object" && "$ref" in schema;
}
