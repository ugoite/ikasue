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
for (const route of routes) {
  const relative =
    route === "/"
      ? "index.html"
      : `${route.replace(/^\//, "").replace(/\/$/, "")}/index.html`;
  if (!fs.existsSync(path.join(dist, relative)))
    errors.push(`Missing generated route: ${relative}`);
}
if (!fs.existsSync(dist)) errors.push("Missing documentation output");
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else console.log(`Documentation route check passed for ${base}.`);
