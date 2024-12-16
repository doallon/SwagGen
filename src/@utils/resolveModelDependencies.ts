import { OpenAPISchemas } from "swagger-client";
import { transformModelName } from "./transformModelName";
import { resolveReferenceName } from "./resolveReferenceName";
import { ModelNameTransformOptions } from "./modelNameTransformOptions";
import {determineCategory} from "../@helpers/determineCategory";
import {determineFolderName} from "../@helpers";


/**
 * Resolves dependencies for a given schema.
 * Ensures all dependencies are unique using a Set.
 * @param schema The schema to resolve dependencies for.
 * @param schemas All available schemas for reference resolution.
 * @param modelNameTransform Optional transformation rules for model names.
 * @returns An array of resolved dependency names with categories for import paths.
 */
export function resolveModelDependencies(
    schema: any,
    schemas: OpenAPISchemas,
    modelNameTransform?: ModelNameTransformOptions
): { name: string; importPath: string }[] {
    const dependencies: Set<string> = new Set();

    const transformName = (name: string): string => {
        return modelNameTransform ? transformModelName(name, modelNameTransform) : name;
    };

    const resolveSchema = (currentSchema: any, isTopLevel: boolean = false) => {
        if (currentSchema && typeof currentSchema === "object") {
            // Handle `$ref`
            if ("$ref" in currentSchema && currentSchema.$ref) {
                const refName = resolveReferenceName(currentSchema.$ref);
                const transformedName = transformName(refName);
                dependencies.add(transformedName);
            }

            // Handle `allOf`
            if ("allOf" in currentSchema && Array.isArray(currentSchema.allOf)) {
                currentSchema.allOf.forEach((subSchema: any) => resolveSchema(subSchema, true));
            }

            // Handle `oneOf` and `anyOf`
            if ("oneOf" in currentSchema && Array.isArray(currentSchema.oneOf)) {
                currentSchema.oneOf.forEach((subSchema: any) => resolveSchema(subSchema));
            }
            if ("anyOf" in currentSchema && Array.isArray(currentSchema.anyOf)) {
                currentSchema.anyOf.forEach((subSchema: any) => resolveSchema(subSchema));
            }

            // Handle `properties` only for top-level schemas
            if (isTopLevel && "properties" in currentSchema && typeof currentSchema.properties === "object") {
                for (const property of Object.values(currentSchema.properties)) {
                    resolveSchema(property);
                }
            }

            // Handle `items` in arrays
            if ("type" in currentSchema && currentSchema.type === "array" && currentSchema.items) {
                resolveSchema(currentSchema.items);
            }
        }
    };

    resolveSchema(schema, true);

    // Convert Set to Array with import paths
    return Array.from(dependencies).map((dep) => {
        const category = determineCategory(dep, Object.keys(schemas), "common");
        const folder = determineFolderName(dep, "model");
        return {
            name: dep,
            importPath: `@models/${category}/${folder}/${dep}`,
        };
    });
}
