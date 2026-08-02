---
title: Behavioral contracts / 振る舞い契約
description: The cross-component rules that define the ikasue runtime.
---

これらは見た目ではなくcomponent APIの契約です。画面が似ていても、plane、state ownership、keyboardの契約を壊せばikasueの実装とはみなしません。

## 共通ルール

- propertyはliveに更新でき、documented defaultへ戻せる。
- 各component pageはJSON contractとJavaScript / Rust sourceを公開する。
- 情報はsemantic edgeから入り、同じplane内でspaceを再配分する。overlayは必要条件ではない。
- selection、status、progressはsemantic colorとnon-color cueを組み合わせる。
- `prefers-reduced-motion: reduce`でもstate、direction、focusを失わない。

## Planeと配置

`vertical`と`horizontal`はordered childrenを`PlaneSpec`にし、`resolvePlane`がavailable extentに対するoffset、size、line、overflowを返します。`elastic`はminimumへ縮み、`wrap`はlineを増やし、`scroll`は子のsizeを保ってoverflowを報告します。

layout ownerは子の内容やwidget stateを所有しません。`Rule`は境界を示し、`ProgressRegion`は対象情報を残し、`BottomDialog`は下端からrowを追加します。

## 情報、編集、form state

`Text`はreadable by defaultです。EnterまたはF2で編集、Escapeで取消、Enterで確定し、Tabは確定して次のeditable valueへ移ります。確定値は通常のstate updateとして親へ返し、独自のpublic event nameを要求しません。

`FormList`がvalues、validation status、確定結果を所有します。子`Text`のfocusとdraftは局所状態であり、編集途中のdraftでsource dataをrecolorしません。

## 選択、表、feedback

`ChoiceGroup`はradioに近いkeyboard contractで一つのvalueを選びます。`DataTable`はcellを単位にselection、row/column context、copy、paste、inline editを扱います。clipboard permissionがない場合もselectionと説明を残します。

`StatusIcon`と`MessageRegion`は色だけに頼らず、label、icon、targetを公開します。`ProgressRegion`は以前の内容を読めるまま処理対象のregionだけを示します。

## 検証

desktop、narrow width、keyboard-only、text zoom、reduced motionで同じ契約を確認します。focusを奪う一時領域はclose後にopenerへ戻し、判断の根拠を隠さないことを確認してください。
