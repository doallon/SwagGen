import {IJsonSchema} from "openapi-types";

/**
 * Handles IJsonSchema-specific processing.
 * Maps IJsonSchema properties to TypeScript types.
 * @param schema - The IJsonSchema object to handle.
 * @returns The TypeScript representation of the schema.
 */
export function handleIJsonSchema(schema: IJsonSchema): string {
    if (schema.type === "object" && schema.properties) {
        // Process nested properties
        const properties = Object.entries(schema.properties)
            .map(([key, value]) => {
                const propertyType = Array.isArray(value.type) ? value.type[0] : value.type;
                const optional = schema.required && !schema.required.includes(key) ? "?" : "";
                return `${key}${optional}: ${propertyType || "any"};`;
            })
            .join("\n");
        return `{ ${properties} }`;
    } else if (schema.type === "array" && schema.items) {
        if (Array.isArray(schema.items)) {
            return `(${schema.items.map((item) => item.type || "any").join(" | ")})[]`;
        } else {
            return `${schema.items.type || "any"}[]`;
        }
    }

    // Default to "any" for unsupported types
    return <string>schema.type || "any";
}
