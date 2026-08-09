import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import routeData from "./catalog-routes.json" with { type: "json" };

const root = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "..",
);
const dist = path.join(root, "docs-site", "dist");
const repository = process.env.GITHUB_REPOSITORY?.split("/");
const rawBase =
  process.env.ASTRO_BASE?.trim() ||
  (process.env.GITHUB_ACTIONS === "true" && repository?.[1]
    ? `/${repository[1]}/`
    : "/");
const base = rawBase === "/" ? "/" : `/${rawBase.replace(/^\/+|\/+$/g, "")}/`;
const routes = [...routeData.jaRoutes, ...routeData.enRoutes];
const errors = [];
const joinBase = (route) =>
  base === "/" ? route : `${base.slice(0, -1)}${route}`;
const routeFile = (route) =>
  route === "/"
    ? "index.html"
    : `${route.replace(/^\//, "").replace(/\/$/, "")}/index.html`;
const expectedFiles = new Set(routes.map(routeFile));
function htmlFiles(directory, prefix = "") {
  if (!fs.existsSync(directory)) return [];
  const result = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    const relative = path.join(prefix, entry.name).replaceAll(path.sep, "/");
    if (entry.isDirectory()) result.push(...htmlFiles(absolute, relative));
    else if (
      entry.isFile() &&
      relative.endsWith(".html") &&
      relative !== "404.html"
    )
      result.push(relative);
  }
  return result;
}
if (!fs.existsSync(dist)) errors.push("Missing documentation output");
const actualFiles = new Set(htmlFiles(dist));
for (const route of routes) {
  const relative = routeFile(route);
  const absolute = path.join(dist, relative);
  if (!actualFiles.has(relative))
    errors.push(`Missing generated route: ${relative}`);
  else if (!fs.readFileSync(absolute, "utf8").includes(joinBase(route)))
    errors.push(
      `Generated route does not contain its configured base path: ${joinBase(route)}`,
    );
}
for (const relative of actualFiles)
  if (!expectedFiles.has(relative))
    errors.push(`Unexpected generated route: ${relative}`);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else console.log(`Documentation route check passed for ${base}.`);
