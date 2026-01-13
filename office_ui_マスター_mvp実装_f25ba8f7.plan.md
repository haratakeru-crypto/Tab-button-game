---
name: Office UI マスター MVP実装
overview: Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/uiを使用して、Microsoft Officeのタブやボタンを探す学習ゲーム「Office UI マスター」のMVPを実装します。Word編を中心に、将来的な拡張性を考慮した設計にします。
todos:
  - id: setup-nextjs
    content: Next.jsプロジェクトの初期化（TypeScript、Tailwind CSS、shadcn/ui設定）
    status: pending
  - id: define-types
    content: 型定義ファイル（types/question.ts）の作成
    status: pending
  - id: create-questions
    content: 問題データ（data/questions.json）の作成（Word編のサンプル問題3-5問）
    status: pending
  - id: implement-utils
    content: ユーティリティ関数（座標変換、判定ロジック）の実装
    status: pending
  - id: implement-game-area
    content: GameAreaコンポーネントの実装（画像表示、クリック処理、正解エリア表示）
    status: pending
  - id: implement-feedback
    content: FeedbackAreaコンポーネントの実装（メッセージ表示、次へボタン）
    status: pending
  - id: implement-main-page
    content: メインページ（app/page.tsx）の実装（ヘッダー、スコア表示、ゲーム統合）
    status: pending
  - id: add-debug-mode
    content: デバッグモード機能の実装（クリック座標のコンソール出力）
    status: pending
  - id: add-animations
    content: アニメーション効果の追加（正解エリアの赤枠、フィードバックメッセージ）
    status: pending
  - id: responsive-styling
    content: レスポンシブ対応のスタイリング調整
    status: pending
---

# Office UI マスター MVP実装計画

## プロジェクト構成

### 1. プロジェクト初期化

- Next.js 14+ (App Router) プロジェクトのセットアップ
- TypeScript設定
- Tailwind CSS設定
- shadcn/uiの初期化と必要なコンポーネントのインストール（Button, Card等）

### 2. 型定義とデータ構造

- `types/question.ts`: Question型とTargetZone型の定義
- `data/questions.json`: Word編の問題データ（3-5問程度のサンプル）
- 座標はパーセンテージ（top, left, width, height）で管理

### 3. 主要コンポーネント実装

#### `app/page.tsx` (メインページ)

- ヘッダー（タイトル、スコア表示）
- ゲームコンポーネントの呼び出し

#### `components/GameArea.tsx`

- 問題文の表示
- 画像表示とクリックイベント処理
- 正解エリアの赤枠表示（アニメーション付き）
- クリック座標の判定ロジック（パーセンテージ変換）

#### `components/FeedbackArea.tsx`

- 正解/不正解メッセージ表示
- 「次へ」ボタン
- アニメーション効果

#### `components/ImageClickHandler.tsx` (必要に応じて)

- 画像上のクリック座標取得
- パーセンテージ変換ロジック
- デバッグモード対応

### 4. デバッグモード機能

- 環境変数またはURLパラメータで有効化
- クリック座標をコンソールに出力（パーセンテージ形式）
- 問題作成時の座標特定を支援

### 5. スタイリングとUX

- Tailwind CSSでレスポンシブ対応
- 画像は `max-w-full h-auto` で適切にスケール
- 正解エリアの赤枠アニメーション（fade-in + scale）
- フィードバックメッセージのアニメーション

### 6. ゲームロジック

- 問題の順次表示
- スコア管理（正解数/総問題数）
- 全問題終了時の完了画面

## 実装ファイル一覧

- `package.json` - 依存関係
- `tsconfig.json` - TypeScript設定
- `tailwind.config.ts` - Tailwind設定
- `app/layout.tsx` - ルートレイアウト
- `app/page.tsx` - メインページ
- `app/globals.css` - グローバルスタイル
- `types/question.ts` - 型定義
- `data/questions.json` - 問題データ
- `components/GameArea.tsx` - ゲームエリア
- `components/FeedbackArea.tsx` - フィードバックエリア
- `lib/utils.ts` - ユーティリティ関数（座標変換等）
- `hooks/useGame.ts` - ゲーム状態管理（必要に応じて）

## 技術的な実装ポイント

1. **座標判定**: 画像の実際のサイズを取得し、クリック座標をパーセンテージに変換して判定
2. **レスポンシブ**: 画像のサイズが変わっても正解エリアの位置が正確に表示されるよう、パーセンテージベースで計算
3. **拡張性**: `appType`フィールドで将来的にExcel/PowerPointに対応可能な設計
4. **デバッグモード**: `?debug=true`で有効化し、クリック座標をコンソールに出力

## プレースホルダー画像

- 初期実装では `https://placehold.co/1200x800` などのプレースホルダー画像を使用
- 後で実際のWordスクリーンショットに置き換え可能