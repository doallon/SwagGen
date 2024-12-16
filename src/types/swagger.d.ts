// src/types/swagger.d.ts

declare module "swagger-client" {
    import { OpenAPIV2, OpenAPIV3, OpenAPIV3_1 } from "openapi-types";

    // Common Components Schema Type
    type ComponentsSchemas =
        | OpenAPIV2.DefinitionsObject
        | OpenAPIV3.ComponentsObject["schemas"]
        | OpenAPIV3_1.ComponentsObject["schemas"];

    // Unified Swagger Specification Type
    export type SwaggerSpec =
        | (OpenAPIV2.Document & {
        swagger: "2.0";
        definitions?: OpenAPIV2.DefinitionsObject;
    })
        | (OpenAPIV3.Document & {
        openapi: string;
        components?: { schemas?: ComponentsSchemas };
    })
        | (OpenAPIV3_1.Document & {
        openapi: string;
        components?: { schemas?: ComponentsSchemas };
    });

    /**
     * Combined OpenAPI Schema Object
     * Represents a unified type for OpenAPI Schema objects across all versions (v2, v3, v3.1).
     */
    export type OpenAPIObject =
        | OpenAPIV2.SchemaObject
        | OpenAPIV3.SchemaObject
        | OpenAPIV3_1.SchemaObject;

    /**
     * Unified OpenAPI Schemas
     * A record where the keys are schema names, and the values are OpenAPI schema objects.
     * @template T - The type of the schema object (defaults to OpenAPIObject).
     */
    export type OpenAPISchemas<T = OpenAPIObject> = Record<string, T>;

    /**
     * Generic Schema Record
     * A helper type to represent a record of schema objects with customizable schema type.
     * @template T - The type of schema objects within the record.
     */
    export type SchemaRecord<T> = Record<string, T>;

    // Extended Definitions for Paths, Operations, and Responses
    export interface SwaggerPaths {
        [path: string]: {
            [method: string]: OpenAPIV2.OperationObject | OpenAPIV3.OperationObject | OpenAPIV3_1.OperationObject;
        };
    }

    export interface SwaggerOperation {
        summary?: string;
        description?: string;
        operationId?: string;
        parameters?: OpenAPIV2.ParameterObject[] | OpenAPIV3.ParameterObject[] | OpenAPIV3_1.ParameterObject[];
        responses: OpenAPIV2.ResponsesObject | OpenAPIV3.ResponsesObject | OpenAPIV3_1.ResponsesObject;
    }

    export interface SwaggerParameter {
        name: string;
        in: "query" | "header" | "path" | "cookie" | "body";
        required?: boolean;
        schema?: OpenAPIObject;
        type?: string;
        description?: string;
    }

    export interface SwaggerResponse {
        status: number; // HTTP status code
        ok: boolean; // Indicates success or failure
        text: string; // Raw response text
        json: () => Record<string, unknown>; // Parsed JSON response
    }

    // Extended Options for the Swagger Client
    export interface SwaggerClientOptions {
        url?: string; // URL to fetch the OpenAPI/Swagger specification
        spec?: SwaggerSpec; // Provide the specification directly
        requestInterceptor?: (req: Request) => void; // Hook to modify requests
        responseInterceptor?: (res: Response) => void; // Hook to modify responses
        userFetch?: typeof fetch; // Custom fetch implementation
        parameters?: Record<string, any>; // Default parameters for operations
    }

    // Swagger Client Class
    export default class SwaggerClient {
        constructor(options: SwaggerClientOptions);

        /**
         * Executes an operation based on the options provided.
         * @param options - Options for the operation execution
         * @returns A promise resolving to the SwaggerResponse
         */
        execute(options: {
            operationId?: string;
            parameters?: Record<string, any>;
            requestBody?: any;
            securities?: Record<string, any>;
        }): Promise<SwaggerResponse>;

        /**
         * The resolved specification after processing.
         */
        spec: SwaggerSpec;

        /**
         * Returns all available paths and operations from the specification.
         * @returns A record of paths and their respective operations
         */
        getPaths(): SwaggerPaths;

        /**
         * Returns the details of a specific operation by its ID.
         * @param operationId - The operation's unique identifier
         * @returns The operation details
         */
        getOperationById(operationId: string): SwaggerOperation | undefined;

        /**
         * Static method to create and resolve a SwaggerClient instance.
         * @param options - Options for the client
         * @returns A promise resolving to a SwaggerClient instance
         */
        static resolve(options: SwaggerClientOptions): Promise<SwaggerClient>;
    }
}
