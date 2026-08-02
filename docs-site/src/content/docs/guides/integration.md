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

## mountとplane API

```js
import {
  horizontal,
  mountCatalog,
  resolvePlane,
  vertical,
} from "@ugoite/ikasue";
import "@ugoite/ikasue/style.css";

const target = document.querySelector("#workspace");
const handle = target
  ? mountCatalog(target, {
      label: "Operations workspace",
      component: "data-table",
    })
  : undefined;

const header = horizontal(["title", "actions"], { fit: "elastic", gap: 1 });
const body = vertical(["filters", "table"], { fit: "elastic", gap: 1 });
const layout = resolvePlane(vertical(["header", "body"], { gap: 1 }));

handle?.dispose();
```

`mountCatalog` owns listeners and the generated catalog subtree for its target. `dispose()`をroute teardownで呼びます。`vertical`、`horizontal`、`resolvePlane`はDOM frameworkから独立したserializableなplane contractです。

## state ownership

componentを複数のwrapperで囲む前に、どのcomponentが値、status、selection、draftを所有するかを決めます。特に`FormList`はvaluesとstatusのownerです。子`Text`にfocusとdraftを渡しても、それは編集中の局所表示であり、保存済みデータをrecolorしてはいけません。

## CSSとhost layout

`@ugoite/ikasue/style.css`はapplication boundaryで一度だけimportします。mount targetには実際のblock sizeを与え、ancestor transformでdirectional layoutの意味を変えないようにします。host側のfocus styleも残してください。

docs siteの[catalog](../catalog/)は同じAstro base pathの中にbuildされます。GitHub Pagesのsite pathを想定したリンクはAstro component内で`sitePath`または`catalogPath`を使い、contentのinternal linkはrelative pathにします。
