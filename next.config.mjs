import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack(config) {
    config.resolve.alias['react-router-dom'] = path.resolve(__dirname, './src/lib/router-compat.tsx');

    // Make static image imports return plain URL strings instead of Next.js
    // StaticImageData objects. This preserves the Vite-style import behavior
    // (`import foo from './foo.jpg'` → string URL) so all existing
    // `<img src={importedImage}>` patterns work without changes.
    const replaceImageLoader = (rules) => {
      rules.forEach((rule, i) => {
        if (rule.oneOf) {
          replaceImageLoader(rule.oneOf);
        } else if (rule.use) {
          const uses = Array.isArray(rule.use) ? rule.use : [rule.use];
          const hasNextImageLoader = uses.some(
            (u) =>
              (typeof u === 'string' && u.includes('next-image-loader')) ||
              (u?.loader && String(u.loader).includes('next-image-loader')),
          );
          if (hasNextImageLoader) {
            rules[i] = {
              test: rule.test,
              issuer: rule.issuer,
              resourceQuery: rule.resourceQuery,
              type: 'asset/resource',
              generator: { filename: 'static/media/[name].[hash:8][ext]' },
            };
          }
        }
      });
    };
    replaceImageLoader(config.module.rules);

    return config;
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default nextConfig;
