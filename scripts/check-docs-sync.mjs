import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const repositoryRoot = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "..",
);
const docsRoot = path.join(
  repositoryRoot,
  "docs-site",
  "src",
  "content",
  "docs",
);
const englishRoot = path.join(docsRoot, "en");
const docsRootRelative = "docs-site/src/content/docs";
const emptyTreeSha = "4b825dc642cb6eb9a060e54bf8d69288fbee4904";
const errors = [];

function collectFiles(root, skipTopLevel = undefined) {
  const files = [];

  function visit(directory, relativeDirectory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (!relativeDirectory && entry.name === skipTopLevel) continue;

      const relativePath = path.join(relativeDirectory, entry.name);
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(absolutePath, relativePath);
      else if (entry.isFile())
        files.push(relativePath.split(path.sep).join("/"));
    }
  }

  visit(root, "");
  return files.sort();
}

function isMarkdownFile(filePath) {
  return filePath.endsWith(".md") || filePath.endsWith(".mdx");
}

function readGitPaths(arguments_) {
  try {
    return execFileSync("git", ["-C", repositoryRoot, ...arguments_], {
      encoding: "utf8",
    })
      .split("\0")
      .filter(Boolean);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(`Unable to inspect changed documentation files: ${message}`);
    return [];
  }
}

function isAllZeroSha(value) {
  return /^0+$/.test(value);
}

function changedPaths() {
  const base = process.env.DOCS_SYNC_BASE?.trim();
  const head = process.env.DOCS_SYNC_HEAD?.trim();

  if (base && head) {
    if (isAllZeroSha(head)) return new Set();

    return new Set(
      readGitPaths([
        "diff",
        "--name-only",
        "--no-renames",
        "-z",
        isAllZeroSha(base) ? emptyTreeSha : base,
        head,
      ]),
    );
  }

  return new Set([
    ...readGitPaths(["diff", "--name-only", "--no-renames", "-z", "--cached"]),
    ...readGitPaths(["diff", "--name-only", "--no-renames", "-z"]),
    ...readGitPaths(["ls-files", "--others", "--exclude-standard", "-z"]),
  ]);
}

function isDocumentationPath(filePath) {
  return filePath.startsWith(`${docsRootRelative}/`);
}

function matchingLocalePath(filePath) {
  const relativePath = filePath.slice(`${docsRootRelative}/`.length);
  if (relativePath.startsWith("en/"))
    return `${docsRootRelative}/${relativePath.slice("en/".length)}`;
  return `${docsRootRelative}/en/${relativePath}`;
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
    if (referenceMatch)
      destinations.push(referenceMatch[1] ?? referenceMatch[2]);

    const htmlLinks = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
    for (const match of line.matchAll(htmlLinks)) {
      destinations.push(match[1] ?? match[2]);
    }

    const expressionLinks = /\bhref\s*=\s*\{\s*["']([^"']+)["']\s*\}/gi;
    for (const match of line.matchAll(expressionLinks))
      destinations.push(match[1]);

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
const missing = rootFiles.filter(
  (filePath) => !englishFiles.includes(filePath),
);
const extra = englishFiles.filter((filePath) => !rootFiles.includes(filePath));

if (missing.length)
  errors.push(
    `Missing English files:\n${missing.map((filePath) => `  - ${filePath}`).join("\n")}`,
  );
if (extra.length)
  errors.push(
    `Extra English files:\n${extra.map((filePath) => `  - ${filePath}`).join("\n")}`,
  );

const docsSourceFiles = [
  ...collectFiles(docsRoot).map((filePath) => path.join(docsRoot, filePath)),
  path.join(repositoryRoot, "README.md"),
  path.join(repositoryRoot, "SPEC.md"),
];
const forbiddenDocsPatterns = [
  { label: "catalogPath", pattern: /catalogPath/ },
  { label: "catalog route", pattern: /(?:\.\.?\/|link:\s*["'])catalog\// },
  {
    label: "component query route",
    pattern: /\?component=/,
  },
  {
    label: "interactive catalog CTA",
    pattern: /Open interactive catalog|インタラクティブカタログを開く/,
  },
  { label: "new tab CTA", pattern: /target\s*=\s*["']_blank/ },
];

for (const absolutePath of docsSourceFiles) {
  if (!fs.existsSync(absolutePath)) continue;
  const source = fs.readFileSync(absolutePath, "utf8");
  for (const { label, pattern } of forbiddenDocsPatterns) {
    if (pattern.test(source))
      errors.push(
        `${path.relative(repositoryRoot, absolutePath)} contains ${label}`,
      );
  }
}

for (const routePath of [
  path.join(docsRoot, "catalog"),
  path.join(englishRoot, "catalog"),
]) {
  if (fs.existsSync(routePath))
    errors.push(
      `Standalone catalog content route must not exist: ${path.relative(repositoryRoot, routePath)}`,
    );
}

const changedDocumentationPaths = [...changedPaths()]
  .filter(isDocumentationPath)
  .sort();
const missingChangedPairs = changedDocumentationPaths.filter(
  (filePath, _, paths) => !paths.includes(matchingLocalePath(filePath)),
);

if (missingChangedPairs.length)
  errors.push(
    `Changed documentation files must include their manually authored bilingual pair:\n${missingChangedPairs
      .map(
        (filePath) =>
          `  - ${filePath} requires ${matchingLocalePath(filePath)}`,
      )
      .join("\n")}`,
  );

for (const locale of [
  { name: "root", directory: docsRoot, files: rootFiles },
  { name: "en", directory: englishRoot, files: englishFiles },
]) {
  for (const relativePath of locale.files.filter(isMarkdownFile)) {
    const absolutePath = path.join(locale.directory, relativePath);
    for (const finding of findRootAbsoluteLinks(
      fs.readFileSync(absolutePath, "utf8"),
    )) {
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
  console.log(
    `Docs sync check passed: ${rootFiles.length} mirrored files; no root-absolute internal links.`,
  );
}
