import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import routeData from "./catalog-routes.json" with { type: "json" };

const root = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "..",
);
const docs = path.join(root, "docs-site", "src", "content", "docs");
const englishDocs = path.join(docs, "en");
const docsRootRelative = "docs-site/src/content/docs";
const emptyTreeSha = "4b825dc642cb6eb9a060e54bf8d69288fbee4904";
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
const isMarkdownFile = (filePath) =>
  filePath.endsWith(".md") || filePath.endsWith(".mdx");
const readGitPaths = (arguments_) => {
  try {
    return execFileSync("git", ["-C", root, ...arguments_], {
      encoding: "utf8",
    })
      .split("\0")
      .filter(Boolean);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(`Unable to inspect changed documentation files: ${message}`);
    return [];
  }
};
const isAllZeroSha = (value) => /^0+$/.test(value);
const changedPaths = () => {
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
};
const isDocumentationPath = (filePath) =>
  filePath.startsWith(`${docsRootRelative}/`);
const matchingLocalePath = (filePath) => {
  const relativePath = filePath.slice(`${docsRootRelative}/`.length);
  return relativePath.startsWith("en/")
    ? `${docsRootRelative}/${relativePath.slice(3)}`
    : `${docsRootRelative}/en/${relativePath}`;
};
const withoutFrontmatter = (source) => {
  const frontmatter = /^(?:\uFEFF)?---\r?\n[\s\S]*?\r?\n(?:---|\.\.\.)\r?\n?/;
  const match = source.match(frontmatter);
  return match
    ? source.replace(match[0], match[0].replace(/[^\r\n]/g, " "))
    : source;
};
const isAllowedDestination = (destination) => {
  const value = destination.trim();
  return (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.startsWith("#") ||
    /^[a-z][a-z\d+.-]*:/i.test(value)
  );
};
const findRootAbsoluteLinks = (source) => {
  const findings = [];
  let inFence = false;
  for (const [index, line] of withoutFrontmatter(source)
    .split(/\r?\n/)
    .entries()) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const destinations = [];
    const markdownLinks = /\[[^\]\n]*\]\(\s*(?:<([^>\n]*)>|([^\s)\n]+))/g;
    for (const match of line.matchAll(markdownLinks))
      destinations.push(match[1] ?? match[2]);
    const referenceLink = /^\s*\[[^\]\n]+\]:\s*(?:<([^>\n]*)>|([^\s]+))/;
    const referenceMatch = line.match(referenceLink);
    if (referenceMatch)
      destinations.push(referenceMatch[1] ?? referenceMatch[2]);
    const htmlLinks = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
    for (const match of line.matchAll(htmlLinks))
      destinations.push(match[1] ?? match[2]);
    const expressionLinks = /\bhref\s*=\s*\{\s*["']([^"']+)["']\s*\}/gi;
    for (const match of line.matchAll(expressionLinks))
      destinations.push(match[1]);
    for (const destination of destinations)
      if (destination.startsWith("/") && !isAllowedDestination(destination))
        findings.push({ line: index + 1, destination });
  }
  return findings;
};
const actual = new Set(files(docs));
const english = new Set(files(englishDocs));
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
  { name: "root", directory: docs, files: actual },
  { name: "en", directory: englishDocs, files: english },
]) {
  for (const relativePath of [...locale.files].filter(isMarkdownFile)) {
    const absolutePath = path.join(locale.directory, relativePath);
    for (const finding of findRootAbsoluteLinks(
      fs.readFileSync(absolutePath, "utf8"),
    ))
      errors.push(
        `${locale.name}/${relativePath}:${finding.line} uses a root-absolute internal link ${finding.destination}; use a relative link instead`,
      );
  }
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else console.log("Bilingual documentation contract passed.");
