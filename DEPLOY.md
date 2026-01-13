# Vercelデプロイ手順

## ステップ1: Gitリポジトリの初期化とコミット

PowerShellで以下のコマンドを実行してください：

```powershell
cd c:\Users\kouza\source\tabgame

# Gitリポジトリの初期化
git init

# すべてのファイルをステージング
git add .

# 初回コミット
git commit -m "Initial commit: Wordタブ選択ゲーム"
```

## ステップ2: GitHubリポジトリの作成

1. [GitHub](https://github.com) にアクセスしてログイン
2. 右上の「+」→「New repository」をクリック
3. リポジトリ情報を入力：
   - Repository name: `tabgame`（または任意の名前）
   - Description: `Wordタブ選択ゲーム`
   - Public または Private を選択
   - **「Initialize this repository with a README」のチェックは外す**（既にREADME.mdがあるため）
4. 「Create repository」をクリック

## ステップ3: GitHubにプッシュ

GitHubでリポジトリを作成した後、表示されるURLを使用して以下を実行：

```powershell
# リモートリポジトリを追加（URLはGitHubで表示されたものを使用）
git remote add origin https://github.com/あなたのユーザー名/tabgame.git

# ブランチ名をmainに変更
git branch -M main

# GitHubにプッシュ
git push -u origin main
```

**注意**: `あなたのユーザー名` の部分は、実際のGitHubユーザー名に置き換えてください。

## ステップ4: Vercelでデプロイ

1. [Vercel](https://vercel.com) にアクセス
2. 「Sign Up」または「Log In」をクリック
   - GitHubアカウントでログインすることを推奨
3. 「Add New...」→「Project」を選択
4. 「Import Git Repository」で、作成したGitHubリポジトリを選択
5. プロジェクト設定を確認：
   - Framework Preset: **Next.js**（自動検出される）
   - Root Directory: **./**（そのまま）
   - Build Command: `npm run build`（自動検出される）
   - Output Directory: `.next`（自動検出される）
   - Install Command: `npm install`（自動検出される）
6. 「Deploy」をクリック
7. デプロイが完了すると、URLが表示されます（例: `https://tabgame.vercel.app`）

## ステップ5: 今後の更新

コードを更新したら、以下のコマンドでGitHubにプッシュすると、自動的にVercelでも再デプロイされます：

```powershell
git add .
git commit -m "更新内容の説明"
git push
```

## トラブルシューティング

### 認証エラーが発生する場合

GitHubへのプッシュで認証エラーが出る場合は、Personal Access Tokenを使用してください：

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 「Generate new token (classic)」をクリック
3. スコープで `repo` にチェック
4. トークンを生成してコピー
5. パスワードの代わりにトークンを使用

### ビルドエラーが発生する場合

- Vercelのデプロイログを確認
- ローカルで `npm run build` が成功するか確認
- 必要に応じて `package.json` の依存関係を確認
