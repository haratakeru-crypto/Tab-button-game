# Office UI マスター - URL一覧

## ローカル環境

開発サーバーで動作するローカル環境用URLです。

### 科目選択画面

```
http://localhost:3000/
```

**説明:**
- Word、Excel、PowerPointから科目を選択できます
- 選択後、各科目のタブ探しゲームに遷移します

---

### Word

#### タブ探しゲーム（通常モード）

```
http://localhost:3000/?app=word
```

#### タブ探しゲーム（デバッグモード）

```
http://localhost:3000/?app=word&debug=true
```

#### ボタン探しゲーム（通常モード）

```
http://localhost:3000/?app=word&mode=button
```

#### ボタン探しゲーム（デバッグモード）

```
http://localhost:3000/?app=word&mode=button&debug=true
```

---

### Excel

#### タブ探しゲーム（通常モード）

```
http://localhost:3000/?app=excel
```

#### タブ探しゲーム（デバッグモード）

```
http://localhost:3000/?app=excel&debug=true
```

#### ボタン探しゲーム（通常モード）

```
http://localhost:3000/?app=excel&mode=button
```

#### ボタン探しゲーム（デバッグモード）

```
http://localhost:3000/?app=excel&mode=button&debug=true
```

---

### PowerPoint

#### タブ探しゲーム（通常モード）

```
http://localhost:3000/?app=powerpoint
```

#### タブ探しゲーム（デバッグモード）

```
http://localhost:3000/?app=powerpoint&debug=true
```

#### ボタン探しゲーム（通常モード）

```
http://localhost:3000/?app=powerpoint&mode=button
```

#### ボタン探しゲーム（デバッグモード）

```
http://localhost:3000/?app=powerpoint&mode=button&debug=true
```

---

## デバッグモードの機能

- クリック座標の表示（x, yのパーセンテージ）
- ターゲットゾーンの可視化（青色の枠）
- 位置調整（top, leftの数値入力）
- サイズ調整（width, heightのスライダーと数値入力）
- ターゲットゾーンのJSON形式でのコピー
- ターゲットゾーンの保存（修正ボタン）
- 解説文の編集・保存（ボタン探しゲームのみ）

---

## 一般公開

Netlifyにデプロイされた一般公開用URLです。

### 科目選択画面

```
https://keen-toffee-d3e027.netlify.app/
```

---

### Word

#### タブ探しゲーム

```
https://keen-toffee-d3e027.netlify.app/?app=word
```

#### ボタン探しゲーム

```
https://keen-toffee-d3e027.netlify.app/?app=word&mode=button
```

---

### Excel

#### タブ探しゲーム

```
https://keen-toffee-d3e027.netlify.app/?app=excel
```

#### ボタン探しゲーム

```
https://keen-toffee-d3e027.netlify.app/?app=excel&mode=button
```

---

### PowerPoint

#### タブ探しゲーム

```
https://keen-toffee-d3e027.netlify.app/?app=powerpoint
```

#### ボタン探しゲーム

```
https://keen-toffee-d3e027.netlify.app/?app=powerpoint&mode=button
```

**説明:**
- インターネット上で誰でもアクセス可能です
- デバッグモードでのターゲットゾーン修正機能は本番環境では無効化されています

---

## 使用方法

### 開発サーバーの起動

```bash
npm run dev
```

または

```bash
yarn dev
```

### アクセス方法

1. ブラウザで上記のURLを開く
2. デバッグモードを使用する場合は、`?debug=true` パラメータを追加する
3. ボタン探しゲームを使用する場合は、`?mode=button` パラメータを追加する
4. 開発サーバーが起動していることを確認（通常は `http://localhost:3000`）

---

## 注意事項

- デバッグモードは開発環境でのみ使用してください
- ターゲットゾーンの修正は `questions.json` に直接反映されます
- 修正後はページが自動的に再読み込みされます