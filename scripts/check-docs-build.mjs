import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const repositoryRoot = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "..",
);
const componentRoot = path.join(
  repositoryRoot,
  "docs-site",
  "src",
  "content",
  "docs",
  "components",
);
const distRoot = path.join(repositoryRoot, "docs-site", "dist");
const componentIds = fs
  .readdirSync(componentRoot)
  .filter((file) => file.endsWith(".mdx") && file !== "index.mdx")
  .map((file) => file.slice(0, -4))
  .sort();
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const base = repositoryName ? `/${repositoryName}/` : "/";

function count(source, value) {
  return source.split(value).length - 1;
}

const errors = [];
for (const locale of ["ja", "en"]) {
  const localePrefix = locale === "en" ? "en/" : "";
  for (const id of componentIds) {
    const relativePath = path.join(
      locale === "en" ? "en" : "",
      "components",
      id,
      "index.html",
    );
    const outputPath = path.join(distRoot, relativePath);
    if (!fs.existsSync(outputPath)) {
      errors.push(`Missing generated component page: ${relativePath}`);
      continue;
    }
    const source = fs.readFileSync(outputPath, "utf8");
    const expectedComponentHref = `href="${base}${localePrefix}components/${id}/"`;
    for (const [marker, expected] of [
      ["data-has-sidebar", 1],
      ['class="page ', 1],
      ["data-component-demo", 1],
      [`data-component=\"${id}\"`, 1],
      [expectedComponentHref, 1],
    ]) {
      if (count(source, marker) !== expected)
        errors.push(`${relativePath} must contain ${marker} exactly once`);
    }
    for (const marker of [
      "app-shell",
      "nav-plane",
      "topline",
      "content-scroll",
      'target="_blank"',
      "?component=",
      "catalogPath",
    ]) {
      if (source.includes(marker))
        errors.push(`${relativePath} contains forbidden ${marker}`);
    }
  }
}

for (const relativePath of [
  path.join("catalog", "index.html"),
  path.join("en", "catalog", "index.html"),
]) {
  if (fs.existsSync(path.join(distRoot, relativePath)))
    errors.push(
      `Standalone catalog build output must not exist: ${relativePath}`,
    );
}

if (errors.length) {
  console.error("Docs build regression check failed:");
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Docs build regression check passed: ${componentIds.length * 2} bilingual component pages have one Starlight frame and one embedded demo.`,
  );
}
