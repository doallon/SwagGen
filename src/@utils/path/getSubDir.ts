
export function getSubDir(swaggerSpec: any, SubDir?: string): string {
    if (SubDir) {
        console.log(`Using manual subDir: ${SubDir}`);
        return SubDir;
    }
    if (!swaggerSpec || !swaggerSpec.info || !swaggerSpec.info.title) {
        throw new Error("Invalid Swagger spec. Missing 'info.title'.");
    }
    console.log("Generating subDir from Swagger info.title");
    return swaggerSpec.info.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");
}
