---
title: ikasue
description: Plane-centered adaptive UI components for information-dense workspaces.
template: splash
hero:
  tagline: One plane. Negotiated space. Readable work.
  actions:
    - text: コンポーネント一覧を見る
      link: ../components/
      icon: right-arrow
    - text: 思想を読む
      link: ../philosophy/
      variant: minimal
---

ikasueは、情報密度の高いworkspaceのためのframework-neutralなcomponent systemです。すべての領域を一枚のplane上の順序と空間配分として扱い、新しい情報は意味のあるedgeから入り、既存の情報を隠さずに場所を譲ります。

## 平面適応UI

見た目のルールは単純です。浮くcardの分類、overlay drawer、shadow hierarchy、判断の根拠を隠すmodalを増やしません。開発者は`vertical`または`horizontal`で順序と適応方針を宣言し、`resolvePlane`が利用可能な空間に対する位置を決めます。

## 契約から始める

1. [平面適応UIの思想](../philosophy/)で、plane、axis、selectionの考え方を読む。
2. [component inventory](../components/)から現在の17 componentの責務を選ぶ。
3. [使い方](../guides/usage/)と[統合](../guides/integration/)でpackageを既存のappへ組み込む。
4. [振る舞いの契約](../guides/behavioral-contracts/)と[アクセシビリティ](../guides/accessibility/)を実装前に確認する。
5. [例](../examples/)で、異なるsite shapeへの組み合わせを見る。

## package、component page、公開境界

packageは`@ugoite/ikasue`です。`vertical`、`horizontal`、`resolvePlane`とcurrent component metadataを公開します。GitHub Pagesでは各component pageが説明、契約、source、properties、同じregistry/native rendererによるinteractive demoを一体で持ち、packageはGitHub Packagesへ別のworkflowで公開されます。

root localeは日本語です。[English docs](../en/)も同じpath treeを持つ手書きのlocaleとして管理しています。同期scriptはpathの一致とroot-absolute internal linkの混入を検査します。外部の翻訳serviceへ内容を送ることはありません。
