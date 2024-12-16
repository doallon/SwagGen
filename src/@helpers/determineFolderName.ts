/**
 * Determines the folder of a schema based on its name.
 * @param schemaName The name of the schema.
 * @param defaultFolder The default folder if no match is found (default: 'model').
 * @returns The determined type.
 */

export function determineFolderName(
    schemaName: string,
    defaultFolder: string = "model"
): string {
    const lowerCaseName = schemaName.toLowerCase();

    const mappings = [
        { keyword: "request", folder: "request" },
        { keyword: "response", folder: "response" }
    ];

    for (const { keyword, folder } of mappings) {
        if (lowerCaseName.includes(keyword)) {
            return folder;
        }
    }

    return defaultFolder;
}
