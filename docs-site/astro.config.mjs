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
      sidebar: [
        {
          label: "Start here / はじめに",
          items: [
            { label: "Overview / 概要", link: "" },
            {
              label: "Design philosophy / 平面適応UIの思想",
              link: "philosophy/",
            },
            { label: "Usage / 使い方", link: "guides/usage/" },
            { label: "Integration / 統合", link: "guides/integration/" },
            { label: "Interactive catalog / カタログ", link: "catalog/" },
          ],
        },
        {
          label: "Contracts / 契約",
          items: [
            {
              label: "Behavioral contracts / 振る舞い",
              link: "guides/behavioral-contracts/",
            },
            {
              label: "Accessibility / アクセシビリティ",
              link: "guides/accessibility/",
            },
            { label: "Release / リリース", link: "guides/release/" },
          ],
        },
        {
          label: "Components / コンポーネント",
          items: [
            { label: "Component matrix / 一覧", link: "components/" },
            {
              label: "Foundation / 基盤",
              items: [
                {
                  label: "Developer model",
                  link: "components/developer-model/",
                },
                { label: "ThemeRoot", link: "components/theme-root/" },
                { label: "Text", link: "components/text/" },
                { label: "Rule", link: "components/rule/" },
                { label: "StatusIcon", link: "components/status-icon/" },
              ],
            },
            {
              label: "Layout / 配置",
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
              label: "Navigation / ナビゲーション",
              items: [
                { label: "EdgeNav", link: "components/edge-nav/" },
                { label: "ElasticTabs", link: "components/elastic-tabs/" },
              ],
            },
            {
              label: "Actions / 操作",
              items: [
                { label: "IconAction", link: "components/icon-action/" },
                { label: "ActionStrip", link: "components/action-strip/" },
              ],
            },
            {
              label: "Information & input / 情報と入力",
              items: [
                { label: "BooleanText", link: "components/boolean-text/" },
                { label: "ChoiceGroup", link: "components/choice-group/" },
                { label: "FormList", link: "components/form-list/" },
              ],
            },
            {
              label: "Data / データ",
              items: [
                { label: "DataTable", link: "components/data-table/" },
                { label: "HistoryGutter", link: "components/history-gutter/" },
              ],
            },
            {
              label: "Feedback / フィードバック",
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
