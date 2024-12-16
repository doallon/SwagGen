import path from "path";
import fs from "fs";
import {ensureDirectoryExists} from "../ensureDirectoryExists";

/**
 * Finds the file path for a referenced model, considering barrel files and creates placeholder if needed.
 * @param ref The referenced schema name.
 * @param baseDir The base directory for models.
 * @param subDir Optional manual sub-directory for alias resolution.
 * @returns The file path to import from.
 */
export function findModelFilePath1(ref: string, baseDir: string, subDir?: string ): string {
    const resolvedBaseDir = path.resolve(baseDir, subDir||""); // Combine baseDir and subDir
    const specificFilePath = path.join(resolvedBaseDir, `${ref}.ts`);
    const potentialBarrelPath = path.join(resolvedBaseDir, "index.ts");

    // Step 1: Check for specific file
    if (fs.existsSync(specificFilePath)) {
        console.log(`Using specific file path: ${specificFilePath}`);
        return specificFilePath;
    }

    // Step 2: Check for barrel file
    if (fs.existsSync(potentialBarrelPath)) {
        console.log(`Using barrel file at: ${potentialBarrelPath}`);
        return resolvedBaseDir; // Return directory containing barrel file
    }

    // Step 3: Placeholder creation if the file does not exist
    if (!fs.existsSync(specificFilePath)) {
        console.warn(`Creating placeholder file: ${specificFilePath}`);
        const placeholderContent = `/**
 * Placeholder file for ${ref}.
 * TODO: Define the actual schema.
 */
export interface ${ref} {}`;
        ensureDirectoryExists(resolvedBaseDir); // Ensure the directory exists before writing
        fs.writeFileSync(specificFilePath, placeholderContent, "utf8");
        console.log(`Placeholder file created: ${specificFilePath}`);
    }

    return specificFilePath;
}



/**
 * Finds the file path for a referenced model, considering barrel files.
 * @param ref The referenced schema name.
 * @param baseDir The base directory for models.
 * @param subDir
 * @returns The file path to import from.
 */
export function findModelFilePath(ref: string, baseDir: string,subDir:string=""): string {
    const potentialBarrel = path.join(baseDir,subDir, ref, "index.ts");
    if (fs.existsSync(potentialBarrel)) {
        return path.join(baseDir,subDir); // Use the barrel file
    }
    return path.join(baseDir,subDir, ref);
}
