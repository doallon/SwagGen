import { addToBarrelFiles } from "./addToBarrelFiles";
import path from "path";
import fs from "fs/promises";

export async function processDirectories(baseDir: string): Promise<Record<string, Set<string>>> {
    const barrelFiles: Record<string, Set<string>> = {};

    async function traverseDirectory(dir: string) {
        // Modern fs/promises.readdir kullanımı
        const items = await fs.readdir(dir, { withFileTypes: true });

        for (const item of items) {
            if (item.isFile() && item.name.endsWith(".ts") && item.name !== "index.ts") {
                addToBarrelFiles(barrelFiles, dir, item.name);
            } else if (item.isDirectory()) {
                const subDir = path.join(dir, item.name);
                addToBarrelFiles(barrelFiles, dir, item.name); // Alt dizinler için barrel oluşturma
                await traverseDirectory(subDir);
            }
        }
    }

    await traverseDirectory(baseDir);
    return barrelFiles;
}

