/**
 * ShadowCatch Test Script
 * 
 * Run this AFTER starting all 3 services:
 *   - dummy-api (port 4000)
 *   - server (port 3001)
 *   - client (port 5173)
 * 
 * Usage: node test.js
 */

const fs = require('fs');
const path = require('path');

const SERVER = 'http://localhost:3001';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function uploadSpec() {
    console.log('\n📄 Step 1: Uploading Swagger spec...\n');

    const specPath = path.join(__dirname, 'sample-spec.json');
    const fileData = fs.readFileSync(specPath);

    // Build multipart form data manually
    const boundary = '----ShadowCatchBoundary' + Date.now();
    const body = Buffer.concat([
        Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="spec"; filename="sample-spec.json"\r\nContent-Type: application/json\r\n\r\n`),
        fileData,
        Buffer.from(`\r\n--${boundary}\r\nContent-Disposition: form-data; name="specName"\r\n\r\ndefault\r\n--${boundary}--\r\n`),
    ]);

    const res = await fetch(`${SERVER}/api/upload`, {
        method: 'POST',
        headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
        body,
    });

    const data = await res.json();
    console.log(`   ✅ ${data.message}`);
    console.log(`   📌 Routes loaded: ${data.routeCount}`);
    data.routes?.forEach((r) => console.log(`      ${r.method.padEnd(7)} ${r.path}`));
}

async function sendRequest(label, method, urlPath, emoji = '✅') {
    const url = `${SERVER}/proxy${urlPath}`;
    console.log(`\n${emoji} ${label}`);
    console.log(`   ${method} ${url}`);

    try {
        const res = await fetch(url, { method });
        const data = await res.json();
        console.log(`   Status: ${res.status}`);
        console.log(`   Response: ${JSON.stringify(data).substring(0, 120)}...`);
    } catch (err) {
        console.log(`   ❌ Error: ${err.message}`);
    }
}

async function checkStats() {
    console.log('\n📊 Final Stats:\n');
    const res = await fetch(`${SERVER}/api/stats`);
    const stats = await res.json();

    console.log(`   Total Requests:    ${stats.totalRequests}`);
    console.log(`   Valid:             ${stats.validCount}`);
    console.log(`   🚨 Shadow APIs:    ${stats.shadowCount}`);
    console.log(`   ⚠️  Method Mismatch: ${stats.methodMismatchCount}`);
    console.log(`   🔮 Data Leaks:     ${stats.dataLeakCount}`);
    console.log(`   🎯 Threat Score:   ${stats.threatScore}%`);
}

async function run() {
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║     🕵️  ShadowCatch — Test Runner            ║');
    console.log('╚══════════════════════════════════════════════╝');

    // Step 1: Upload the spec
    await uploadSpec();
    await sleep(500);

    // Step 2: Send VALID requests (should be green on dashboard)
    await sendRequest('Valid: List all users', 'GET', '/api/users', '✅');
    await sleep(300);

    await sendRequest('Valid: Get user by ID', 'GET', '/api/users/1', '✅');
    await sleep(300);

    await sendRequest('Valid: Health check', 'GET', '/api/health', '✅');
    await sleep(300);

    // Step 3: Send SHADOW requests (should trigger RED alerts!)
    await sendRequest('SHADOW: Admin backdoor!', 'GET', '/api/admin/secret_backdoor', '🚨');
    await sleep(300);

    await sendRequest('SHADOW: Nuke endpoint!', 'DELETE', '/api/admin/nuke', '🚨');
    await sleep(300);

    await sendRequest('SHADOW: Debug endpoint!', 'POST', '/api/internal/debug', '🚨');
    await sleep(300);

    await sendRequest('SHADOW: Legacy export!', 'GET', '/api/v1/legacy/export', '🚨');
    await sleep(300);

    await sendRequest('SHADOW: Config exposure!', 'GET', '/api/config', '🚨');
    await sleep(300);

    // Step 4: Send METHOD MISMATCH requests (should trigger amber alerts)
    await sendRequest('METHOD MISMATCH: DELETE on /api/users/1', 'DELETE', '/api/users/1', '⚠️');
    await sleep(300);

    await sendRequest('METHOD MISMATCH: PUT on /api/users/1', 'PUT', '/api/users/1', '⚠️');
    await sleep(300);

    // Step 5: Send DATA LEAK request (should trigger purple alert)
    await sendRequest('DATA LEAK: Password in query!', 'GET', '/api/users?password=secret123', '🔮');
    await sleep(300);

    await sendRequest('DATA LEAK: Token in query!', 'GET', '/api/users?access_token=abc123', '🔮');
    await sleep(500);

    // Step 6: Show final stats
    await checkStats();

    console.log('\n══════════════════════════════════════════════');
    console.log('🎉 Test complete! Check the dashboard at http://localhost:5173');
    console.log('══════════════════════════════════════════════\n');
}

run().catch(console.error);
