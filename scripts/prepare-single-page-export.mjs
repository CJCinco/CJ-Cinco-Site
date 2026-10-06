import { lstat, readdir, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";

// Prune generated output only. Historical page/media source stays preserved.
const output = new URL("../out/", import.meta.url);
const root = await lstat(output);
if (!root.isDirectory() || root.isSymbolicLink()) {
  throw new Error("Expected the generated out directory, without a symlink.");
}

for (const path of ["index.html", "privacy.html", "cj-brand-pic.png", "_redirects", "downloads/cj-cinco-health-snapshot.pdf"]) {
  if (!(await lstat(new URL(path, output))).isFile()) {
    throw new Error(`Required release file missing: ${path}`);
  }
}

const allowed = new Set([
  "_next", "index.html", "index.txt", "favicon.ico", "cj-brand-pic.png",
  "404.html", "_not-found.html", "_not-found.txt", "_not-found",
  "privacy.html", "privacy.txt", "privacy", "downloads", "_redirects",
]);
for (const entry of await readdir(output, { withFileTypes: true })) {
  if (entry.isSymbolicLink()) throw new Error(`Unexpected export symlink: ${entry.name}`);
  if (!allowed.has(entry.name) && !/^__next\.[\w.]+\.txt$/.test(entry.name)) {
    await rm(new URL(entry.name, output), { recursive: true });
  }
}
for (const entry of await readdir(new URL("downloads/", output))) {
  if (entry !== "cj-cinco-health-snapshot.pdf") {
    await rm(new URL(`downloads/${entry}`, output), { recursive: true });
  }
}
console.log(`Prepared one-page release in ${fileURLToPath(output)}; PDF and integration policy preserved.`);
