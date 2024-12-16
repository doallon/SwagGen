import path from "path";
import fs from "fs/promises"; // fs/promises modülünü kullan

/**
 * Generates or updates barrel files for each directory.
 * @param barrelFiles A mapping of directories to the files/directories they should export.
 */
export async function generateBarrelFiles2(barrelFiles: Record<string, Set<string>>): Promise<void> {
    for (const [directory, items] of Object.entries(barrelFiles)) {
        const barrelPath = path.join(directory, "index.ts");

        // Mevcut barrel dosyasını oku (varsa)
        let existingExports: Set<string> = new Set();
        try {
            const existingContent = await fs.readFile(barrelPath, "utf8");
            existingExports = new Set(
                existingContent
                    .split("\n")
                    .filter(line => line.startsWith("export * from"))
                    .map(line => line.match(/'(.+?)'/)?.[1] || "")
            );
        } catch {
            console.log(`No existing barrel file found at ${barrelPath}. Creating a new one.`);
        }

        // Yeni dosyaları ekle
        const newExports = Array.from(items).filter(item => !existingExports.has(`./${item.replace(/\.ts$/, "")}`));
        if (newExports.length === 0) {
            console.log(`No new exports to add in ${barrelPath}.`);
            continue;
        }

        // Güncel içerik oluştur
        const updatedExports = Array.from(new Set([...existingExports, ...items]))
            .map(item => `export * from './${item.replace(/\.ts$/, "")}';`)
            .join("\n");

        // Barrel dosyasını yaz
        await fs.writeFile(barrelPath, updatedExports, "utf8");
        console.log(`Barrel file updated: ${barrelPath}`);
    }
}
