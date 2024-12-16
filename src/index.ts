import SwaggerClient from 'swagger-client';

const client = new SwaggerClient({
    url: 'swagger-definitions/sample.json',
});

console.log(client.spec);
