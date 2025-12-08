import type { NextConfig } from "next";

const nextConfig: NextConfig = {

    experimental: {
        proxyClientMaxBodySize: '50mb',
        serverActions: {
            bodySizeLimit: '50mb',
        },
        webpackMemoryOptimizations: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    reactCompiler: true,

    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                ],
            },
            {
                source: '/sw.js',
                headers: [
                    {
                        key: 'Content-Type',
                        value: 'application/javascript; charset=utf-8',
                    },
                    {
                        key: 'Cache-Control',
                        value: 'no-cache, no-store, must-revalidate',
                    },
                    {
                        key: 'Content-Security-Policy',
                        value: "default-src 'self'; script-src 'self'",
                    },
                ],
            },
        ]
    },

    async rewrites() {
        return [
            {
                source: '/paintings/:path*',
                destination: '/sitedata/paintings/:path*',
            },
        ];
    },
};

export default nextConfig;