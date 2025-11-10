# ai-seo-homepage

このリポジトリのローカルでの実行方法だけを短くまとめています。

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

以上。ローカルでの実行に関する内容のみを記載しています。必要なら、GitHub への公開や Vercel デプロイの手順も別途追加できます。
<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1Z4nQFoRx7zb3cXZtLfoQuD8Tf5WyQTkN

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
