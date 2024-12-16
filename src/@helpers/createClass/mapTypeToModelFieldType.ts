import {ModelFieldType} from "../../@core/model";

/**
 * Maps a field type to a corresponding ModelFieldType.
 * @param fieldType The field type as a string.
 * @param resolvedRefs Optional map of resolved references for model classes.
 * @returns The corresponding ModelFieldType.
 */
export function mapTypeToModelFieldType(
    fieldType: string,
    resolvedRefs: Record<string, string> = {}
): { fieldType: ModelFieldType; arrayElementType?: ModelFieldType | null } {
    // Check if the field is an array
    if (fieldType.endsWith("[]")) {
        const elementType = fieldType.slice(0, -2); // Remove "[]" to get the element type
        const elementFieldType = mapTypeToModelFieldType(elementType, resolvedRefs);
        return { fieldType: ModelFieldType.ARRAY, arrayElementType: elementFieldType.fieldType };
    }

    // Handle primitive types
    if (fieldType === "string") return { fieldType: ModelFieldType.STRING };
    if (fieldType === "number") return { fieldType: ModelFieldType.NUMBER };
    if (fieldType === "boolean") return { fieldType: ModelFieldType.BOOLEAN };


    // Check if the field is a class (using resolvedRefs)
    if (resolvedRefs[fieldType]) return { fieldType: ModelFieldType.CLASS };

    // Fallback to OBJECT for unknown types
    return { fieldType: ModelFieldType.OBJECT };
}
