# Tab Game - Wordタブ選択ゲーム

Wordのリボンタブを選択する練習アプリケーションです。

## 機能

- Wordのリボンタブをクリックして選択する練習
- デバッグモードでターゲットゾーンの調整が可能
- リアルタイムで正誤判定

## 開発環境のセットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## Vercelへのデプロイ

### 方法1: Vercel CLIを使用（推奨）

1. **Vercel CLIのインストール**
   ```bash
   npm i -g vercel
   ```

2. **Vercelにログイン**
   ```bash
   vercel login
   ```

3. **デプロイ**
   ```bash
   vercel
   ```
   
   初回デプロイ時は以下の質問に答えてください：
   - Set up and deploy? → **Y**
   - Which scope? → あなたのアカウントを選択
   - Link to existing project? → **N**（新規プロジェクトの場合）
   - Project name? → プロジェクト名を入力（例: `tabgame`）
   - Directory? → **./**（そのままEnter）
   - Override settings? → **N**

4. **本番環境へのデプロイ**
   ```bash
   vercel --prod
   ```

### 方法2: GitHub経由でデプロイ

1. **GitHubにリポジトリをプッシュ**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <あなたのGitHubリポジトリURL>
   git push -u origin main
   ```

2. **Vercelでプロジェクトを作成**
   - [Vercel](https://vercel.com) にアクセス
   - 「Sign Up」または「Log In」でアカウント作成（GitHubアカウントでログイン可能）
   - 「Add New...」→「Project」を選択
   - GitHubリポジトリをインポート
   - プロジェクト設定：
     - Framework Preset: **Next.js**
     - Root Directory: **./**（そのまま）
     - Build Command: `npm run build`（自動検出される）
     - Output Directory: `.next`（自動検出される）
   - 「Deploy」をクリック

3. **自動デプロイ**
   - GitHubにプッシュするたびに自動でデプロイされます
   - デプロイが完了すると、VercelからURLが発行されます

## 環境変数

現在、環境変数は不要です。必要に応じて `.env.local` ファイルを作成してください。

## ビルド

```bash
npm run build
```

## 本番環境での注意事項

- デバッグモードのAPI（`/api/questions` のPUTメソッド）は本番環境では無効化されています
- 画像ファイルは `public/Word画像/` ディレクトリに配置してください

## ライセンス

MIT
