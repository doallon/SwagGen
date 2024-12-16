import {transformModelName} from "./transformModelName";
import {ModelNameTransformOptions} from "./modelNameTransformOptions";

/**
 * Resolves a $ref string to a schema name.
 * @param ref The $ref string.
 * @param modelNameTransform Model name transformation options (e.g., remove "Dto").
 * @returns The resolved schema name.
 */
export function resolveReferenceName(ref: string, modelNameTransform?: ModelNameTransformOptions ): string {
    const parts = ref.split("/");
    const name = parts.pop() || "";
    return modelNameTransform ? transformModelName(name, modelNameTransform) : name;
}
