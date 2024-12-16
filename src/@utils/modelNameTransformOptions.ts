/**
 * Options for transforming model names.
 */
export interface ModelNameTransformOptions {
    remove?: string[]; // Substrings to remove from the model name.
    replace?: Record<string, string>; // Substrings to replace with specific values.
    append?: string; // Text to append to the end of the model name.
    prepend?: string; // Text to prepend to the beginning of the model name.
}

/**
 * Default options for transforming model names.
 */
export const defaultModelNameTransformOptions: ModelNameTransformOptions = {
    remove: [], // Default: Remove nothing
    replace: {}, // Default: No replacements
    append: "", // Default: No text appended
    prepend: "", // Default: No text prepended
};
