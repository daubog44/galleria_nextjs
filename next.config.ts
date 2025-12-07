import type { NextConfig } from "next";

const nextConfig: NextConfig = {

    experimental: {
        proxyClientMaxBodySize: '50mb',
        serverActions: {
            bodySizeLimit: '50mb',
        },
    },
    reactCompiler: true,
    output: 'standalone',


    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
};

export default nextConfig;