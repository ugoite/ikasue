import { COMPONENT_COPY as REGISTRY_COMPONENT_COPY } from "../../../src/catalog/registry";
import type {
  CatalogComponentId,
  CatalogDocumentationCopy,
  CatalogLocale,
} from "../../../src/catalog/types";

export type DocsLocale = CatalogLocale;
export type ComponentCopy = CatalogDocumentationCopy;

export const COMPONENT_COPY = REGISTRY_COMPONENT_COPY;

export interface ComponentUiCopy {
  readonly catalogLink: string;
  readonly demoId: string;
  readonly contract: string;
  readonly useWhen: string;
  readonly avoidWhen: string;
  readonly implementation: string;
  readonly implementationUsage: string;
  readonly javascript: string;
  readonly rust: string;
  readonly properties: string;
  readonly propertiesCaption: (name: string) => string;
  readonly key: string;
  readonly type: string;
  readonly defaultValue: string;
  readonly values: string;
  readonly noProps: string;
  readonly behaviorAccessibility: string;
  readonly goodFor: string;
  readonly avoidFor: string;
  readonly interaction: string;
  readonly keyboard: string;
  readonly accessibility: string;
  readonly matrixNote: string;
  readonly matrixContract: string;
  readonly matrixCaption: string;
  readonly component: string;
  readonly category: string;
  readonly summary: string;
  readonly demo: string;
  readonly openCatalog: string;
  readonly matrixLink: string;
}

export const COMPONENT_UI_COPY: Record<DocsLocale, ComponentUiCopy> = {
  ja: {
    catalogLink: "インタラクティブカタログを開く ↗",
    demoId: "デモ ID:",
    contract: "契約",
    useWhen: "使う場面",
    avoidWhen: "避ける場面",
    implementation: "実装",
    implementationUsage:
      "JavaScript implementation / usage と Rust implementation sketch",
    javascript: "JavaScript implementation / usage",
    rust: "Rust implementation sketch",
    properties: "プロパティ",
    propertiesCaption: (name) => `${name} のプロパティ`,
    key: "キー",
    type: "型",
    defaultValue: "既定値",
    values: "値",
    noProps: "設定可能なプロパティはありません。",
    behaviorAccessibility: "振る舞いとアクセシビリティ",
    goodFor: "適する対象",
    avoidFor: "適さない対象",
    interaction: "操作",
    keyboard: "キーボード",
    accessibility: "アクセシビリティ",
    matrixNote:
      "インタラクティブカタログと同じメタデータから描画する、現在の17 componentの一覧です。",
    matrixContract:
      "各pageはPlane API、state ownership、keyboard、accessibility、JavaScript / Rust sourceを同じ契約として説明します。",
    matrixCaption: "ikasue component inventory",
    component: "component",
    category: "カテゴリ",
    summary: "概要",
    demo: "デモ",
    openCatalog: "カタログを開く ↗",
    matrixLink: "component一覧へ戻る",
  },
  en: {
    catalogLink: "Open interactive catalog ↗",
    demoId: "Demo ID:",
    contract: "Contract",
    useWhen: "Use it when",
    avoidWhen: "Avoid it when",
    implementation: "Implementation",
    implementationUsage:
      "JavaScript implementation / usage and Rust implementation sketch",
    javascript: "JavaScript implementation / usage",
    rust: "Rust implementation sketch",
    properties: "Properties",
    propertiesCaption: (name) => `${name} properties`,
    key: "Key",
    type: "Type",
    defaultValue: "Default",
    values: "Values",
    noProps: "This component has no configurable properties.",
    behaviorAccessibility: "Behavior and accessibility",
    goodFor: "Good for",
    avoidFor: "Not for",
    interaction: "Interaction",
    keyboard: "Keyboard",
    accessibility: "Accessibility",
    matrixNote:
      "This matrix uses the same metadata as the interactive catalog and lists the current 17-component inventory.",
    matrixContract:
      "Every page explains the Plane API, state ownership, keyboard behavior, accessibility, and JavaScript / Rust sources as one contract.",
    matrixCaption: "ikasue component inventory",
    component: "Component",
    category: "Category",
    summary: "Summary",
    demo: "Demo",
    openCatalog: "Open catalog ↗",
    matrixLink: "Back to component inventory",
  },
};

export function componentCopy(
  locale: DocsLocale,
  id: CatalogComponentId,
): ComponentCopy {
  return COMPONENT_COPY[locale][id];
}
