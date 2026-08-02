---
title: Design philosophy / 平面適応UIの思想
description: The plane-centered principles behind ikasue.
---

ikasueは「新しい情報は、同じplaneのどこに入るべきか」という問いから始まります。右側のdetailは右から、下端の判断領域は下から入り、既存の情報は隠されずに再配分されます。edgeはmotionの起点であるだけでなく、情報の所属を示します。

これは装飾を嫌うための規則ではありません。actionと、そのactionを理解するためのevidenceの関係を保つための規則です。

import Principles from "../../components/Principles.astro";

<Principles />

## systemの読み方

### Planeは共有された作業面

componentをZ軸へ重ねる代わりに、planeの中で順序と面積を調整します。開発者は`PlaneSpec`のaxis、fit、gap、childrenを宣言し、`resolvePlane`は各childのoffset、size、line、overflowを返します。

### Axisは一度に一つ

`vertical`と`horizontal`は子の順序を公開する小さなprimitiveです。収まる間は順序を保ち、必要になったときだけ`elastic`、`wrap`、`scroll`の契約へ適応します。layout ownerは子の内容やfocusを勝手に所有しません。

### 情報が先、編集が後

`Text`は読む状態が標準です。editable capabilityを追加したときだけeditorを出し、確定値とdraftを区別します。`FormList`ではvaluesとstatusをFormListが所有し、childのfocus/draftは元データをrecolorしません。

### Selectionは面積を持つ

選択は薄いunderlineや濃いborderだけではなく、静かな面積として示します。状態色は意味のあるstatusだけに使い、黒は構造に使います。

### Card taxonomyを作らない

分類のために箱を増やしません。余白、順序、`Rule`、semantic headingで意味を分けます。新しい領域は既存のevidenceを覆わずに、所属するedgeから同じplaneへ入ります。

## 設計レビューの問い

- 判断の根拠を、現在のworkspaceの中で読み続けられるか。
- 新しい情報は所属するedgeから入り、既存の内容に場所を譲っているか。
- keyboard、text zoom、narrow width、reduced motionでも同じ関係が理解できるか。
