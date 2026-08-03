---
title: Usage / 使い方
description: Compose ikasue components around one negotiated plane.
---

## 最小のmount

packageのstandalone runtime surfaceを既存のDOM targetへmountします。`mountCatalog`はframework-neutralで、既存のapp shellの内側に置けます。GitHub Pagesのcomponent docsでは同じnative rendererを各component pageへembeddedします。

```js
import { mountCatalog } from "@ugoite/ikasue";
import "@ugoite/ikasue/style.css";

const target = document.querySelector("#workspace");
if (!target) throw new Error("workspace target is required");

const catalog = mountCatalog(target, {
  label: "Operations workspace",
  component: "data-table",
});

catalog.select("form-list");
// Route teardown:
catalog.dispose();
```

## planeを先に宣言する

```js
import { horizontal, resolvePlane, vertical } from "@ugoite/ikasue";

const filters = horizontal(["status", "owner", "date"], {
  fit: "wrap",
  gap: 1,
  available: 6,
});
const workspace = vertical(
  [
    { id: "filters", basis: 2, min: 1 },
    { id: "table", basis: 6, min: 3 },
  ],
  { fit: "elastic", gap: 1, available: 8 },
);

const filterLayout = resolvePlane(filters);
const workspaceLayout = resolvePlane(workspace);
```

`PlaneSpec`を先に作ると、componentは利用可能な空間、子の順序、overflowを同じ語彙で扱えます。layoutのために新しいsurfaceや重なりを足す必要はありません。

## 責務で選ぶ

| 必要なもの               | まず使うもの    | plane modelで保てること                  |
| ------------------------ | --------------- | ---------------------------------------- |
| document全体の規則       | `ThemeRoot`     | density、selection、motion、lineの一貫性 |
| 縦の作業列               | `Vertical`      | DOM順と高さの適応                        |
| toolbarや短い比較        | `Horizontal`    | 横順序と幅の適応                         |
| 読む値を必要時だけ編集   | `Text`          | display/editの同じ情報contract           |
| 値とstatusを持つ短いform | `FormList`      | FormListへのstate ownership集中          |
| cell単位の業務データ     | `DataTable`     | selection、copy/paste、inline edit       |
| regionへ戻れる状態表示   | `MessageRegion` | messageとtargetの関係                    |
| 根拠を残した判断         | `BottomDialog`  | 下端rowとして同じplaneに追加             |

`FormList`はvaluesとstatusを所有します。子`Text`のfocusやdraftは編集途中の局所状態であり、確定前に保存済みデータをrecolorする理由にはなりません。

## compositionの確認

component pageのproperty table、JavaScript implementation / usage、Rust implementation sketchと、ページ内のinteractive demoを同じcomponent contractとして確認してください。さらに[例](../examples/)で少数の要素を組み合わせたときのplaneの動きを確認できます。
