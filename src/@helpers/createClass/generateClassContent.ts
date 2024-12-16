import { mapTypeToModelFieldType } from "./mapTypeToModelFieldType";
import { ModelNameTransformOptions } from "../../@utils/modelNameTransformOptions";
import {OpenAPIObject, OpenAPISchemas} from "swagger-client";

export function generateClassContent(
    schemaName: string,
    schema: OpenAPIObject,
    schemas: OpenAPISchemas,
    modelNameTransform?: ModelNameTransformOptions,
    resolvedRefs: Record<string, string>
): string {
    const imports = new Set<string>();
    const properties: string[] = [];
    const requiredFields = schema.required || [];
    const schemaProperties = schema.properties || {};

    for (const [key, value] of Object.entries(schemaProperties)) {
        if (typeof value !== 'object' || value === null) {
            throw new Error(`Invalid schema property for key: ${key}`);
        }

        const { fieldType, arrayElementType } = mapTypeToModelFieldType(value.type || 'any', resolvedRefs);
        const defaultValue =
            'default' in value ? value.default : (
                fieldType === 'text'
                    ? "''"
                    : fieldType === 'number'
                        ? 0
                        : fieldType === 'boolean'
                            ? false
                            : null
            );

        properties.push(`
            @ModelField({
                type: '${fieldType}',
                ${arrayElementType ? `elementType: '${arrayElementType}',` : ''}
                defaultValue: ${JSON.stringify(defaultValue)},
                required: ${requiredFields.includes(key)},
                label: '${key}',
                placeholder: 'Enter ${key}'
            })
            ${key}: ${value.type || 'any'};
        `);

        if (value.$ref) {
            const refName = value.$ref.split('/').pop();
            if (refName && resolvedRefs[refName]) {
                imports.add(`import { ${refName} } from '${resolvedRefs[refName]}';`);
            }
        }
    }

    imports.add(`import { BaseModel, ModelField } from '../../@core/model';`);

    const className = schemaName.replace(/^I/, '');
    return `
${Array.from(imports).join('\n')}

export class ${className} extends BaseModel {
    ${properties.join('\n')}

    constructor() {
        super();
    }
}
`.trim();
}
