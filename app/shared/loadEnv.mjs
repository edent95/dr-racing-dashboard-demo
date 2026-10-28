/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Node 24 loads .env files natively. Like dotenv's default config(), an
// already-set process.env value wins over the file, so the container's mounted
// credential path keeps beating .env.local. Missing files are normal: App
// Hosting ships neither .env.local nor .env and reads real env vars instead.
export function loadEnvFiles(...paths) {
  for (const path of paths) {
    try {
      process.loadEnvFile(path);
    } catch {
      // Optional file; a real parse error surfaces on the next missing var.
    }
  }
}
