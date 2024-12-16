import SwaggerClient from "swagger-client";
import * as fs from "fs";
import * as path from "path";
import {isURL} from "../@utils";

/**
 * Loads a Swagger/OpenAPI specification from a file or URL.
 * @param inputPath Path or URL to the Swagger/OpenAPI file.
 * @returns The Swagger/OpenAPI specification.
 */

export async function loadSwaggerSpec(inputPath: string): Promise<any> {
    try {
        console.log("Input Path:", inputPath);
        if (isURL(inputPath)) {
            console.log("Detected as URL. Fetching...");
            const client = await SwaggerClient.resolve({ url: inputPath });
            if (!client || !client.spec) {
                throw new Error(`Failed to load Swagger specification from URL.`);
            }
            console.log("Swagger specification loaded from URL.");
            return client.spec;
        } else {
            const resolvedPath = path.resolve(inputPath);
            console.log("Resolved local file path:", resolvedPath);
            if (!fs.existsSync(resolvedPath)) {
                throw new Error(`File not found at path: ${resolvedPath}`);
            }
            const rawData = fs.readFileSync(resolvedPath, "utf8");
            console.log("Swagger specification loaded from file.");
            return JSON.parse(rawData);
        }
    } catch (err) {
        console.error("Error loading Swagger specification:", err);
        throw new Error(`Failed to load Swagger specification: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
}
