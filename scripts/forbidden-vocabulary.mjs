import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "..",
);
const manifest = "scripts/forbidden-vocabulary.mjs";
const excluded = [
  ".git/",
  "node_modules/",
  "/node_modules/",
  "dist/",
  "docs-site/dist/",
  "package-lock.json",
  "docs-site/package-lock.json",
  manifest,
];
const forbiddenIdentifiers = [
  "Plane",
  "PlaneAxis",
  "PlaneChild",
  "PlaneChildInput",
  "PlaneFit",
  "PlaneOptions",
  "PlaneSpec",
  "PlaneInput",
  "ResolvedPlane",
  "ResolvedPlaneChild",
  "ResolvedPlaneChildState",
  "FocusPlane",
  "FocusRegion",
  "AxisFlow",
  "Vertical",
  "Horizontal",
  "EdgeRegion",
  "BottomDock",
  "EdgeNav",
  "ElasticTabs",
  "Rule",
  "IconAction",
  "ActionStrip",
  "BooleanText",
  "ChoiceGroup",
  "DataTable",
  "HistoryGutter",
  "StatusIcon",
  "MessageRegion",
  "ProgressRegion",
  "BottomDialog",
  "DeveloperModel",
  "MountOptions",
  "IkasueMount",
  "FormList",
  "FormListState",
  "FormFieldSeed",
  "FormFieldState",
  "TableCellSeed",
  "TableCellState",
  "TableState",
  "CatalogCategoryId",
  "CatalogConceptId",
  "CatalogPropertyType",
  "CatalogPropertyValue",
  "CatalogLocalizedText",
  "CatalogDocumentationCopy",
  "CatalogPageCopy",
  "CatalogPrinciple",
  "CatalogSourceRecipe",
  "CatalogRegistryEntryBase",
  "CatalogComponentRegistryEntry",
  "CatalogConceptRegistryEntry",
  "CatalogRegistryEntry",
  "CatalogComponentEntry",
  "CatalogConceptEntry",
  "CatalogProperty",
  "CatalogComponentMetadata",
  "CatalogConceptMetadata",
  "CatalogPageMetadata",
  "CatalogProps",
  "CatalogSiteNavItem",
  "DemoContext",
  "NativePlaneChild",
  "NativePlaneComposition",
  "NativePlaneRenderOptions",
  "NativePlaneRenderer",
  "ExampleLocale",
  "ExampleKind",
  "ExamplePageCopy",
  "ExampleRegionSpec",
  "ExamplePlaneSpec",
  "ExampleSource",
  "ExampleSpec",
  "ExampleCopy",
  "normalizePlane",
  "resolvePlane",
  "parseComponentQuery",
  "serializeComponentQuery",
  "parseCatalogQuery",
  "serializeCatalogQuery",
  "getDefaultProps",
  "DEFAULT_COMPONENT_ID",
  "mountIkasue",
  "cloneProps",
  "createFormListState",
  "commitFormListFields",
  "formListStatus",
  "createTableState",
  "getTableCell",
  "commitTableCell",
  "resolveNativePlane",
  "renderNativePlane",
  "renderPlaneComposition",
  "renderDeveloperDemo",
  "exampleSpec",
  "exampleSurfaceCopy",
  "exampleComponentIds",
  "exampleComponentNames",
  "exampleCopy",
  "getCatalogMountLabel",
  "getCatalogSiteNavItems",
  "getRegistryEntry",
  "findCatalogRegistryEntry",
  "getComponentDocumentation",
  "getComponentCopy",
  "getComponentSource",
  "componentPhilosophy",
  "componentMeta",
  "findComponent",
  "findPage",
  "COMPONENT_COPY",
  "COMPONENT_DOCUMENTATION_COPY",
  "PRINCIPLES",
  "PRINCIPLES_EN",
];
const forbiddenIds = [
  "developer-model",
  "rule",
  "status-icon",
  "icon-action",
  "action-strip",
  "boolean-text",
  "choice-group",
  "form-list",
  "data-table",
  "history-gutter",
  "progress-region",
  "message-region",
  "bottom-dialog",
];
const forbiddenMarkers = [
  "app-shell",
  "topline",
  "content-scroll",
  "catalog-shell",
  "catalog-header",
  "catalog-sidebar",
  "catalog-main",
  "catalog-nav",
  "catalog-card",
  "plane-shell",
  "plane-viewport",
  "plane-item",
  "plane-navigation",
  "data-plane",
  "data-focus",
  "data-axis",
  "data-component",
];
const forbiddenAliases = [
  "@ikasue/catalog",
  "@ikasue/catalog-types",
  "@/catalog",
  "@/catalog-types",
];
function filesIn(directory) {
  const result = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    const relative = path.relative(root, absolute).replaceAll(path.sep, "/");
    if (
      excluded.some(
        (prefix) => relative === prefix || relative.startsWith(prefix),
      ) ||
      relative.includes("/node_modules/")
    )
      continue;
    if (entry.isDirectory()) result.push(...filesIn(absolute));
    else if (entry.isFile()) result.push({ absolute, relative });
  }
  return result;
}
const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const checks = [
  ...forbiddenIdentifiers.map((value) => [
    value,
    new RegExp(`\\b${escape(value)}\\b`),
  ]),
  ...forbiddenIds.map((value) => [
    value,
    new RegExp(
      `(?:^|[\\s/"'` + "`" + `])${escape(value)}(?:$|[\\s/"'` + "`" + `])`,
    ),
  ]),
  ...forbiddenMarkers.map((value) => [value, new RegExp(escape(value))]),
  ...forbiddenAliases.map((value) => [value, new RegExp(escape(value))]),
  ["old call", /\b(?:horizontal|vertical)\s*\(/],
  [
    "old component selection",
    /(?:[?&]component=|(?:^|[?&#])component(?:%3D|=))/,
  ],
  [
    "old route",
    /(?:["'` + "`" + `]|^)(?:\/(?:catalog|overview))(?:\/|["'` + "`" + `]|$)/,
  ],
  [
    "compatibility wording",
    /(?:backwards-compatible|backward-compatible|deprecated|compatibility alias|legacy API)/i,
  ],
];
const errors = [];
for (const { absolute, relative } of filesIn(root)) {
  const source = fs.readFileSync(absolute, "utf8");
  for (const [label, pattern] of checks)
    if (pattern.test(source)) errors.push(`${relative}: forbidden ${label}`);
  if (/^(?:dist|docs-site\/dist)\/(?:catalog|overview)(?:\/|$)/.test(relative))
    errors.push(`${relative}: forbidden generated path`);
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else console.log("Standard public contract scan passed.");
