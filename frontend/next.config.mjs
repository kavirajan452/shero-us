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
  webpack(config, { dev }) {
    config.resolve.alias['react-router-dom'] = path.resolve(__dirname, './src/lib/router-compat.tsx');

    // In development, switch from eval-source-map to cheap-module-source-map so
    // webpack emits real JS instead of wrapping every module in eval().  eval()
    // strings with supplementary Unicode characters (emoji, Indic scripts) can
    // produce a "SyntaxError: Invalid or unexpected token" in the browser on
    // Windows where the terminal/process code-page may mangle multi-byte UTF-8.
    if (dev) {
      config.devtool = 'cheap-module-source-map';
    }

    // Make static image imports return plain URL strings instead of Next.js
    // StaticImageData objects. This preserves the Vite-style import behavior
    // (`import foo from './foo.jpg'` → string URL) so all existing
    // `<img src={importedImage}>` patterns work without changes.
    const replaceImageLoader = (rules) => {
      rules.forEach((rule, i) => {
        if (rule.oneOf) {
          replaceImageLoader(rule.oneOf);
        } else {
          // Collect all loader strings for this rule (handles both `use` array and direct `loader`)
          const loaderEntries = [];
          if (rule.loader) loaderEntries.push(rule.loader);
          if (rule.use) {
            const uses = Array.isArray(rule.use) ? rule.use : [rule.use];
            uses.forEach((u) => {
              if (typeof u === 'string') loaderEntries.push(u);
              else if (u?.loader) loaderEntries.push(u.loader);
            });
          }
          const hasImageLoader = loaderEntries.some((l) =>
            String(l).includes('image-loader'),
          );
          if (hasImageLoader) {
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
