# ai-seo-homepage

## 前提
- Node.js（LTS 推奨）
- npm（または pnpm/yarn）

## セットアップ手順（ローカル）

1. 依存をインストール

```zsh
npm install
```

2. 環境変数

開発に必要なシークレット（例: `GEMINI_API_KEY` 等）がある場合はプロジェクトルートに `.env.local` を作成して設定してください。
`.env.local` はリポジトリにコミットしないでください。既に `.gitignore` に含まれていることを確認してください。

```text
# 例: .env.local
GEMINI_API_KEY=your_key_here
```

3. 開発サーバを起動

```zsh
npm run dev
```

4. 本番ビルドを作成してローカルで確認

```zsh
npm run build
npm run preview
# preview は通常 http://localhost:5173 などで確認できます
```

## 注意
- `.env.local` などの秘密情報は絶対に公開リポジトリに含めないでください。公開する場合は、環境変数はホスティング側（Vercel 等）の管理画面で設定してください。
- ビルド成果物は `dist` フォルダに出力されます。
