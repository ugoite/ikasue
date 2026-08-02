import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";

const [repositoryOwner, repositoryName] = (
  process.env.GITHUB_REPOSITORY ?? ""
).split("/");
const projectBase = repositoryName ? `/${repositoryName}` : "/";
const projectSite =
  repositoryOwner && repositoryName
    ? `https://${repositoryOwner}.github.io`
    : "https://ugoite.github.io";

export default defineConfig({
  site: projectSite,
  base: projectBase,
  integrations: [
    starlight({
      title: "ikasue",
      description:
        "Planar adaptive UI components for information-dense workspaces.",
      favicon: "favicon.svg",
      locales: {
        root: { label: "日本語", lang: "ja" },
        en: { label: "English", lang: "en" },
      },
      defaultLocale: "root",
      customCss: ["./src/styles/custom.css"],
      components: {
        PageFrame: "./src/components/IkasuePageFrame.astro",
      },
      sidebar: [
        {
          label: "はじめに",
          translations: { en: "Start here" },
          items: [
            { label: "概要", translations: { en: "Overview" }, link: "" },
            {
              label: "平面適応UIの思想",
              translations: { en: "Design philosophy" },
              link: "philosophy/",
            },
            {
              label: "使い方",
              translations: { en: "Usage" },
              link: "guides/usage/",
            },
            {
              label: "統合",
              translations: { en: "Integration" },
              link: "guides/integration/",
            },
            {
              label: "インタラクティブカタログ",
              translations: { en: "Interactive catalog" },
              link: "catalog/",
            },
          ],
        },
        {
          label: "契約",
          translations: { en: "Contracts" },
          items: [
            {
              label: "振る舞いの契約",
              translations: { en: "Behavioral contracts" },
              link: "guides/behavioral-contracts/",
            },
            {
              label: "アクセシビリティ",
              translations: { en: "Accessibility" },
              link: "guides/accessibility/",
            },
            {
              label: "リリース",
              translations: { en: "Release" },
              link: "guides/release/",
            },
          ],
        },
        {
          label: "コンポーネント",
          translations: { en: "Components" },
          items: [
            {
              label: "コンポーネント一覧",
              translations: { en: "Component matrix" },
              link: "components/",
            },
            {
              label: "基盤",
              translations: { en: "Foundation" },
              items: [
                {
                  label: "開発者モデル",
                  translations: { en: "Developer model" },
                  link: "components/developer-model/",
                },
                { label: "ThemeRoot", link: "components/theme-root/" },
                { label: "Text", link: "components/text/" },
                { label: "Rule", link: "components/rule/" },
                { label: "StatusIcon", link: "components/status-icon/" },
              ],
            },
            {
              label: "配置",
              translations: { en: "Layout" },
              items: [
                { label: "Stack", link: "components/stack/" },
                { label: "Cluster", link: "components/cluster/" },
                { label: "FocusPlane", link: "components/focus-plane/" },
                { label: "FocusRegion", link: "components/focus-region/" },
                { label: "AxisFlow", link: "components/axis-flow/" },
                { label: "EdgeRegion", link: "components/edge-region/" },
                { label: "BottomDock", link: "components/bottom-dock/" },
              ],
            },
            {
              label: "ナビゲーション",
              translations: { en: "Navigation" },
              items: [
                { label: "EdgeNav", link: "components/edge-nav/" },
                { label: "ElasticTabs", link: "components/elastic-tabs/" },
              ],
            },
            {
              label: "操作",
              translations: { en: "Actions" },
              items: [
                { label: "IconAction", link: "components/icon-action/" },
                { label: "ActionStrip", link: "components/action-strip/" },
              ],
            },
            {
              label: "情報と入力",
              translations: { en: "Information & input" },
              items: [
                { label: "BooleanText", link: "components/boolean-text/" },
                { label: "ChoiceGroup", link: "components/choice-group/" },
                { label: "FormList", link: "components/form-list/" },
              ],
            },
            {
              label: "データ",
              translations: { en: "Data" },
              items: [
                { label: "DataTable", link: "components/data-table/" },
                { label: "HistoryGutter", link: "components/history-gutter/" },
              ],
            },
            {
              label: "フィードバック",
              translations: { en: "Feedback" },
              items: [
                {
                  label: "ProgressRegion",
                  link: "components/progress-region/",
                },
                { label: "MessageRegion", link: "components/message-region/" },
                { label: "BottomDialog", link: "components/bottom-dialog/" },
              ],
            },
          ],
        },
      ],
    }),
  ],
});
