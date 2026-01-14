## 目的
- 各 Office のタブ探し／ボタン探しアプリをスマホ・PC で使えるようにする
- 現状: Word 版タブ探しゲームはローカルで動作済み。ボタン探しゲームは作成途中。

## 現在のデプロイ課題
- Netlify で公開すると「ページが表示されません」となる
- 最新のビルドログでは、`@netlify/plugin-nextjs` が publish ディレクトリをプロジェクトルートと同一と判定し、エラーになっている
  - Resolved config に `publish: /opt/build/repo (publishOrigin: ui)` がセットされているのが原因

## 対応方針（優先）
1. **Netlify のダッシュボードで Publish Directory を空にする**  
   - Site settings → Build & deploy → Build settings → Publish directory を空 or `.netlify` へ変更  
   - `netlify.toml` では `publish = ".netlify"` を指定済み
2. `npm run build` がローカルで成功することを確認（依存関係は `npm install` 済み）
3. 再デプロイしてステータスを確認  
   - 成功すれば `https://keen-toffee-d3e027.netlify.app/` で表示できる

## 補足
- もし引き続き 404 や公開失敗になる場合:
  - ダッシュボードの Publish directory 設定が上書きされていないか再確認
  - `netlify.toml` に余計な publish 設定が無いか確認（現在は `.netlify` を指定）
  - ビルドログを共有してもらい原因を切り分ける
