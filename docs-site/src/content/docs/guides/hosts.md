---
title: ホスト環境から使う
description: JavaScript、各種framework、Rust/WASM、worker、WebViewから同じikasue Web ABIを使う。
---

# ホスト環境から使う

ikasueはJSのUI libraryではありません。Webを実行環境とするportable UI runtimeであり、公開境界は`ikasue-web/2` Web ABIです。JavaScript/TypeScript、React、Vue、Svelte、Angular、Rust/WASM、Worker、WebViewのどれをhostにしても、最後は同じ`HTMLElement`を操作します。

## まずWeb ABIを登録する

どのhostでも最初に一度だけelementを登録します。global registryを使う場合は次の形です。

```ts
import { defineIkaSue } from "@ugoite/ikasue/elements";
import "@ugoite/ikasue/style.css";

defineIkaSue();
```

microfrontendや異なるpackage versionを分離したい場合はScoped Custom Element Registryを渡せます。登録は同じregistryに対してidempotentで、別のconstructorがすでに同じtagを持つ場合はconflictとして失敗します。

```ts
import { defineIkaSue } from "@ugoite/ikasue/elements";
import { renderIkaView } from "@ugoite/ikasue/view";

const registry = new CustomElementRegistry();
defineIkaSue(registry);
const host = document.querySelector<HTMLElement>("#isolated-root");
if (!host) throw new Error("#isolated-root is required");
renderIkaView(
  host,
  { version: "ikasue-web/2", kind: "text", text: "Isolated host" },
  registry,
);
```

これはrendererをhostへ配る仕組みではありません。hostはelementを作り、propertiesを渡し、eventsを受け、必要なcommand methodを呼びます。

## Attribute / property / event / method

4種類を混ぜません。

| 境界                       | 使うもの              | 例                                           |
| -------------------------- | --------------------- | -------------------------------------------- |
| primitiveな宣言            | attribute             | `density="compact"`、`editable`              |
| structured data            | property              | `grid.columns = columns`、`grid.rows = rows` |
| user intent / state change | data-only CustomEvent | `ika-select`                                 |
| imperative command         | method                | `grid.focus()`、`grid.scrollToRow("42")`     |

```ts
const grid = document.querySelector<
  HTMLElement & {
    columns: readonly { id: string; label: string }[];
    rows: readonly { id: string; cells: Record<string, string> }[];
    scrollToRow(id: string): void;
  }
>("ika-data-grid");

if (!grid) throw new Error("ika-data-grid is required");
grid.setAttribute("density", "compact");
grid.columns = [{ id: "name", label: "Name" }];
grid.rows = [{ id: "42", cells: { name: "ika" } }];
grid.addEventListener("ika-select", (event) => {
  const selection = (event as CustomEvent).detail;
  // selection is JSON-safe; map it to the host state here.
  console.log(selection);
});
grid.scrollToRow("42");
```

`CustomEvent.detail`はfunction、DOM node、`Promise`、`Date`、`Map`、`Set`、class instanceを含みません。失敗は`ika-error`のdata-only detailで通知されます。ネットワーク、認証、storage、routingの責務はhost側です。

## JavaScript / TypeScript

素のWeb hostでは、elementをHTMLに置いてからstructured propertyを設定します。TypeScriptでは`@ugoite/ikasue/elements`の型を使い、必要なelement interfaceを自分のDOM queryへ付けます。componentのstateはhostが所有し、ikasueはDOM上のbehavior、state、renderingを実行します。

```html
<ika-tabs orientation="horizontal"></ika-tabs>
```

```ts
import { defineIkaSue } from "@ugoite/ikasue/elements";
defineIkaSue();

const tabs = document.querySelector("ika-tabs");
if (tabs) {
  tabs.items = [
    { id: "overview", label: "Overview" },
    { id: "detail", label: "Detail" },
  ];
  tabs.activeId = "overview";
}
```

## React

Reactはhostです。componentをReactで再実装せず、Custom ElementをJSX treeに置き、structured valueはelement propertyへ渡します。Reactのevent propではなく、必要なら`ref`から`addEventListener`を登録します。

```tsx
import { useEffect, useRef } from "react";
import { defineIkaSue } from "@ugoite/ikasue/elements";

defineIkaSue();

export function Results({ rows }: { rows: readonly unknown[] }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const grid = ref.current;
    if (!grid) return;
    (grid as HTMLElement & { rows: readonly unknown[] }).rows = rows;
    const onSelection = (event: Event) =>
      console.log((event as CustomEvent).detail);
    grid.addEventListener("ika-select", onSelection);
    return () => grid.removeEventListener("ika-select", onSelection);
  }, [rows]);
  return <ika-data-grid ref={ref} density="compact" />;
}
```

React adapterを作る場合も、adapterはproperty assignment、event binding、型補助だけを担当します。DataGridやTabsのDOM behaviorをReact rendererとして複製しません。

## Vue

VueではCustom Elementをcompilerのcustom element設定でhost componentとして扱います。primitiveはattribute、objectやarrayはelement propertyへ明示的に渡します。`@ika-select`相当のwrapper eventを発明せず、必要な場合は`addEventListener`をbindingのlifecycleに合わせて管理します。

```vue
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { defineIkaSue } from "@ugoite/ikasue/elements";

defineIkaSue();

const grid = ref<HTMLElement | null>(null);
onMounted(() => {
  if (grid.value) {
    (grid.value as HTMLElement & { rows: readonly unknown[] }).rows = [];
  }
});
</script>

<template><ika-data-grid ref="grid" density="compact" /></template>
```

## Svelte

Svelteでも`bind:this`でelementを受け、mount後にpropertiesを設定します。Svelteのcomponent stateはhostに置き、ikasueのevent detailをdata-only messageとして取り込みます。

```svelte
<script lang="ts">
  import { onMount } from "svelte";
  import { defineIkaSue } from "@ugoite/ikasue/elements";

  defineIkaSue();

  let grid: HTMLElement;
  onMount(() => {
    (grid as HTMLElement & { columns: readonly unknown[] }).columns = [];
  });
</script>

<ika-data-grid bind:this={grid} density="compact" />
```

## Angular

AngularではCustom Elementsを利用可能にしたうえで、`ElementRef`からnative elementを取得します。Angular template bindingがstructured propertyをattribute stringへ変換しないよう、object/arrayはcomponent lifecycle内でproperty assignmentします。

```ts
import { AfterViewInit, ElementRef, ViewChild } from "@angular/core";
import { defineIkaSue } from "@ugoite/ikasue/elements";

defineIkaSue();

export class ResultsComponent implements AfterViewInit {
  @ViewChild("grid") grid!: ElementRef<HTMLElement>;

  ngAfterViewInit(): void {
    const element = this.grid.nativeElement as HTMLElement & {
      rows: readonly unknown[];
    };
    element.rows = [];
  }
}
```

```html
<ika-data-grid #grid density="compact"></ika-data-grid>
```

## Rust / WASM

Rust/WASMはDOMをもう一つ描画しません。`wasm-bindgen` / `web-sys`で同じCustom Elementをqueryし、primitive attribute、JSON-serialized property、data-only eventを使います。Rustのstructは`serde`で`contract/*.schema.json`と同じ形へserializeします。

```rust
use wasm_bindgen::JsCast;
use web_sys::HtmlElement;

let grid: HtmlElement = document()
    .query_selector("ika-data-grid")?
    .ok_or("ika-data-grid is required")?
    .dyn_into()?;
grid.set_attribute("density", "compact")?;
// columns / rows are serde_json values assigned through the Web ABI binding.
grid.focus()?;
```

Rust側のAPIはbindingです。runtimeとDOM rendererをRustに移植するものではありません。WASMがWorkerにいる場合も、data accessは次のhost flowに置きます。

## Worker / host data access

elementはmodelやMessagePortを所有しません。elementが所有するのはDOM geometryとinteractionだけです。hostはWorker、REST client、database、native IPCなどを使ってdata accessを実行し、結果をcontrolled propertyへ戻します。

```ts
grid.addEventListener("ika-query", async (event) => {
  const query = (event as CustomEvent<{ offset: number; limit: number }>)
    .detail;
  grid.loading = true;
  try {
    const page = await loadRows(query);
    grid.rows = page.rows;
    grid.total = page.total;
    grid.error = undefined;
  } catch (error) {
    grid.error = error instanceof Error ? error.message : "Request failed";
  } finally {
    grid.loading = false;
  }
});
```

`ika-query`だけがelementから出るdata-window requestです。detailはJSON-safeで、transport、storage、cancellation objectを含みません。それらはhostの責務です。

## WebView / Tauri-style host

WebView系hostでは、native側がJSONを作り、WebView内のCustom Elementへ渡します。逆方向はCustomEventのdetailをJSONとしてIPCへ送り返します。IPCのchannel、権限、認証、retryはhostの責務です。

```ts
import { renderIkaView } from "@ugoite/ikasue/view";

const view = {
  version: "ikasue-web/2",
  kind: "data-grid",
  props: {
    columns: [{ id: "name", label: "Name" }],
    rows: [{ id: "42", cells: { name: "ika" } }],
  },
} as const;
renderIkaView(document.querySelector("#root")!, view);
```

serialized viewは`IkaView → <ika-…>`へlowerするだけです。hostごとに別rendererを作らず、同じelement behavior、a11y、CSS boundaryを使います。

## Styling boundary

外部hostが依存できるstyling APIはCSS custom properties、`::part()`、slots、公開attribute/stateだけです。内部class nameはABIではありません。composition primitiveはlight DOM寄り、DataGrid、Tabs、SplitView、complex editorは必要に応じてShadow DOMと`part`を使います。

```css
ika-data-grid {
  --ikasue-grid-cell-padding: 0.25rem;
}

ika-data-grid::part(table) {
  font-variant-numeric: tabular-nums;
}
```

## hostを選ぶ基準

どの環境でも、次の順で設計します。

1. JSON-safe contractでdataとstateを定義する。
2. primitiveはattribute、structured valueはpropertyへ分ける。
3. user intentはCustomEvent、imperative commandはmethodにする。
4. data accessをhostに置き、controlled resultを再代入する。
5. hostのstate/lifecycleでlistenerとdata clientをdisposeする。

frameworkや言語を選んでも、最後の境界が同じならikasueのbehaviorとUI semanticsは一つのままです。
