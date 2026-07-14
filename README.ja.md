<p align="center">
  <img width="320" src="https://wpimg.wallstcn.com/ecc53a42-d79b-42e2-8852-5126b810a4c8.svg">
</p>

<p align="center">
  <a href="https://github.com/vuejs/core">
    <img src="https://img.shields.io/badge/vue-3.4-brightgreen.svg" alt="vue">
  </a>
  <a href="https://github.com/element-plus/element-plus">
    <img src="https://img.shields.io/badge/element--plus-2.7-brightgreen.svg" alt="element-plus">
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/typescript-5.4-blue.svg" alt="typescript">
  </a>
  <a href="https://vitejs.dev/">
    <img src="https://img.shields.io/badge/vite-5.2-646cff.svg" alt="vite">
  </a>
  <a href="https://github.com/PanJiaChen/vue-element-admin/blob/master/LICENSE">
    <img src="https://img.shields.io/github/license/mashape/apistatus.svg" alt="license">
  </a>
  <a href="https://github.com/PanJiaChen/vue-element-admin/releases">
    <img src="https://img.shields.io/github/release/PanJiaChen/vue-element-admin.svg" alt="GitHub release">
  </a>
  <a href="https://gitter.im/vue-element-admin/discuss">
    <img src="https://badges.gitter.im/Join%20Chat.svg" alt="gitter">
  </a>
  <a href="https://panjiachen.gitee.io/vue-element-admin-site/zh/donate">
    <img src="https://img.shields.io/badge/%24-donate-ff69b4.svg" alt="donate">
  </a>
</p>

日本語 | [English](./README.md) | [简体中文](./README.zh-CN.md) | [Spanish](./README.es.md)

## 概要

[vue-element-admin](https://panjiachen.github.io/vue-element-admin) は管理画面向けの本番運用可能なフロントエンドソリューションです。[Vue 3](https://github.com/vuejs/core) をベースに、UI ツールキットとして [Element Plus](https://github.com/element-plus/element-plus) を使用しています。

[vue-element-admin](https://panjiachen.github.io/vue-element-admin) は、最新の開発スタック（Vue 3 + TypeScript + Vite + Pinia）で構築されており、組み込みの多言語対応ソリューション、エンタープライズ向け典型テンプレート、多数の優れた機能を備えています。大規模で複雑なシングルページアプリケーションの構築を支援します。どのようなニーズであっても、このプロジェクトが役立つと信じています。

- [デモページ](https://panjiachen.github.io/vue-element-admin)

- [ドキュメント](https://panjiachen.github.io/vue-element-admin-site/)

- [Gitter](https://gitter.im/vue-element-admin/discuss)

- [Donate](https://panjiachen.gitee.io/vue-element-admin-site/zh/donate)

- [Wiki](https://github.com/PanJiaChen/vue-element-admin/wiki)

- おすすめシンプルテンプレート：[vue-admin-template](https://github.com/PanJiaChen/vue-admin-template)
- デスクトップバージョン：[electron-vue-admin](https://github.com/PanJiaChen/electron-vue-admin)
- [awesome-project](https://github.com/PanJiaChen/vue-element-admin/issues/2312)

## マイグレーション

**現在のバージョンは `v5.0+` で、Vue 3 + TypeScript + Vite + Pinia + Element Plus をベースに構築されています。**

旧バージョンの `v4.x` ブランチ（Vue 2 + Vue CLI + Vuex + Element UI）からアップグレードする場合は、リポジトリを再クローンし、業務コードを移行してください。v5 のアーキテクチャは v4 のビルドシステムと互換性がなく、また本プロジェクトは Internet Explorer をサポートしていません。

問題が発生した場合は、お気軽に [issue](https://github.com/PanJiaChen/vue-element-admin/issues/new) を作成してください。

**本プロジェクトは低バージョンのブラウザ（例：IE）をサポートしていません。必要に応じて polyfill を追加してください。**

## 前準備

ローカル環境に [node](https://nodejs.org/) と [git](https://git-scm.com/) のインストールが必要です。本プロジェクトは [ES2015+](https://es6.ruanyifeng.com/)、[Vue 3](https://ja.vuejs.org/)、[Pinia](https://pinia.vuejs.org/)、[vue-router](https://router.vuejs.org/)、[Vite](https://ja.vitejs.dev/)、[axios](https://github.com/axios/axios) および [Element Plus](https://github.com/element-plus/element-plus) をベースに開発しています。リクエストデータはすべて [Mock.js](https://github.com/nuysoft/Mock) を使用してモックしています。

これらの知識を事前に理解しておくと、本プロジェクトの使用に大いに役立ちます。

**バグ修正や新機能追加の issue や pull request は大歓迎です。**

<p align="center">
  <img width="900" src="https://wpimg.wallstcn.com/a5894c1b-f6af-456e-82df-1151da0839bf.png">
</p>

## Sponsors

Become a sponsor and get your logo on our README on GitHub with a link to your site. [[Become a sponsor]](https://www.patreon.com/panjiachen)

### Akveo
<a href="https://store.akveo.com/products/vue-java-admin-dashboard-spring?utm_campaign=akveo_store-Vue-Vue_demo%2Fgithub&utm_source=vue_admin&utm_medium=referral&utm_content=github_banner"><img width="500px" src="https://raw.githubusercontent.com/PanJiaChen/vue-element-admin-site/master/docs/.vuepress/public/images/vue-java-banner.png" /></a><p>Get Java backend for Vue admin with 20% discount for 39$ use coupon code SWB0RAZPZR1M
</p>

### Flatlogic

<a href="https://flatlogic.com/admin-dashboards?from=vue-element-admin"><img width="150px" src="https://wpimg.wallstcn.com/9c0b719b-5551-4c1e-b776-63994632d94a.png" /></a><p>Admin Dashboard Templates made with Vue, React and Angular.</p>

## 機能一覧

```
- ログイン / ログアウト

- 認証・権限管理
  - ページ権限
  - ディレクティブ権限
  - 権限設定ページ
  - 二段階認証

- 複数環境デプロイ
  - dev
  - sit
  - stage
  - prod

- 共通機能
  - 多言語対応（i18n）
  - 動的テーマ切替
  - 動的サイドバー（多階層ルート対応）
  - 動的パンくずリスト
  - タブビュー（右クリック操作対応）
  - Svg Sprite アイコン
  - Mock データ
  - 全画面表示（Screenfull）
  - レスポンシブサイドバー

- エディター
  - リッチテキストエディター
  - Markdown エディター
  - JSON エディター

- Excel
  - エクスポート
  - アップロード
  - 可視化
  - zip エクスポート

- テーブル
  - ダイナミックテーブル
  - ドラッグアンドドロップテーブル
  - インラインエディットテーブル

- エラーページ
  - 401
  - 404

- コンポーネント
  - アバターアップロード
  - トップに戻る
  - ドラッグダイアログ
  - ドラッグ選択
  - ドラッグ Kanban
  - ドラッグリスト
  - SplitPane
  - Dropzone
  - スティッキー
  - CountTo

- 高度なサンプル
- エラーログ
- ダッシュボード
- ガイドページ
- ECharts
- クリップボード
- Markdown to html
```

## Getting started

```bash
# プロジェクトをクローン
git clone https://github.com/PanJiaChen/vue-element-admin.git

# プロジェクトディレクトリに移動
cd vue-element-admin

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

http://localhost:9527 が自動的に開きます。

## Build

```bash
# 本番環境用ビルド
npm run build

# ステージング環境用ビルド
npm run build:stage
```

## Testing

```bash
# ユニットテストを実行（Vitest）
npm run test:unit

# E2E テストを実行（Playwright）
npm run test:e2e

# UI モードで E2E テストを実行
npm run test:e2e:ui
```

## Advanced

```bash
# リリース環境の効果をプレビュー
npm run preview

# 型チェック
npm run type-check

# コードフォーマットチェックと自動修正
npm run lint
```

詳細は [Documentation](https://panjiachen.github.io/vue-element-admin-site/guide/essentials/deploy.html) を参照してください。

## Changelog

各リリースの詳細は [release notes](https://github.com/PanJiaChen/vue-element-admin/releases) にあります。

## Online Demo

[Preview](https://panjiachen.github.io/vue-element-admin)

## Donate

If you find this project useful, you can buy author a glass of juice :tropical_drink:

![donate](https://wpimg.wallstcn.com/bd273f0d-83a0-4ef2-92e1-9ac8ed3746b9.png)

[Paypal Me](https://www.paypal.me/panfree23)

[Buy me a coffee](https://www.buymeacoffee.com/Pan)

## Browsers support

モダンなブラウザ（Vue 3 は Internet Explorer をサポートしていません）。

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="Edge" width="24px" height="24px" />](https://godban.github.io/browsers-support-badges/)</br>Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](https://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](https://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](https://godban.github.io/browsers-support-badges/)</br>Safari |
| --------- | --------- | --------- | --------- |
| last 2 versions | last 2 versions | last 2 versions | last 2 versions |

## License

[MIT](https://github.com/PanJiaChen/vue-element-admin/blob/master/LICENSE)

Copyright (c) 2017-present PanJiaChen
