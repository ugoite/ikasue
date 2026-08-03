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
          label: "思想",
          translations: { en: "Philosophy" },
          items: [
            {
              label: "概要",
              translations: { en: "Overview" },
              link: "overview/",
            },
            {
              label: "平面適応UIの思想",
              translations: { en: "Design philosophy" },
              link: "philosophy/",
            },
            {
              label: "コンポーネント契約",
              translations: { en: "Developer model" },
              link: "components/developer-model/",
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
              label: "アクセシビリティ",
              translations: { en: "Accessibility" },
              link: "guides/accessibility/",
            },
            {
              label: "リリース",
              translations: { en: "Release" },
              link: "guides/release/",
            },
            {
              label: "インタラクティブカタログ",
              translations: { en: "Interactive catalog" },
              link: "catalog/",
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
                { label: "Vertical", link: "components/vertical/" },
                { label: "Horizontal", link: "components/horizontal/" },
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
        {
          label: "例",
          translations: { en: "Examples" },
          items: [
            {
              label: "サイト形状の例",
              translations: { en: "Five site shapes" },
              link: "examples/",
            },
            {
              label: "運用ダッシュボード",
              translations: { en: "Operations dashboard" },
              link: "examples/operations-dashboard/",
            },
            {
              label: "エディター + preview",
              translations: { en: "Editor + preview" },
              link: "examples/editor-preview/",
            },
            {
              label: "計画 / calendar",
              translations: { en: "Planning / calendar" },
              link: "examples/planning-calendar/",
            },
            {
              label: "現場 / mobile service",
              translations: { en: "Field / mobile service" },
              link: "examples/field-mobile-service/",
            },
            {
              label: "可観測性 / incident console",
              translations: { en: "Observability / incident console" },
              link: "examples/observability-incident-console/",
            },
          ],
        },
      ],
    }),
  ],
});
