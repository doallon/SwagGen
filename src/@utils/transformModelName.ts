import { ModelNameTransformOptions} from "./modelNameTransformOptions";

/**
 * Transforms model names by removing, replacing, appending, or prepending specific substrings.
 * @param modelName The original model name.
 * @param options Options for renaming the model.
 * @returns The transformed model name.
 */
export function transformModelName(
    modelName: string,
    options: ModelNameTransformOptions
): string {
    let transformedName = modelName;

    // Remove specific substrings
    if (options.remove) {
        for (const substr of options.remove) {
            transformedName = transformedName.replace(substr, "");
        }
    }

    // Replace specific substrings
    if (options.replace) {
        for (const [key, value] of Object.entries(options.replace)) {
            transformedName = transformedName.replace(new RegExp(key, "g"), value);
        }
    }

    // Prepend text
    if (options.prepend) {
        transformedName = options.prepend + transformedName;
    }

    // Append text
    if (options.append) {
        transformedName += options.append;
    }

    return transformedName;
}
