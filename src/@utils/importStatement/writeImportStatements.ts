import fs from "fs/promises";
import path from "path";

/**
 * Writes necessary import statements to model files, ensuring no duplicate imports.
 * @param dependencyMap Map of models and their dependencies.
 * @param resolvedRefs Map of resolved reference paths for models.
 * @param importStatements List of generated import statements.
 * @param rootDir Root directory of the project.
 * @param baseDir Base directory for models.
 * @param subDir Subdirectory (optional).
 */
export async function writeImportStatements(
    dependencyMap: Record<string, string[]>, // Model and their references map
    resolvedRefs: Record<string, string>,   // Map of resolved reference paths
    importStatements: string[],             // Generated import statements
    rootDir: string,
    baseDir: string,
    subDir: string
): Promise<void> {
    for (const [modelName, refs] of Object.entries(dependencyMap)) {
        try {
            // Resolve the full path for the model file
            let relativePath = resolvedRefs[modelName];
            if (!relativePath) {
                console.warn(`[WARN] No resolved path found for model: ${modelName}`);
                continue;
            }

            if (!relativePath.endsWith(".ts")) {
                relativePath += ".ts";
            }

            const filePath = path.resolve(rootDir, relativePath);
            console.log(`[INFO] Processing model: ${modelName}`);
            console.log(`[INFO] Resolved file path: ${filePath}`);

            // Check if the file exists
            await fs.access(filePath);

            // Read existing file content
            const existingContent = await fs.readFile(filePath, "utf8");

            // Extract existing import statements from the file
            const existingImports = existingContent
                .split("\n")
                .filter((line) => line.startsWith("import "))
                .map((line) => line.trim());

            console.log(`[INFO] Existing imports for ${modelName}:`, existingImports);

            // Filter relevant imports for the current model
            const relevantImports = refs
                .map((ref) => {
                    // Find appropriate import statement for the reference
                    return importStatements.find((statement) => statement.includes(`{ ${ref} }`));
                })
                .filter(Boolean) as string[]; // Remove undefined entries

            console.log(`[INFO] Relevant imports for ${modelName}:`, relevantImports);

            // Merge existing imports with new ones, ensuring uniqueness
            const allImports = Array.from(new Set([...existingImports, ...relevantImports]));

            console.log(`[INFO] Unique imports for ${modelName}:`, allImports);

            // Remove old imports from the content
            const contentWithoutImports = existingContent
                .split("\n")
                .filter((line) => !line.startsWith("import "))
                .join("\n")
                .trim();

            // Generate updated content with imports at the top
            const updatedContent = [
                ...allImports,
                "",
                contentWithoutImports,
            ].join("\n");

            // Write the updated content back to the file
            await fs.writeFile(filePath, updatedContent, "utf8");
            console.log(`[SUCCESS] Updated import statements in: ${filePath}`);
        } catch (error) {
            if (error instanceof Error && (error as NodeJS.ErrnoException).code === "ENOENT") {
                console.error(`[ERROR] File not found: ${modelName}`);
            } else if (error instanceof Error) {
                console.error(`[ERROR] Failed to write imports for ${modelName}:`, error.message);
            } else {
                console.error(`[ERROR] Unknown error for ${modelName}:`, error);
            }
        }
    }
}
