# Gitリポジトリの初期化とコミット用スクリプト

Write-Host "Gitリポジトリを初期化しています..." -ForegroundColor Green

# 現在のディレクトリに移動
Set-Location $PSScriptRoot

# Gitリポジトリの初期化
if (-not (Test-Path .git)) {
    git init
    Write-Host "✓ Gitリポジトリを初期化しました" -ForegroundColor Green
} else {
    Write-Host "✓ Gitリポジトリは既に初期化されています" -ForegroundColor Yellow
}

# すべてのファイルをステージング
Write-Host "`nファイルをステージングしています..." -ForegroundColor Green
git add .

# コミット
Write-Host "`nコミットを作成しています..." -ForegroundColor Green
git commit -m "Initial commit: Wordタブ選択ゲーム"

Write-Host "`n✓ Gitリポジトリの準備が完了しました！" -ForegroundColor Green
Write-Host "`n次のステップ:" -ForegroundColor Cyan
Write-Host "1. GitHubでリポジトリを作成してください"
Write-Host "2. 以下のコマンドでGitHubにプッシュしてください:" -ForegroundColor Yellow
Write-Host "   git remote add origin https://github.com/あなたのユーザー名/tabgame.git"
Write-Host "   git branch -M main"
Write-Host "   git push -u origin main"
Write-Host "`n詳細は DEPLOY.md を参照してください。" -ForegroundColor Cyan
