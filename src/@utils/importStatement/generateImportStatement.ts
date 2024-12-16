import path from "path";

/**
 * Generates import statements for resolved references.
 * @param rootDir The root directory of the project.
 * @param baseDir The base directory for resolving paths.
 * @param subDir The sub-directory for further resolving paths.
 * @param resolvedRefs A map of references and their resolved relative paths.
 * @param aliases Optional alias mappings from tsconfig or webpack.
 * @returns An array of generated import statements.
 */
export function generateImportStatement(
    rootDir: string,
    baseDir: string,
    subDir: string,
    resolvedRefs: Record<string, string>,
    aliases?: Record<string, string>
): string[] {
    const importStatements: string[] = [];

    for (const [ref, relativePath] of Object.entries(resolvedRefs)) {
        let importPath = "";

        // Step 1: Normalize paths
        const normalizedRelativePath = path.normalize(relativePath).replace(/\\/g, "/");
        const absolutePath = path.resolve(rootDir, normalizedRelativePath);
/*

        console.log("Processing reference:", ref);
        console.log("Relative path:", relativePath);
        console.log("Normalized relative path:", normalizedRelativePath);
        console.log("Absolute path:", absolutePath);
*/

        // Step 2: Alias Resolution
        if (aliases) {
            for (const [alias, aliasPath] of Object.entries(aliases)) {
                const resolvedAliasBase = aliasPath.startsWith(rootDir)
                    ? path.resolve(aliasPath.replace("/*", ""))
                    : path.resolve(rootDir, aliasPath.replace("/*", ""));

                if (absolutePath.startsWith(resolvedAliasBase)) {
                    importPath = absolutePath
                        .replace(resolvedAliasBase, alias.replace("/*", ""))
                        .replace(/\\/g, "/");
                    /*console.log(`Alias matched for ${ref}: ${importPath}`);*/
                    break; // Alias matched, stop further checks
                }
            }
        }

        // Step 3: Use barrel file if available
        if (!importPath) {
            const dir = path.dirname(absolutePath);
            const barrelFilePath = path.join(dir, "index.ts");
            const relativeDir = path.relative(path.join(rootDir, baseDir, subDir), dir).replace(/\\/g, "/");

            if (resolvedRefs["index"] === barrelFilePath) {
                importPath = relativeDir; // Use the directory path for barrel file
                /*console.log(`Using barrel file for ${ref}: ${importPath}`);*/
            }
        }

        // Step 4: Fallback to Relative Path (No alias or barrel)
        if (!importPath) {
            importPath = path
                .relative(path.join(rootDir, baseDir, subDir), absolutePath)
                .replace(/\\/g, "/")
                .replace(/\.ts$/, ""); // Remove .ts extension

            // Adjust relative path by prefixing `./` for local imports
            if (!importPath.startsWith(".")) {
                importPath = `./${importPath}`;
            }

           /* console.log(`Fallback to relative path for ${ref}: ${importPath}`);*/
        }

        // Step 5: Ensure proper formatting of the import statement
        if (importPath) {
            importStatements.push(`import { ${ref} } from '${importPath}';`);
        } else {
            /*console.warn(`Unable to resolve import path for reference: ${ref}`);*/
        }
    }

    return importStatements;
}
