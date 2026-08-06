/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "139.84.175.121",
        port: "1337",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "sprintsell.com",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "staging.sprintsell.com",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.kiwi.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "imgak.mmtcdn.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "image-cdn.didatravel.com",
        pathname: "/Image/**", // Allows all images under the /Image directory
      },
      {
        protocol: "https",
        hostname: "i.travelapi.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.travelapi.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "i.travelapi.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.giata.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.expediapartnercatalog.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.worldota.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.worldota.net",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "cdn.worldota.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "rukmini-ct.flixcart.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
