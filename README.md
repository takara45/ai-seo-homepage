<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This repository contains everything you need to run the app locally and publish it.

View your app in AI Studio: https://ai.studio/apps/drive/1Z4nQFoRx7zb3cXZtLfoQuD8Tf5WyQTkN

## Run locally

**Prerequisites:** Node.js

1. Install dependencies:

```zsh
npm install
```

2. Set the `GEMINI_API_KEY` in `.env.local` to your Gemini API key (do NOT commit `.env.local`).

3. Run the app for development:

```zsh
npm run dev
```

4. Build and preview production bundle locally:

```zsh
npm run build
npm run preview
# preview typically serves at http://localhost:5173
```

---

## Publish to GitHub and Deploy to Vercel (CLI)

以下は CLI を使った最短手順です。すべてターミナルで実行します。

前提:
- GitHub アカウント
- `gh` (GitHub CLI) がインストール・ログイン済み: `gh auth login`
- Vercel アカウント
- `vercel` CLI がインストール・ログイン済み（任意だが推奨）: `npm i -g vercel` と `vercel login`

1) 依存をインストール（未実行の場合）

```zsh
npm install
```

2) git 初期化と最初のコミット（まだ初期化していない場合）

```zsh
git init
git add .
git commit -m "Initial commit"
git branch -M main
```

3) GitHub にリポジトリを作成して push（`gh` CLI を利用）

```zsh
# ユーザー名はあなたの GitHub ユーザー名に置き換えてください
gh repo create hiroshimatakara/ai-seo-homepage --public --source=. --remote=origin --push
```

もし `gh` が使えない場合は、GitHub のウェブ UI で `ai-seo-homepage` を作成し、以下を実行します:

```zsh
# HTTPS の例
git remote add origin https://github.com/YOUR_USERNAME/ai-seo-homepage.git
git push -u origin main
```

4) Vercel にデプロイ（CLI または Web UI）

CLI を使う場合:

```zsh
npm i -g vercel   # 初回のみ
vercel login
vercel              # 対話で設定して初回デプロイ
vercel --prod       # 本番へデプロイ
```

Vercel の設定で Build Command は `npm run build`、Output Directory は `dist` を指定してください。

5) 環境変数の設定（重要）

`.env.local` にある秘密（例: `GEMINI_API_KEY`）はリポジトリにコミットしないでください。Vercel のダッシュボードで環境変数を追加してください。

---

もし私の方で次の作業を行ってほしい場合は指定してください:
- `gh repo create` 用のスクリプトをワークスペースに追加（ユーザーが実行するだけのシェルスクリプト）
- Vercel 用の設定ファイルやデプロイ用ドキュメントをさらに整備
- GitHub に push する前のチェック（.gitignore の確認など）

---

Happy coding!
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
