/// <reference path="./types/declarations.d.ts" />
import path from 'path';
import {loadSwaggerSpec} from "./@helpers/swaggerLoader";


const filePath = path.resolve(__dirname, './swagger-definitions/sample.json');

async function initializeClient() {
    try {
        // Load and validate the Swagger/OpenAPI spec
        const spec = await loadSwaggerSpec(filePath);

        if (spec) {
            console.log('Swagger spec loaded successfully:');
            console.log(`- Title: ${spec.info.title}`);
            console.log(`- Version: ${spec.info.version}`);
            console.log(`- Paths: ${Object.keys(spec.paths || {}).join(', ') || 'None'}`);

            // Determine OpenAPI version dynamically from the spec
            const openAPIVersion = spec.openapi ? 'v3' : 'v2';

            // Access schemas dynamically based on OpenAPI version
            const schemas =
                openAPIVersion === 'v2'
                    ? spec.definitions // OpenAPI 2.0
                    : spec.components?.schemas; // OpenAPI 3.x

            if (schemas) {
                console.log('Schemas/Definitions:');
                for (const [schemaName, schemaDetails] of Object.entries(schemas)) {
                    console.log(`  - ${schemaName}:`, schemaDetails);
                }
            } else {
                console.log('No schemas or definitions found.');
            }
        } else {
            console.error('Spec is undefined.');
        }
    } catch (error) {
        console.error('Error initializing Swagger Client:', error);
    }
}

initializeClient();
