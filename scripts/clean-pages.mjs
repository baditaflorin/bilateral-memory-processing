import { rm } from "node:fs/promises";

const generatedPaths = [
  "docs/404.html",
  "docs/assets",
  "docs/icon.svg",
  "docs/index.html",
  "docs/manifest.webmanifest",
  "docs/onnx",
  "docs/piper",
  "docs/sw.js",
  "docs/worker"
];

await Promise.all(
  generatedPaths.map((path) => rm(path, { recursive: true, force: true }))
);
