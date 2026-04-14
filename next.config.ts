import type { NextConfig } from "next";
import { withSerwist } from "@serwist/turbopack";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "acbalst6mhxinp7r.public.blob.vercel-storage.com",
        pathname: "/**",
      },
    ],
  },
};

export default withSerwist(nextConfig);
