import path from "path";
import fs from "fs/promises";
import fsSync from "fs";
import {isBarrelFile} from "../barrels";

/**
 * Resolves a dynamic import path for a reference.
 * @param ref The referenced schema name.
 * @param baseDir The base directory for models.
 * @param subDir Optional manual sub-directory for resolution.
 * @returns The resolved dynamic import path.
 */
export async function resolveDynamicPath(
    ref: string,
    baseDir: string,
    subDir: string = ""
): Promise<string> {
    const fullDir = path.resolve(baseDir, subDir);

    // Step 1: Check barrel file (index.ts) in the current directory
    const barrelFilePath = path.join(fullDir, "index.ts");
    if (fsSync.existsSync(barrelFilePath)) {
        const barrelContent = await fs.readFile(barrelFilePath, "utf8");

        // Check if the index.ts is a valid barrel file
        if (isBarrelFile(barrelContent)) {
            const exports = barrelContent
                .split("\n")
                .map((line) => line.match(/export \* from ['"]\.\/(.*?)['"];/)?.[1])
                .filter((exp): exp is string => typeof exp === "string");

            if (exports.includes(ref)) {
                const relativePath = path.relative(baseDir, fullDir);
                return path.join(relativePath, ref).replace(/\\/g, "/");
            }
        } else {
            console.warn(`The file at ${barrelFilePath} is not a valid barrel file.`);
        }
    }

    // Step 2: Check for a direct file in the directory
    const directFilePath = path.join(fullDir, `${ref}.ts`);
    if (fsSync.existsSync(directFilePath)) {
        const relativePath = path.relative(baseDir, directFilePath);
        return relativePath.replace(/\\/g, "/").replace(/\.ts$/, "");
    }

    // Step 3: Recursively search subdirectories
    const subDirs = await fs.readdir(fullDir, { withFileTypes: true });
    for (const sub of subDirs) {
        if (sub.isDirectory()) {
            const resolvedPath = await resolveDynamicPath(
                ref,
                baseDir,
                path.join(subDir, sub.name)
            ).catch(() => null); // Ignore errors for subdirectory traversal
            if (resolvedPath) {
                return resolvedPath;
            }
        }
    }

    // Step 4: Throw an error if the reference cannot be resolved
    throw new Error(
        `Unable to resolve dynamic path for reference "${ref}" in directory "${baseDir}" with sub-directory "${subDir}".`
    );
}
