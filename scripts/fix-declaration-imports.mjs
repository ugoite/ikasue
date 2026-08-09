import fs from "node:fs";
import path from "node:path";

const root = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "..",
);
const typesRoot = path.join(root, "dist", "types");

function declarationFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...declarationFiles(absolute));
    else if (entry.isFile() && entry.name.endsWith(".d.ts"))
      files.push(absolute);
  }
  return files;
}

const withJsExtension = (specifier) =>
  /\.[a-z]+$/i.test(specifier) ? specifier : `${specifier}.js`;

for (const file of declarationFiles(typesRoot)) {
  const source = fs.readFileSync(file, "utf8");
  const fixed = source
    .replace(
      /(from\s+["'])(\.[^"']+)(["'])/g,
      (_, prefix, specifier, suffix) =>
        `${prefix}${withJsExtension(specifier)}${suffix}`,
    )
    .replace(
      /(import\(\s*["'])(\.[^"']+)(["']\s*\))/g,
      (_, prefix, specifier, suffix) =>
        `${prefix}${withJsExtension(specifier)}${suffix}`,
    );
  if (fixed !== source) fs.writeFileSync(file, fixed);
}
