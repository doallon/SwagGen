import {ModelNameTransformOptions} from "../@utils/modelNameTransformOptions";

/**
 * Options for process schemas options.
 */
export interface ProcessSchemasOptions {
    beforeWrite?: (schemaName: string, filePath: string) => void;
    afterWrite?: (schemaName: string, filePath: string) => void;
    defaultCategory?: string;
    defaultType?: string;
    modelNameTransformOptions?: ModelNameTransformOptions;
}

/**
 * Default options for transforming model names.
 */
export const defaultProcessSchemasOptions: ProcessSchemasOptions = {

    defaultCategory: "common",
    defaultType: "model",
    modelNameTransformOptions: {
        remove: [""], // Remove "Dto" from the model name
        replace: {}, // Replace "View" with "Details" replace: { "View": "Details" },
        append: "",// Append "Model" to the name
        prepend:""
    },
    beforeWrite: (schemaName: any, filePath: any) => {
        console.log(`About to write model: ${schemaName} to ${filePath}`);
    },
    afterWrite: (schemaName: any, filePath: any) => {
        console.log(`Successfully wrote model: ${schemaName} to ${filePath}`);
    },
};
