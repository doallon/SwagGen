import path from 'path';
import {generateBarrelFiles} from "./@utils";


async function initializeBarrel() {
    try {

        await (async () => {
            const baseDir = "src/@helpers";
            await generateBarrelFiles(baseDir);
            console.log("Barrel file generation completed.");
        })();

    } catch (error) {
        console.error('Error initializing Swagger Client:', error);
    }
}

initializeBarrel();
