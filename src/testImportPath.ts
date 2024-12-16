import {updateImportPathsWithAlias} from "./@utils/pathmatch/updateImportPathsWithAlias";


async function initializeImportPath() {
    try {


        await (async () => {
            const baseDir = "src/@models"; // Tüm src dizinini işle
            const aliasMap = {
                "@utils": "src/@utils",
                "@models": "src/@models"
            };

            await updateImportPathsWithAlias(baseDir, aliasMap);
            console.log("Import paths updated with alias successfully.");
        })();


    } catch (error) {
        console.error('Error initializing Swagger Client:', error);
    }
}

initializeImportPath();
