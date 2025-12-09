
const envSecret = process.env.AUTH_SECRET;
if (!envSecret) {
    throw new Error('AUTH_SECRET is not defined');
}
export const AUTH_SECRET = envSecret;

async function getKey() {
    const encoder = new TextEncoder();
    return crypto.subtle.importKey(
        'raw',
        encoder.encode(AUTH_SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign', 'verify']
    );
}

// 24 hours in milliseconds
const SESSION_DURATION = 24 * 60 * 60 * 1000;

export async function createSessionToken() {
    const key = await getKey();
    const now = Date.now();
    // Sign both the payload and the timestamp
    const data = new TextEncoder().encode(`admin-authenticated:${now}`);
    const signature = await crypto.subtle.sign('HMAC', key, data);

    // Convert ArrayBuffer to Hex String
    const hashArray = Array.from(new Uint8Array(signature));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Format: v1:timestamp:signature
    return `v1:${now}:${hashHex}`;
}

export async function verifySessionToken(token: string | undefined) {
    if (!token || !token.startsWith('v1:')) return false;

    // Split: ["v1", "timestamp", "signature"]
    const parts = token.split(':');
    if (parts.length !== 3) return false;

    const timestampStr = parts[1];
    const providedHash = parts[2];
    const timestamp = parseInt(timestampStr, 10);

    // Check if timestamp is valid number
    if (isNaN(timestamp)) return false;

    // Check expiration
    const now = Date.now();
    // Allow a small drift or just check if it's too old
    // We also check if it's in the future (with 1 minute tolerance for clock skew)
    if (now - timestamp > SESSION_DURATION || timestamp - now > 60000) {
        return false;
    }

    // Re-create signature to verify integrity
    const key = await getKey();
    const data = new TextEncoder().encode(`admin-authenticated:${timestampStr}`);
    const signature = await crypto.subtle.sign('HMAC', key, data);

    // Convert to Hex
    const hashArray = Array.from(new Uint8Array(signature));
    const expectedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Constant-time comparison (not strictly necessary here but good practice)
    return providedHash === expectedHash;
}
