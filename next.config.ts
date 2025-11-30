import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
        // reactCompiler: true, // Moved to top level if supported, or check docs.
        // Actually, for Next.js 15/16 canary, it varies. 
        // If the error says it moved to `reactCompiler`, it implies top level.
        // But let's try to just remove it from experimental and see if I can add it to top level.
    },
    reactCompiler: true,
    output: 'standalone',
    typescript: {
        ignoreBuildErrors: true,
    },

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