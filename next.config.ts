import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  /*
   * Emit a self-contained server bundle, so the Docker image carries only the
   * dependencies actually used instead of the whole node_modules tree.
   *
   * Not on Vercel. Vercel runs its own output tracing after next build and
   * expects .next/next-server.js.nft.json, which standalone mode does not
   * produce; the build then fails with ENOENT on that file. Vercel sets VERCEL
   * in the build environment, so this switches itself off there.
   */
  output: process.env.VERCEL ? undefined : 'standalone',
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
