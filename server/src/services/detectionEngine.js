const { matchRoute, detectDataLeak } = require('../utils/pathMatcher');

/**
 * Analyze an incoming request and classify it.
 * Returns classification result object.
 */
function analyzeRequest(req) {
    const path = req.path || req.url;
    const method = req.method;
    const query = req.query || {};

    const result = {
        path,
        method,
        classification: 'valid',
        severity: 'none',
        severityScore: 0,
        matchedRoute: null,
        details: '',
    };

    // Check 1: Data leak in GET query params (highest priority)
    const leakCheck = detectDataLeak(method, query);
    if (leakCheck.leaked) {
        result.classification = 'data-leak';
        result.details = `Sensitive data in query params: ${leakCheck.fields.join(', ')}`;
        const score = scoreSeverity(result);
        result.severity = score.level;
        result.severityScore = score.score;
        return result;
    }

    // Check 2 & 3: Route matching
    const routeResult = matchRoute(path, method);

    if (!routeResult.matched) {
        // Shadow endpoint — not in spec at all
        result.classification = 'shadow';
        result.details = `Undocumented endpoint: ${method} ${path}`;
        const score = scoreSeverity(result);
        result.severity = score.level;
        result.severityScore = score.score;
        return result;
    }

    result.matchedRoute = routeResult.route;

    if (!routeResult.methodAllowed) {
        // Method mismatch — route exists but method isn't allowed
        result.classification = 'method-mismatch';
        result.details = `Method ${method} not allowed. Allowed: ${routeResult.allowedMethods.join(', ')}`;
        const score = scoreSeverity(result);
        result.severity = score.level;
        result.severityScore = score.score;
        return result;
    }

    // Valid request
    return result;
}

/**
 * Score severity based on classification and path characteristics.
 */
function scoreSeverity({ classification, path, method }) {
    let score = 0;

    // Base score by classification
    switch (classification) {
        case 'data-leak':
            score = 90;
            break;
        case 'shadow':
            score = 50;
            break;
        case 'method-mismatch':
            score = 40;
            break;
        default:
            return { score: 0, level: 'none' };
    }

    // Boost for admin/internal/debug routes
    const dangerousPatterns = ['admin', 'internal', 'debug', 'secret', 'backdoor', 'nuke', 'delete', 'drop'];
    const pathLower = (path || '').toLowerCase();
    if (dangerousPatterns.some((p) => pathLower.includes(p))) {
        score += 30;
    }

    // Boost for destructive methods
    if (['DELETE', 'PUT', 'PATCH'].includes(method)) {
        score += 15;
    }
    if (method === 'POST') {
        score += 10;
    }

    // Cap at 100
    score = Math.min(score, 100);

    // Map to level
    let level;
    if (score >= 80) level = 'critical';
    else if (score >= 60) level = 'high';
    else if (score >= 40) level = 'medium';
    else level = 'low';

    return { score, level };
}

module.exports = { analyzeRequest };
