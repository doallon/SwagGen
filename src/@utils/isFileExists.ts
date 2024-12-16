import fs from "fs";

/**
 * Checks if a file exists synchronously.
 * @param filePath The file path to check.
 * @returns True if the file exists, false otherwise.
 */
export function isFileExists(filePath: string): boolean {
    try {
        fs.accessSync(filePath);
        return true;
    } catch {
        return false;
    }
}
