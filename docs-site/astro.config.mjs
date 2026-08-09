import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";

const repository = process.env.GITHUB_REPOSITORY?.split("/");
const base =
  process.env.ASTRO_BASE?.trim() ||
  (process.env.GITHUB_ACTIONS === "true" && repository?.[1]
    ? `/${repository[1]}/`
    : "/");
const normalizedBase =
  base === "/" ? "/" : `/${base.replace(/^\/+|\/+$/g, "")}/`;

const components = [
  "theme-root",
  "text",
  "editable-text",
  "flex",
  "stack",
  "grid",
  "scroll-area",
  "separator",
  "tabs",
  "sidebar",
  "toolbar",
  "icon-button",
  "text-field",
  "checkbox",
  "radio-group",
  "segmented-control",
  "field",
  "form",
  "data-grid",
  "status-indicator",
  "alert",
  "progress",
  "dialog",
  "split-view",
  "side-panel",
  "bottom-panel",
  "loading-region",
  "history-timeline",
];
const componentItems = components.map((id) => ({
  label: id,
  link: `components/${id}/`,
}));

export default defineConfig({
  site: "https://ugoite.github.io",
  base: normalizedBase,
  integrations: [
    starlight({
      title: "ikasue",
      description:
        "Standard web components with a planar interaction language.",
      favicon: "favicon.svg",
      locales: {
        root: { label: "日本語", lang: "ja" },
        en: { label: "English" },
      },
      defaultLocale: "root",
      customCss: ["./src/styles/custom.css"],
      components: { PageFrame: "./src/components/IkasuePageFrame.astro" },
      sidebar: [
        {
          label: "Getting Started",
          translations: { ja: "はじめに" },
          items: [{ label: "Start", translations: { ja: "開始" }, link: "" }],
        },
        {
          label: "Layout",
          translations: { ja: "レイアウト" },
          items: [
            {
              label: "Components",
              translations: { ja: "コンポーネント" },
              link: "components/",
            },
          ],
        },
        {
          label: "Navigation",
          translations: { ja: "ナビゲーション" },
          items: [
            {
              label: "Tabs and Sidebar",
              translations: { ja: "TabsとSidebar" },
              link: "components/tabs/",
            },
          ],
        },
        {
          label: "Workspace",
          translations: { ja: "Workspace" },
          items: [
            { label: "SplitView", link: "components/split-view/" },
            {
              label: "Panels",
              translations: { ja: "Panel" },
              link: "components/bottom-panel/",
            },
          ],
        },
        {
          label: "Principles",
          translations: { ja: "原則" },
          items: [
            {
              label: "Philosophy",
              translations: { ja: "思想" },
              link: "philosophy/",
            },
          ],
        },
        {
          label: "Component inventory",
          translations: { ja: "一覧" },
          items: componentItems,
        },
      ],
    }),
  ],
});
