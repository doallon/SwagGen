import path from "path";
import fs from "fs/promises";
import { isBarrelFile } from "./isBarrelFile";
import { BarrelOptions } from "./barrelOptions";

const defaultOptions: BarrelOptions = {
    overwriteExisting: true,
    includeTestFiles: false,
    excludedDirectories: ["node_modules", "dist"],
    logLevel: "basic",
};

/**
 * Generates or updates barrel files for a directory and its subdirectories.
 * Supports root, base, and sub directory structures.
 * @param rootDir The root directory (e.g., `src`).
 * @param baseDir The base directory for models (e.g., `models`).
 * @param subDir The subdirectory for processing (e.g., `inventory`).
 * @param options Configuration options for barrel generation.
 */
export async function generateBarrelFiles(
    rootDir: string,
    baseDir: string,
    subDir: string = "",
    options: BarrelOptions = defaultOptions
): Promise<void> {
    const log = (message: string, level: "basic" | "verbose" = "basic") => {
        if (options.logLevel === "verbose" || (options.logLevel === "basic" && level === "basic")) {
            console.log(message);
        }
    };

    // Full directory to process
    const dirToProcess = path.resolve(rootDir, baseDir, subDir);

    /**
     * Processes a single directory and creates a barrel file.
     * @param dir The directory to process.
     */
    const processDirectory = async (dir: string): Promise<void> => {
        // Skip excluded directories
        if (options.excludedDirectories?.includes(path.basename(dir))) {
            log(`Skipping excluded directory: ${dir}`, "verbose");
            return;
        }

        const items = await fs.readdir(dir, { withFileTypes: true });

        const tsFiles = items
            .filter(item => item.isFile() && item.name.endsWith(".ts") && item.name !== "index.ts")
            .map(item => item.name)
            .filter(fileName => options.includeTestFiles || !fileName.endsWith(".test.ts"));

        const subDirs = items.filter(item => item.isDirectory()).map(item => item.name);

        const exports = [
            ...tsFiles.map(file => `export * from './${file.replace(/\.ts$/, "")}';`),
            ...subDirs.map(subDir => `export * from './${subDir}';`),
        ].join("\n");

        const barrelPath = path.join(dir, "index.ts");

        try {
            const existingContent = await fs.readFile(barrelPath, "utf8");

            if (!isBarrelFile(existingContent)) {
                log(`File at ${barrelPath} is not a valid barrel file. Skipping.`, "verbose");
                return;
            }

            if (!options.overwriteExisting && existingContent.trim() === exports.trim()) {
                log(`Barrel file at ${barrelPath} is up-to-date. Skipping.`, "verbose");
                return;
            }

            log(`Updating barrel file at: ${barrelPath}`);
        } catch {
            log(`Creating new barrel file at: ${barrelPath}`);
        }

        if (exports) {
            await fs.writeFile(barrelPath, exports, "utf8");
            log(`Barrel file created/updated: ${barrelPath}`);
        }

        // Recursively process subdirectories
        await Promise.all(subDirs.map(subDir => processDirectory(path.join(dir, subDir))));
    };

    try {
        log(`Starting barrel file generation in: ${dirToProcess}`);

        // Step 1: Process subDir
        if (subDir) {
            await processDirectory(dirToProcess);
        }

        // Step 2: Process baseDir (excluding subDir)
        if (!subDir) {
            const baseDirToProcess = path.resolve(rootDir, baseDir);
            await processDirectory(baseDirToProcess);
        }

        // Step 3: Process rootDir (excluding baseDir and subDir)
        if (!baseDir && !subDir) {
            await processDirectory(rootDir);
        }

        log(`Barrel file generation completed in: ${dirToProcess}`);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Error during barrel file generation: ${errorMessage}`);
        throw new Error(errorMessage);
    }
}
