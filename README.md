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

- `data/projects.json`: 公開用 allowlist データ
- `data/links.json`: リンク集
- `scripts/build.mjs`: 静的 HTML 生成
- `assets/site.css`: 共通スタイル
- `assets/projects/`: 公開確認済みスクショ
- `index.html`, `projects/`, `links/`, `about/`: GitHub Pages で配信する生成済み HTML
