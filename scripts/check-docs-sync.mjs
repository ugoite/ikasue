import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const repositoryRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const docsRoot = path.join(repositoryRoot, "docs-site", "src", "content", "docs");
const englishRoot = path.join(docsRoot, "en");

function collectFiles(root, skipTopLevel = undefined) {
  const files = [];

  function visit(directory, relativeDirectory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (!relativeDirectory && entry.name === skipTopLevel) continue;

      const relativePath = path.join(relativeDirectory, entry.name);
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(absolutePath, relativePath);
      else if (entry.isFile()) files.push(relativePath.split(path.sep).join("/"));
    }
  }

  visit(root, "");
  return files.sort();
}

function isMarkdownFile(filePath) {
  return filePath.endsWith(".md") || filePath.endsWith(".mdx");
}

function withoutFrontmatter(source) {
  const frontmatter = /^(?:\uFEFF)?---\r?\n[\s\S]*?\r?\n(?:---|\.\.\.)\r?\n?/;
  const match = source.match(frontmatter);
  if (!match) return source;
  return source.replace(match[0], match[0].replace(/[^\r\n]/g, " "));
}

function isAllowedDestination(destination) {
  const value = destination.trim();
  return (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.startsWith("#") ||
    /^[a-z][a-z\d+.-]*:/i.test(value)
  );
}

function findRootAbsoluteLinks(source) {
  const findings = [];
  const content = withoutFrontmatter(source);
  let inFence = false;

  for (const [index, line] of content.split(/\r?\n/).entries()) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const destinations = [];
    const markdownLinks = /\[[^\]\n]*\]\(\s*(?:<([^>\n]*)>|([^\s)\n]+))/g;
    for (const match of line.matchAll(markdownLinks)) {
      destinations.push(match[1] ?? match[2]);
    }

    const referenceLink = /^\s*\[[^\]\n]+\]:\s*(?:<([^>\n]*)>|([^\s]+))/;
    const referenceMatch = line.match(referenceLink);
    if (referenceMatch) destinations.push(referenceMatch[1] ?? referenceMatch[2]);

    const htmlLinks = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
    for (const match of line.matchAll(htmlLinks)) {
      destinations.push(match[1] ?? match[2]);
    }

    const expressionLinks = /\bhref\s*=\s*\{\s*["']([^"']+)["']\s*\}/gi;
    for (const match of line.matchAll(expressionLinks)) destinations.push(match[1]);

    for (const destination of destinations) {
      if (destination.startsWith("/") && !isAllowedDestination(destination)) {
        findings.push({ line: index + 1, destination });
      }
    }
  }

  return findings;
}

const rootFiles = collectFiles(docsRoot, "en");
const englishFiles = collectFiles(englishRoot);
const missing = rootFiles.filter((filePath) => !englishFiles.includes(filePath));
const extra = englishFiles.filter((filePath) => !rootFiles.includes(filePath));
const errors = [];

if (missing.length) errors.push(`Missing English files:\n${missing.map((filePath) => `  - ${filePath}`).join("\n")}`);
if (extra.length) errors.push(`Extra English files:\n${extra.map((filePath) => `  - ${filePath}`).join("\n")}`);

for (const locale of [
  { name: "root", directory: docsRoot, files: rootFiles },
  { name: "en", directory: englishRoot, files: englishFiles },
]) {
  for (const relativePath of locale.files.filter(isMarkdownFile)) {
    const absolutePath = path.join(locale.directory, relativePath);
    for (const finding of findRootAbsoluteLinks(fs.readFileSync(absolutePath, "utf8"))) {
      errors.push(
        `${locale.name}/${relativePath}:${finding.line} uses a root-absolute internal link ${finding.destination}; use a relative link instead`,
      );
    }
  }
}

if (errors.length) {
  console.error("Docs sync check failed:");
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Docs sync check passed: ${rootFiles.length} mirrored files; no root-absolute internal links.`);
}
