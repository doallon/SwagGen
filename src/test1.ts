/// <reference path="./types/swagger.d.ts" />
/// <reference path="./types/yaml.d.ts" />

import path from 'path';
import {readSwaggerJson} from "./@utils/readSwaggerJson";
import {readSwaggerFromFile} from "./@utils/readSwaggerFromFile";
import {loadSwaggerSpec} from "./@helpers/swaggerLoader";

const filePath = path.resolve(__dirname, './swagger-definitions/sample.json');

async function processModels() {


// Kullanım
    // Örnek bir Swagger JSON URL'si
    await loadSwaggerSpec(filePath);
}

void processModels();
