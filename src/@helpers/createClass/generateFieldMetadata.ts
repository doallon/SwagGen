import {mapTypeToModelFieldType} from "./mapTypeToModelFieldType";
import {ModelFieldType} from "../../@core/model";


export function generateFieldMetadata(
    fields: Record<string, { type: string; optional: boolean }>,
    resolvedRefs: Record<string, string>
): Record<string, any> {
    return Object.entries(fields).reduce((acc, [key, { type, optional }]) => {
        const { fieldType, arrayElementType } = mapTypeToModelFieldType(type, resolvedRefs);

        acc[key] = {
            type: fieldType,
            elementType: arrayElementType || null, // Array element type for arrays
            defaultValue: optional
                ? undefined
                : fieldType === ModelFieldType.STRING
                    ? ""
                    : fieldType === ModelFieldType.NUMBER
                        ? 0
                        : null,
            required: !optional,
            label: key,
            placeholder: `Enter ${key}`,
        };
        return acc;
    }, {} as Record<string, any>);
}
