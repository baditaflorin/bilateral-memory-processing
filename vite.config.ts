import react from "@vitejs/plugin-react";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

const packageJson = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8")) as {
  version: string;
};

function commitSha() {
  if (process.env.VITE_COMMIT_SHA) {
    return process.env.VITE_COMMIT_SHA;
  }

  try {
    return execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "dev";
  }
}

export default defineConfig(({ mode }) => ({
  base: mode === "development" ? "/" : "/bilateral-memory-processing/",
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: "node_modules/piper-tts-web/dist/onnx", dest: "." },
        { src: "node_modules/piper-tts-web/dist/piper", dest: "." },
        { src: "node_modules/piper-tts-web/dist/worker", dest: "." }
      ],
      silent: true
    })
  ],
  build: {
    outDir: "docs",
    emptyOutDir: false,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          query: ["@tanstack/react-query", "idb", "zod"],
          icons: ["lucide-react"]
        }
      }
    }
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.VITE_APP_VERSION ?? packageJson.version),
    __COMMIT_SHA__: JSON.stringify(commitSha())
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./tests/setup.ts"
  },
  worker: {
    format: "es"
  }
}));
