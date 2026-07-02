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
    ],
  },
};

export default nextConfig;