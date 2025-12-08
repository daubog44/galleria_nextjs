export function getSiteUrl(): string {
    let url = process.env.NEXT_PUBLIC_SITE_URL;

    // Check if URL is defined and valid
    if (!url || url === 'https://' || url === 'http://') {
        return 'http://localhost:3000';
    }

    // Ensure it doesn't end with a slash for consistency (optional but good)
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }

    try {
        new URL(url); // Validate
        return url;
    } catch {
        return 'http://localhost:3000';
    }
}
