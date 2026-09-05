/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Keep the Postgres driver external so it's required at runtime,
    // avoiding the "no such file or directory" error on Vercel serverless.
    serverComponentsExternalPackages: ["pg"],
  },
};

export default nextConfig;
