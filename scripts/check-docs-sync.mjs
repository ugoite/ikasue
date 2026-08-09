import fs from "node:fs";
import path from "node:path";
import routeData from "./catalog-routes.json" with { type: "json" };

const root = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "..",
);
const docs = path.join(root, "docs-site", "src", "content", "docs");
const expected = [
  "index.mdx",
  "philosophy.mdx",
  "components/index.mdx",
  "examples/index.mdx",
  ...[
    "behavioral-contracts",
    "usage",
    "integration",
    "accessibility",
    "release",
  ].map((id) => `guides/${id}.md`),
  ...routeData.componentIds.map((id) => `components/${id}.mdx`),
];
function files(directory, prefix = "") {
  const result = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    const relative = path.join(prefix, entry.name).replaceAll(path.sep, "/");
    if (entry.isDirectory() && entry.name !== "en")
      result.push(...files(absolute, relative));
    else if (entry.isFile()) result.push(relative);
  }
  return result;
}
const actual = new Set(files(docs));
const english = new Set(files(path.join(docs, "en")));
const errors = [];
for (const value of expected) {
  if (!actual.has(value)) errors.push(`Missing source page: ${value}`);
  if (!english.has(value)) errors.push(`Missing English page: ${value}`);
}
for (const value of actual)
  if (
    (value.endsWith(".md") || value.endsWith(".mdx")) &&
    !expected.includes(value)
  )
    errors.push(`Unexpected source page: ${value}`);
for (const value of english)
  if (
    (value.endsWith(".md") || value.endsWith(".mdx")) &&
    !expected.includes(value)
  )
    errors.push(`Unexpected English page: ${value}`);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else console.log("Bilingual documentation contract passed.");
