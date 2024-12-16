import fs from "fs";
import path from "path";

/**
 * Ensures the directory for a file path exists.
 * @param filePath The file path.
 */
export function ensureDirectoryExists(filePath: string): void {
    const dir = path.dirname(filePath); // Use path.dirname for platform-independent directory extraction
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}
