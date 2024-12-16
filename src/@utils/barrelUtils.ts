import fs from "fs/promises";
import path from "path";

export async function addToBarrelFiles(
    barrelFiles: Record<string, Set<string>>,
    directory: string,
    item: string
): Promise<void> {
    if (!barrelFiles[directory]) {
        barrelFiles[directory] = new Set();
    }
    barrelFiles[directory].add(item);
}

export async function generateBarrelFiles(barrelFiles: Record<string, Set<string>>): Promise<void> {
    for (const [directory, items] of Object.entries(barrelFiles)) {
        const barrelPath = path.join(directory, "index.ts");
        const content = Array.from(items)
            .map(item => `export * from './${item.replace(/\.ts$/, "")}';`)
            .join("\n");

        try {
            const existingContent = await fs.readFile(barrelPath, "utf8");
            if (existingContent.trim() === content.trim()) {
                console.log(`Barrel file at ${barrelPath} is up-to-date.`);
                continue;
            }
        } catch {
            console.log(`Creating new barrel file: ${barrelPath}`);
        }

        await fs.writeFile(barrelPath, content, "utf8");
        console.log(`Barrel file updated: ${barrelPath}`);
    }
}
