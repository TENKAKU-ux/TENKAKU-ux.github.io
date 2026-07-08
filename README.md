# TENKAKU-ux Portfolio

AI を使って作ったアプリや実験をまとめるポートフォリオサイトです。

## Build

```bash
node scripts/build.mjs
```

## Preview

```bash
python3 -m http.server 8000
```

ブラウザで `http://localhost:8000` を開きます。

## Structure

- `data/projects.json`: 公開用 allowlist データ（`en` オーバーレイで英語も同居）
- `data/links.json`: リンク集（`en` オーバーレイ同居）
- `data/TRANSLATION.md`: **英語版のフォーマット正本**。作品・リンクを足すたびに `en` を揃える手順
- `scripts/build.mjs`: 静的 HTML 生成（日本語＝`/`・英語＝`/en/` を1データから生成・`STR` に画面の枠文言）
- `assets/site.css`: 共通スタイル
- `assets/projects/`: 公開確認済みスクショ（日英共通）
- `index.html`, `projects/`, `links/`, `about/`: 日本語の生成済み HTML
- `en/`: 英語の生成済み HTML（同じ構成）
