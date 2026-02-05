const isProd = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    basePath: isProd ? '/JA-Alumni' : '',
    images: {
        unoptimized: true,
    },
    typescript: {
        // ignoreBuildErrors: false,
    },
    eslint: {
        // ignoreDuringBuilds: false,
    },
};

module.exports = nextConfig;
