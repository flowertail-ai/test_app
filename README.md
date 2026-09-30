# test_app

Next.js で作ったシンプルな ToDo アプリです。

## 機能

- タスクの追加(Enter キーまたは「追加」ボタン)
- 完了チェック(チェックで取り消し線表示)
- 削除

データはブラウザの `localStorage` に保存されます(端末・ブラウザごとに独立)。

## 技術構成

- Next.js(App Router)/ React / TypeScript
- Tailwind CSS v4

## ローカルでの起動

事前に [Node.js](https://nodejs.org/)(LTS 版)をインストールしてください。

```bash
npm install
npm run dev
```

ブラウザで http://localhost:3000 を開きます。

## VS Code での簡易プレビュー(Node.js 不要)

`preview/index.html` は、アプリの見た目と動作を再現した静的 HTML です。

1. VS Code に拡張機能「Live Preview」(Microsoft)をインストール
2. エクスプローラーで `preview/index.html` を右クリック →「Show Preview」

※ `app/page.tsx` を手作業で再現したものなので、アプリを変更しても自動では反映されません。

## Vercel へのデプロイ

1. このリポジトリを GitHub に push する
2. [Vercel](https://vercel.com/) にログインし「Add New… → Project」からリポジトリを Import
3. Framework Preset が「Next.js」になっていることを確認して「Deploy」

追加の設定や環境変数は不要です。
