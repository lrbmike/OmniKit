import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  output: process.env.IS_DOCKER ? 'standalone' : undefined,
  experimental: {
    serverActions: {
      bodySizeLimit: '64mb',
    },
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
