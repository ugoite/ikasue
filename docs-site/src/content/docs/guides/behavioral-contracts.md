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

`vertical`と`horizontal`はordered childrenを`PlaneSpec`にし、`resolvePlane`がavailable extentに対するoffset、size、line、state、navigation boundsを返します。`elastic`はfocus中のchildへ面積を優先し、狭いときは他のchildをcollapsedにします。`wrap`はchildのsizeを保ってlineを増やします。

layout ownerは子の内容やwidget stateを所有しません。`Rule`は境界を示し、`ProgressRegion`は対象情報を残し、`BottomDialog`は下端からrowを追加します。

## 情報、編集、form state

`Text`はreadable by defaultです。EnterまたはF2で編集、Escapeで取消、Enterで確定し、Tabは確定して次のeditable valueへ移ります。確定値は通常のstate updateとして親へ返し、独自のpublic event nameを要求しません。

`FormList`がvalues、validation status、確定結果を所有します。子`Text`、select、textareaのfocusとdraftは局所状態であり、blur、Enter、Tabで編集が終わってもFormListへは送られません。明示的なexternal-send actionだけが全draftを一括でFormListへ適用し、その後に子のdraft表示を解除します。元のvalueへ戻したdraftを送信した場合は、cleanなsource statusのままです。初期server statusは送信まで表示され、編集中のdraft affordanceはcreated/modifiedの意味色ではなく中立表示にします。

## 選択、表、feedback

`ChoiceGroup`はradioに近いkeyboard contractで一つのvalueを選びます。`DataTable`はcellを単位にselection、row/column context、copy、paste、inline editを扱います。clipboard permissionがない場合もselectionと説明を残します。

`StatusIcon`と`MessageRegion`は色だけに頼らず、label、icon、targetを公開します。`ProgressRegion`は以前の内容を読めるまま処理対象のregionだけを示します。

## 検証

desktop、narrow width、keyboard-only、text zoom、reduced motionで同じ契約を確認します。focusを奪う一時領域はclose後にopenerへ戻し、判断の根拠を隠さないことを確認してください。
