import path from "path";
import fs from "fs/promises";
import { isBarrelFile } from "../barrels";
import { ResolveOptions } from "./resolveOptions";
import { isFileExists } from "../isFileExists";

/**
 * Dynamically resolves references from barrel files, subdirectories, and individual files.
 * Supports alias-based root, base, and sub directories.
 * @param rootDir The root directory for models (e.g., `src`).
 * @param baseDir The base directory for models (e.g., `models`).
 * @param subDir Optional sub-directory for resolution (e.g., `inventory`).
 * @param options Optional configuration options.
 * @returns A record of references (keys) and their corresponding relative paths (values).
 */
export async function resolveDynamicRefs(
    rootDir: string,
    baseDir: string,
    subDir: string = "",
    options: ResolveOptions = {}
): Promise<Record<string, string>> {
    const resolvedRefs: Record<string, string> = {};
    const dirToProcess = path.resolve(rootDir, baseDir, subDir);
    const extensions = options.includeExtensions || [".ts"];

    async function traverseDirectory(dir: string) {
        const items = await fs.readdir(dir, { withFileTypes: true });

        for (const item of items) {
            const fullPath = path.join(dir, item.name);

            // Skip excluded directories
            if (item.isDirectory() && options.excludedDirectories?.includes(item.name)) {
                if (options.logLevel === "verbose") {
                    console.log(`Skipping excluded directory: ${item.name}`);
                }
                continue;
            }

            // Handle barrel files
            if (item.isFile() && item.name === "index.ts") {
                const barrelContent = await fs.readFile(fullPath, "utf8");
                if (isBarrelFile(barrelContent)) {
                    // Add the barrel file itself as a reference
                    const dirName = path.basename(dir);
                    resolvedRefs[dirName] = path
                        .relative(path.resolve(rootDir), fullPath) // Use rootDir for relative path
                        .replace(/\\/g, "/")
                        .replace(/\.ts$/, ""); // Remove .ts extension

                    const exports = barrelContent
                        .split("\n")
                        .map((line) => line.match(/export \* from ['"]\.\/(.*?)['"];/)?.[1])
                        .filter((exp): exp is string => typeof exp === "string");

                    for (const exp of exports) {
                        const resolvedPath = path.join(dir, `${exp}.ts`);
                        if (isFileExists(resolvedPath)) {
                            resolvedRefs[exp] = path
                                .relative(path.resolve(rootDir), resolvedPath) // Use rootDir for relative path
                                .replace(/\\/g, "/")
                                .replace(/\.ts$/, ""); // Remove .ts extension
                        }
                    }
                } else if (!options.resolveBarrelsOnly) {
                    if (options.logLevel === "verbose") {
                        console.warn(`Invalid barrel file at ${fullPath}. Ignoring its references.`);
                    }
                }

                // Skip adding `index.ts` itself if not a valid barrel
                continue;
            }

            // Handle individual files
            if (
                item.isFile() &&
                extensions.some((ext) => item.name.endsWith(ext)) &&
                (!options.excludeFiles || !options.excludeFiles.includes(item.name))
            ) {
                if (options.includeTestFiles === false && item.name.endsWith(".test.ts")) {
                    if (options.logLevel === "verbose") {
                        console.log(`Skipping test file: ${fullPath}`);
                    }
                    continue;
                }

                const fileName = item.name.replace(/\.[^.]+$/, ""); // Remove extension
                resolvedRefs[fileName] = path
                    .relative(path.resolve(rootDir), fullPath) // Use rootDir for relative path
                    .replace(/\\/g, "/")
                    .replace(/\.ts$/, "");
            }

            // Process subdirectories
            if (item.isDirectory()) {
                if (options.followSymlinks || !(await fs.lstat(fullPath)).isSymbolicLink()) {
                    await traverseDirectory(fullPath);
                } else if (options.logLevel === "verbose") {
                    console.log(`Skipping symbolic link: ${fullPath}`);
                }
            }
        }
    }

    if (options.logLevel !== "none") {
        console.log(`Resolving references in directory: ${dirToProcess}`);
    }

    await traverseDirectory(dirToProcess);

    if (options.logLevel !== "none") {
        console.log(`Resolved ${Object.keys(resolvedRefs).length} references.`);
    }

    return resolvedRefs;
}
