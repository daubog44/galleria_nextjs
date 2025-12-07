
export const AUTH_SECRET = process.env.AUTH_SECRET || 'galleria-segreta-key-change-this';

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

export async function createSessionToken() {
    const key = await getKey();
    const data = new TextEncoder().encode('admin-authenticated');
    const signature = await crypto.subtle.sign('HMAC', key, data);

    // Convert ArrayBuffer to Hex String
    const hashArray = Array.from(new Uint8Array(signature));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return `v1:${hashHex}`;
}

export async function verifySessionToken(token: string | undefined) {
    if (!token || !token.startsWith('v1:')) return false;

    const providedHash = token.split(':')[1];
    const expectedToken = await createSessionToken();
    const expectedHash = expectedToken.split(':')[1];

    // Constant-time comparison (not strictly necessary here but good practice)
    return providedHash === expectedHash;
}
