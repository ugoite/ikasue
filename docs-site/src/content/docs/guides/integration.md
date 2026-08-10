---
title: 統合
---

# 統合

package rootのpure spec/state APIと、`@ugoite/ikasue/elements`のWeb ABI bindingを分けてimportします。structured dataはCustom Elementのproperty、primitiveな宣言はattribute、user intentはdata-only CustomEvent、imperative commandはmethodです。

```ts
import { defineIkaSue } from "@ugoite/ikasue/elements";
import "@ugoite/ikasue/style.css";

defineIkaSue();
const grid = document.querySelector("ika-data-grid");
if (grid) {
  grid.columns = [{ id: "name", label: "Name" }];
  grid.rows = [{ id: "42", cells: { name: "ika" } }];
}
```

application stateはhostが所有し、ikasue elementはbehavior、state transition、renderingを実行します。言語やframeworkごとの利用方法は[ホスト環境から使う](../hosts/)を参照してください。
