/// <reference path="./types/swagger.d.ts" />
/// <reference path="./types/yaml.d.ts" />

import path from "path";

import {aliases} from "./types/aliases";
import {getSubDir, resolveOutputDirFromAlias} from "./@utils";
import {loadSwaggerSpec} from "./@helpers/swaggerLoader";
import {ProcessSchemas} from "./@helpers";
import {generateBarrelFiles} from "./@utils";
import {BarrelOptions} from "./@utils/barrels/barrelOptions";
import {ResolveOptions} from "./@utils/path/resolveOptions";
import {resolveDynamicRefs} from "./@utils/path/resolveDynamicRefs";
import {generateImportStatement, writeImportStatements} from "./@utils/importStatement";
import {
    defaultProcessSchemasOptions,
    ProcessSchemasOptions
} from "./@helpers/processSchemasOptions";


async function processModels() {
    const alias = aliases["@models/*"];
    const rootDir = "src";
    const baseDir = resolveOutputDirFromAlias(rootDir,alias);
    /*const baseDir = "models";*/

    const inputPath = "https://petstore3.swagger.io/api/v3/openapi.json";
    const swaggerSpec = await loadSwaggerSpec(inputPath);
    const subDir = 'petstore3'
    const dynamicSubDir = getSubDir(swaggerSpec, subDir)

    const finalOutputDir = path.join(rootDir,baseDir, dynamicSubDir);

    console.log(`Resolved output directory: ${finalOutputDir}`);

    const schemas = swaggerSpec.components?.schemas || {};

/*
    console.log("Schemas:", Object.keys(schemas));
*/


    const processSchemasOptions: ProcessSchemasOptions = {
        ...defaultProcessSchemasOptions,
        modelNameTransformOptions: {
            remove:[""],
            prepend:"myModel"
        },

    };
/*
    const modelOptions1 = {
            defaultCategory: "common",
            defaultType: "model",
        modelNameTransform: {
                remove: ["Dto"], // Remove "Dto" from the model name
                replace: {}, // Replace "View" with "Details" replace: { "View": "Details" },
                append: "",// Append "Model" to the name
                prepend:"I"
            },
            beforeWrite: (schemaName: any, filePath: any) => {
                console.log(`About to write model: ${schemaName} to ${filePath}`);
            },
            afterWrite: (schemaName: any, filePath: any) => {
                console.log(`Successfully wrote model: ${schemaName} to ${filePath}`);
            },
        }*/

    const modelOptions = {
        defaultCategory: "common",
        defaultType: "model",
        modelNameTransform: {
            remove: [""], // Remove "Dto" from the model name
            replace: {}, // Replace "View" with "Details" replace: { "View": "Details" },
            append: "",// Append "Model" to the name
            prepend:"I" // Prepend "I" to the name
        }
    }

            /*await ProcessSchemas(schemas,rootDir,baseDir,subDir,options);*/
    const dependencyMap = await ProcessSchemas(schemas, rootDir, baseDir, subDir, modelOptions);

        console.table(dependencyMap);

        const barrelOptions: BarrelOptions = {
            overwriteExisting: false,
            includeTestFiles: false,
            excludedDirectories: ["node_modules", "dist"],
            logLevel: "verbose",
        };


    // Step 1: Generate Barrel Files

        /*console.log(`Generating barrel files in: ${path.resolve(rootDir,baseDir, subDir)}`);*/
        await generateBarrelFiles(rootDir,baseDir, subDir, barrelOptions);
        console.log("Barrel files generated successfully.");


        const resolvedOptions: ResolveOptions = {
            logLevel: "verbose",
            includeTestFiles: false,
            excludedDirectories: ["node_modules", "dist"],
            followSymlinks: true,
            resolveBarrelsOnly: false,
            includeExtensions: [".ts", ".tsx"],
            excludeFiles: ["legacy.ts"],
        };

        const myAliases = {
            "@models/*": "src/@models/*",
        };



    // Step 2: Resolve Dynamic References
        const resolvedRefs = await resolveDynamicRefs(rootDir,baseDir, subDir, resolvedOptions);
        console.log(resolvedRefs);

    // Step 3: Generate Import Statements
        const importStatements = generateImportStatement(rootDir,baseDir, subDir,resolvedRefs,myAliases);

/*
        console.log("Resolved importStatements:", importStatements);
*/

    // Step 5: Write import statements to the models
    await writeImportStatements(dependencyMap,resolvedRefs, importStatements, rootDir, baseDir, subDir);


}

processModels().catch(console.error);
