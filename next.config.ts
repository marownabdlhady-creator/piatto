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

  /**
   * The Spaces panels used to open placeholder pages for each room; they now
   * open the gallery. Old links land there too, keeping their language. The
   * unprefixed form goes to /gallery and lets the locale proxy pick one.
   */
  async redirects() {
    return [
      {
        source: "/:locale(en|ar)/:room(restaurant|private-room|garden)",
        destination: "/:locale/gallery",
        permanent: true,
      },
      {
        source: "/:room(restaurant|private-room|garden)",
        destination: "/gallery",
        permanent: true,
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
