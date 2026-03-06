const SwaggerParser = require('@apidevtools/swagger-parser');
const AllowedRoute = require('../models/AllowedRoute');

/**
 * Parse a Swagger/OpenAPI spec file and store all routes
 * in the AllowedRoute collection.
 */
async function parseAndStore(filePath, specName = 'default') {
    const api = await SwaggerParser.validate(filePath);

    const routes = [];

    for (const [path, methods] of Object.entries(api.paths || {})) {
        // Convert OpenAPI path params {id} → :id for Express-style matching
        const normalizedPath = path.replace(/\{(\w+)\}/g, ':$1');

        for (const [method, details] of Object.entries(methods)) {
            // Skip non-HTTP method keys like 'parameters', 'summary', etc.
            const httpMethods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];
            if (!httpMethods.includes(method.toLowerCase())) continue;

            routes.push({
                path: normalizedPath,
                method: method.toUpperCase(),
                summary: details.summary || details.description || '',
                parameters: details.parameters || [],
                specName,
            });
        }
    }

    // Clear previous routes for this spec and insert new ones
    await AllowedRoute.deleteMany({ specName });
    const inserted = await AllowedRoute.insertMany(routes, { ordered: false }).catch((err) => {
        // Handle duplicate key errors gracefully
        if (err.code === 11000) {
            console.warn('⚠️  Some duplicate routes were skipped');
            return err.insertedDocs || [];
        }
        throw err;
    });

    console.log(`✅ Parsed spec "${specName}": ${routes.length} routes stored`);

    return {
        specName,
        title: api.info?.title || 'Unknown API',
        version: api.info?.version || '0.0.0',
        routeCount: routes.length,
        routes,
    };
}

module.exports = { parseAndStore };
