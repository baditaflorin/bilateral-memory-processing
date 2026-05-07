import { copyFile, mkdir, writeFile } from "node:fs/promises";

await mkdir("docs", { recursive: true });
await copyFile("docs/index.html", "docs/404.html");
await writeFile("docs/.nojekyll", "\n");
