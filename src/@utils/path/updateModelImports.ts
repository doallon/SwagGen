import fs from "fs/promises";
import path from "path";
import {updateImportPaths} from "./updateImportPaths";

export async function updateModelImports(baseDir: string, subDir: string = "", aliases?: Record<string, string>) {
    const dirPath = path.resolve(baseDir, subDir);
    console.log(`Updating import paths in directory: ${dirPath}`);
    await updateImportPaths(dirPath, aliases);
}
