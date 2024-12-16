import axios from 'axios';
import SwaggerParser from '@apidevtools/swagger-parser';


type OperationObject = {
    summary?: string;
    description?: string;
    [key: string]: any;
};

export async function readSwaggerJson(url: string): Promise<void> {
    try {
        console.log(`Swagger JSON dosyası alınıyor: ${url}`);

        // Swagger JSON dosyasını indir
        const response = await axios.get(url);
        const swaggerJson = response.data;

        console.log("Swagger JSON başarıyla indirildi.");

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
            for (const [method, details] of Object.entries<OperationObject>(methods || {})) {
                console.log(`  * ${method.toUpperCase()}: ${details.summary || 'Özet yok'}`);
            }
        }
    } catch (error) {
        console.error("Swagger JSON okunurken bir hata oluştu:", error);
    }
}

