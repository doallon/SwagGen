import fs from 'fs/promises';
import SwaggerParser from '@apidevtools/swagger-parser';

export async function readSwaggerFromFile(filePath: string): Promise<void> {
    try {
        console.log(`Swagger JSON dosyası okunuyor: ${filePath}`);

        // Dosyadan JSON oku
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const swaggerJson = JSON.parse(fileContent);

        console.log("Swagger JSON başarıyla okundu.");

        // Swagger dosyasını çözümle ve doğrula
        const api = await SwaggerParser.validate(swaggerJson);

        console.log("Swagger JSON doğrulandı.");
        console.log("API Bilgileri:");
        console.log(`- Başlık: ${api.info.title}`);
        console.log(`- Versiyon: ${api.info.version}`);
        console.log(`- Açıklama: ${api.info.description || 'Açıklama bulunmuyor.'}`);

        // API yollarını listele
        console.log("\nYollar (Paths):");
        for (const [path, methods] of Object.entries(api.paths || {})) {
            console.log(`- ${path}`);
            for (const [method, details] of Object.entries(methods || {})) {
                if (typeof details === 'object' && details !== null) {
                    console.log(`  * ${method.toUpperCase()}: ${(details as any).summary || 'Özet yok'}`);
                }
            }
        }
    } catch (error) {
        console.error("Swagger JSON okunurken bir hata oluştu:", error);
    }
}
