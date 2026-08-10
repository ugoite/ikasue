---
title: Integration / 統合
description: Mount the plane-centered runtime in an existing application.
---

## packageをinstallする

`@ugoite/ikasue`はGitHub Packagesへ公開されます。利用側projectで`@ugoite` scopeのregistryを設定し、package managerとCIのsecret storeで認証してください。

```sh
npm install @ugoite/ikasue --registry=https://npm.pkg.github.com
```

認証情報はこのdocsへ書かず、組織が管理するGitHub Packagesの通常の設定を使います。

## Web ABIとplane API

```js
import {
  horizontal,
  resolvePlane,
  vertical,
} from "@ugoite/ikasue";
import { defineIkaSue } from "@ugoite/ikasue/elements";
import "@ugoite/ikasue/style.css";

defineIkaSue();
const grid = document.querySelector<HTMLElement & {
  rows: readonly { id: string; cells: Record<string, string> }[];
}>("ika-data-grid");
if (grid) grid.rows = [{ id: "42", cells: { name: "ika" } }];

const header = horizontal(["title", "actions"], { fit: "elastic", gap: 1 });
const body = vertical(["filters", "table"], { fit: "elastic", gap: 1 });
const layout = resolvePlane(vertical(["header", "body"], { gap: 1 }));
```

elementのproperties、events、methodsがWeb ABIです。`vertical`、`horizontal`、`resolvePlane`はDOM frameworkから独立したserializableなplane contractです。[ホスト環境から使う](hosts/)では、同じelementを各言語環境から操作する方法を説明しています。

## state ownership

componentを複数のwrapperで囲む前に、どのcomponentが値、status、selection、draftを所有するかを決めます。特に`FormList`はvaluesとstatusのownerです。子`Text`にfocusとdraftを渡しても、それは編集中の局所表示であり、保存済みデータをrecolorしてはいけません。

## CSSとhost layout

`@ugoite/ikasue/style.css`はapplication boundaryで一度だけimportします。mount targetには実際のblock sizeを与え、ancestor transformでdirectional layoutの意味を変えないようにします。host側のfocus styleも残してください。

docs siteのcomponent pageは同じAstro base pathの中にbuildされ、interactive demoもそのページ内に含まれます。GitHub Pagesのsite pathを想定したリンクはAstro component内で`sitePath`を使い、contentのinternal linkはrelative pathにします。
