import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import routeData from "../scripts/catalog-routes.json" with { type: "json" };

const repository = process.env.GITHUB_REPOSITORY?.split("/");
const repositoryOwner = repository?.[0];
const repositoryName = repository?.[1];
const base =
  process.env.ASTRO_BASE?.trim() ||
  (process.env.GITHUB_ACTIONS === "true" && repositoryName
    ? `/${repositoryName}/`
    : "/");
const normalizedBase =
  base === "/" ? "/" : `/${base.replace(/^\/+|\/+$/g, "")}/`;
const projectSite =
  repositoryOwner && repositoryName
    ? `https://${repositoryOwner}.github.io`
    : "https://ugoite.github.io";

const components = routeData.componentIds;
const componentItems = components.map((id) => ({
  label: id,
  link: `components/${id}/`,
}));

export default defineConfig({
  site: projectSite,
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
          label: "Guides",
          translations: { ja: "ガイド" },
          items: [
            {
              label: "Behavioral Contracts",
              translations: { ja: "振る舞いの契約" },
              link: "guides/behavioral-contracts/",
            },
            {
              label: "Usage",
              translations: { ja: "使い方" },
              link: "guides/usage/",
            },
            {
              label: "Integration",
              translations: { ja: "統合" },
              link: "guides/integration/",
            },
            {
              label: "Accessibility",
              translations: { ja: "アクセシビリティ" },
              link: "guides/accessibility/",
            },
            {
              label: "Release",
              translations: { ja: "リリース" },
              link: "guides/release/",
            },
          ],
        },
        {
          label: "Examples",
          translations: { ja: "例" },
          items: [
            {
              label: "Composition examples",
              translations: { ja: "構成例" },
              link: "examples/",
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
