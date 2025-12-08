import { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/utils';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = getSiteUrl();

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
