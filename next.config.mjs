/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    async rewrites() {
        return [
            {
                source: "/s3pdf/:slug*",
                destination: "https://rev-pdftemplates.s3.amazonaws.com/:slug*",
            }
        ];
    },
};

export default nextConfig;
