import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            // We don't explicitly disallow /admin to avoid broadcasting its existence.
            // Instead, we use the 'noindex' meta tag on the admin pages themselves.
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
