import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Monorepo: repo root also has a lockfile; pin tracing to avoid wrong root inference.
  outputFileTracingRoot: path.join(__dirname, "../..")
};

export default nextConfig;
