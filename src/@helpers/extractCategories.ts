
import {OpenAPISchemas} from "swagger-client";
import {generalTerms} from "../types/generalTerms";


export function extractCategories(
    schemas: OpenAPISchemas
): string[] {
    const categories = new Set<string>();
    for (const schemaName of Object.keys(schemas)) {
        const detectedCategories = schemaName.match(/[A-Z][a-z]+/g) || [];
        detectedCategories.forEach((category) => {
            if (!generalTerms.includes(category)) {
                categories.add(category);
            }
        });
    }

    return Array.from(categories);
}


export function extractCategories1(
    schemas: OpenAPISchemas
): string[] {
    const categories = new Set<string>();

    for (const schemaName of Object.keys(schemas)) {
        const detectedCategories = schemaName.match(/[A-Z][a-z]+/g) || [];

        let tempCategory = ""; // Geçici kategori birleştirme
        detectedCategories.forEach((category) => {
            if (!generalTerms.includes(category)) {
                tempCategory += category; // Kelimeleri birleştir
                categories.add(category); // Ayrı ayrı da ekle
            }
        });

        if (tempCategory) {
            categories.add(tempCategory); // Birleştirilmiş kategoriyi ekle
        }
    }



    console.log('--------------------- Folder -------------------')
const myCategory = Array.from(categories);
    console.table(myCategory);
    return Array.from(categories); // Dizi olarak döndür
}
