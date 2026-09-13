import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /**
     * Photographs added from the dashboard are uploaded to Vercel Blob, which
     * serves them from the store's own subdomain. The bundled gallery images
     * are local paths and need nothing here; this is what lets the optimizer
     * fetch the uploaded ones. Scoped to https and to that one host, so no
     * other remote URL can be run through it.
     */
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
        port: "",
        pathname: "/**",
        search: "",
      },
    ],
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
