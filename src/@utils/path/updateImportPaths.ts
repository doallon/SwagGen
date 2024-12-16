import fs from "fs/promises";
import path from "path";
import fs1 from "fs";
import { isBarrelFile } from "../barrels";

/**
 * Updates import paths in all TypeScript files to use barrel files, aliases, or fallback paths.
 * @param baseDir The base directory to process.
 * @param aliasMap A map of alias prefixes and their corresponding paths.
 * @returns The updated import path, if any.
 */
export async function updateImportPaths(
    baseDir: string,
    aliasMap?: Record<string, string>
): Promise<string | null> {
    async function traverseDirectory(dir: string): Promise<string | null> {
        const items = await fs.readdir(dir, { withFileTypes: true });

        for (const item of items) {
            const fullPath = path.join(dir, item.name);

            if (item.isFile() && item.name.endsWith(".ts") && item.name !== "index.ts") {
                const updatedPath = await updateFileImports(fullPath, dir);
                if (updatedPath) return updatedPath; // Return the updated path
            } else if (item.isDirectory()) {
                const updatedPath = await traverseDirectory(fullPath);
                if (updatedPath) return updatedPath; // Return the updated path from subdirectory
            }
        }

        return null; // No updates found
    }

    async function updateFileImports(filePath: string, currentDir: string): Promise<string | null> {
        const fileContent = await fs.readFile(filePath, "utf8");

        const updatedContent = fileContent.replace(
            /import\s+.*?from\s+['"](\..*?)['"]/g,
            (match, importPath) => {
                const resolvedPath = path.resolve(currentDir, importPath);
                const parentDir = path.dirname(resolvedPath);

                // Step 1: Check for barrel file (index.ts)
                if (fs1.existsSync(path.join(parentDir, "index.ts"))) {
                    const barrelContent = fs1.readFileSync(path.join(parentDir, "index.ts"), "utf-8");
                    if (isBarrelFile(barrelContent)) {
                        const relativePath = path.relative(currentDir, parentDir).replace(/\\/g, "/");
                        console.log(`Barrel file found. Using path: ./${relativePath}`);
                        return `./${relativePath}`;
                    }
                }

                // Step 2: Check alias mapping
                if (aliasMap) {
                    for (const [alias, aliasPath] of Object.entries(aliasMap)) {
                        const absoluteAliasPath = path.resolve(aliasPath);
                        if (resolvedPath.startsWith(absoluteAliasPath)) {
                            const aliasImportPath = resolvedPath.replace(absoluteAliasPath, alias).replace(/\\/g, "/");
                            console.log(`Alias match found. Using path: ${aliasImportPath}`);
                            return aliasImportPath;
                        }
                    }
                }

                // Step 3: Fallback to "./src" path
                const fallbackPath = path.relative(currentDir, resolvedPath).replace(/\\/g, "/");
                console.log(`Fallback path used: ${fallbackPath}`);
                return fallbackPath.startsWith(".") ? fallbackPath : `./${fallbackPath}`;
            }
        );

        if (fileContent !== updatedContent) {
            await fs.writeFile(filePath, updatedContent, "utf8");
            console.log(`Updated imports in: ${filePath}`);
        }

        return null; // No specific updates for this file
    }

    return traverseDirectory(baseDir);
}
