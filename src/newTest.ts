import {generateTypesFromFile} from "./other/generateTypesFromFile";

const run = async () => {
    const inputPath = '../swagger-definitions/sample.json'; // Swagger JSON dosyasının yolu
    const outputPath = "./output"; // Çıkış dosyalarının yazılacağı dizin
    const importsNotUsedAsValues = true; // Opsiyonel ayar


    try {
        const result = await generateTypesFromFile({
            inputPath,
            outputPath,
            importsNotUsedAsValues,
        });
        console.log("Generation Result:", result);
    } catch (error) {
        console.error("An error occurred:", error);
    }
};

run();
