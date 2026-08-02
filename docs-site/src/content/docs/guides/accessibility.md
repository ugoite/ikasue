---
title: Accessibility / アクセシビリティ
description: Semantic, keyboard, motion, and resilience requirements for ikasue.
---

アクセシビリティはtheme optionではなく、component contractの一部です。planeの関係をpaintやmotionから推測させず、semantic structure、keyboard、文章、状態属性で公開します。

## semantic structure

- 本物のheading、button、link、form control、table、landmarkを使う。
- regionとgroupにはCSS classではなくtaskを表すlabelを付ける。
- nativeの意味で足りないときだけselected、checked、expanded、busy、live stateを補う。
- icon actionがenabledからbusyへ変わってもaccessible nameを安定させる。

## keyboardとplane geometry

Tabは読み順に従います。ChoiceGroupはradioに近い矢印操作、DataTableはcell axisの矢印操作、TextはEnter/F2、Escape、Enter、Tabのediting contractを持ちます。`Rule`のような受動的要素はTabに入れません。

一時的な`BottomDialog`を開いたら最初のactionへfocusを移し、close後にopenerへ戻します。planeが縮んでもfocus対象を不可視にせず、必要なら`scroll`で到達可能にします。

## non-colorとreduced motion

黒はstructure、状態色はstatusだけに使います。色にはcheck、icon shape、文章、selection surface、line、busy attributeなどを組み合わせます。

`prefers-reduced-motion: reduce`ではtransitionとanimation durationを0にします。motionがなくてもplaneの再配分、text、focus、semantic stateは変わらず理解できます。

## narrow layoutとclipboard

text zoomとnarrow mobileで操作できるようにします。横方向のDataTableはscrollできてもkeyboard focusを失わせません。clipboard permissionがない場合はselectionとinline editingを残し、短いstatus messageで制限を伝えます。

各component pageの「振る舞いとアクセシビリティ」と[component inventory](../components/)を、実装時の個別チェックリストとして使ってください。
