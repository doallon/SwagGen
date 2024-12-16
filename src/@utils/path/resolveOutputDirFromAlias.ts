// src/@utils/path/resolveOutputDirFromAlias.ts

import path from "path";


export function resolveOutputDirFromAlias(rootDir: string, alias: string): string {
    if (!alias) {
        throw new Error("Alias is undefined or empty.");
    }
    const baseDir = alias.includes("/*") ? alias.replace("/*", "") : alias;
    return path.resolve(rootDir, baseDir); // Normalize edilmiş bir yol döner
}
