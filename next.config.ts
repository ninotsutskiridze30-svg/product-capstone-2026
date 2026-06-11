import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/shared/i18n/request.ts");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: `${process.env.NEXT_PUBLIC_POSTHOG_HOST}/static/:path*`,
      },
      {
        source: "/ingest/array/:path*",
        destination: `${process.env.NEXT_PUBLIC_POSTHOG_HOST}/array/:path*`,
      },
      {
        source: "/ingest/:path*",
        destination: `${process.env.NEXT_PUBLIC_POSTHOG_HOST}/:path*`,
      },
    ];
  },
  skipTrailingSlashRedirect: true,
};

export default withNextIntl(nextConfig);
