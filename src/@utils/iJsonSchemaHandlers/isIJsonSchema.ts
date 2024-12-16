import {IJsonSchema} from "openapi-types";

/**
 * Checks if the given property is an IJsonSchema object.
 * @param property - The property to check.
 * @returns True if the property is an IJsonSchema object.
 */
export function isIJsonSchema(property: any): property is IJsonSchema {
    return property && typeof property === "object" && "type" in property && "properties" in property;
}
