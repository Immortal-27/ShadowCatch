const { match } = require('path-to-regexp');
const AllowedRoute = require('../models/AllowedRoute');

// Cache compiled matchers for performance
let matcherCache = [];
let cacheValid = false;

/**
 * Rebuild the matcher cache from the database.
 * Call this after uploading a new spec.
 */
async function refreshCache() {
    const routes = await AllowedRoute.find({}).lean();
    matcherCache = routes.map((route) => ({
        path: route.path,
        method: route.method,
        matcher: match(route.path, { decode: decodeURIComponent }),
    }));
    cacheValid = true;
    console.log(`🔄 Path matcher cache refreshed: ${matcherCache.length} routes`);
}

/**
 * Match an incoming request path + method against the allowlist.
 * Returns { matched, route, methodAllowed } 
 */
function matchRoute(incomingPath, incomingMethod) {
    if (!cacheValid) {
        return { matched: false, route: null, methodAllowed: false };
    }

    const method = incomingMethod.toUpperCase();

    // First: find any route whose path pattern matches
    const pathMatches = matcherCache.filter((r) => {
        try {
            return r.matcher(incomingPath);
        } catch {
            return false;
        }
    });

    if (pathMatches.length === 0) {
        return { matched: false, route: null, methodAllowed: false };
    }

    // Then: check if the specific method is allowed
    const methodMatch = pathMatches.find((r) => r.method === method);

    return {
        matched: true,
        route: pathMatches[0].path,
        methodAllowed: !!methodMatch,
        allowedMethods: [...new Set(pathMatches.map((r) => r.method))],
    };
}

/**
 * Check if GET query params contain sensitive data keywords.
 */
function detectDataLeak(method, query) {
    if (method.toUpperCase() !== 'GET') return { leaked: false, fields: [] };

    const sensitivePatterns = [
        'password', 'passwd', 'pwd',
        'ssn', 'social_security',
        'token', 'access_token', 'refresh_token',
        'secret', 'api_key', 'apikey',
        'credit_card', 'card_number', 'cvv',
        'pin', 'auth',
    ];

    const queryKeys = Object.keys(query || {}).map((k) => k.toLowerCase());
    const leaked = queryKeys.filter((key) =>
        sensitivePatterns.some((pat) => key.includes(pat))
    );

    return { leaked: leaked.length > 0, fields: leaked };
}

function invalidateCache() {
    cacheValid = false;
}

module.exports = { matchRoute, detectDataLeak, refreshCache, invalidateCache };
