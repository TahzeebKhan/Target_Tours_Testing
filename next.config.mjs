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
    ],
  },
};

export default nextConfig;
