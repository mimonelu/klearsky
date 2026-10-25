# AGENTS.md

Klearsky は AT Protocol（Bluesky）向けの Web クライアント（Vue 3 + TypeScript + Vite の SPA）。
対外向けの説明は `README.md` / `README_JA.md` を参照。

## コマンド

| コマンド | 用途 |
|---|---|
| `npm run dev` | 開発サーバー（http://localhost:5173/） |
| `npm run type-check` | 型チェック（`vue-tsc --noEmit`）。**変更後は必ず実行** |
| `npm run build` | 型チェック＋本番ビルド（出力先は `docs/`） |
| `npm run lint` | ESLint（`--fix` 付きでファイルを書き換える点に注意） |

- Node.js v22.16.0
- 自動テストはない。検証は型チェックと実機確認で行う

## ブランチ・コミット

- PR のベースブランチは `staging`。`main` への push で GitHub Pages にデプロイされる
- リリース作業は `release/vX.Y.Z`、緊急修正は `hotfix/vX.Y.Z` ブランチ
- コミットはユーザーに明示的に依頼されたときのみ行う
- コミットメッセージは日本語 1 行。`Co-Authored-By` は付けない
- イシュー対応は番号を先頭に付ける（例: `#52 動画再生開始時に最高画質を選択するよう変更`）

## ディレクトリ

| パス | 内容 |
|---|---|
| `src/composables/atp-wrapper/` | AT Protocol API ラッパー。`create/` `delete/` `fetch/` `update/` `chat/` `session/` に 1 関数 1 ファイルで配置し、`index.ts` でクラスに束ねる |
| `src/composables/main-state.ts` | グローバル状態 `state`（`reactive`）。コンポーネントからは `inject("state")` で取得 |
| `src/composables/main-state/` | 状態のサブマネージャー（`MySession`, `MyChat`, `MyFeeds` 等のクラス） |
| `src/composables/main-view/` | `MainView.vue` のロジック（認証・起動・ナビゲーション等） |
| `src/composables/util/` | 汎用ユーティリティ。`Util` として集約 |
| `src/components/` | UI コンポーネント。新規機能は `components/next/<機能名>/` に置く |
| `src/views/` | ページ（ルーティングは `src/router/index.ts`、hash history） |
| `src/@types/` | アンビエント型定義（import 不要のグローバル型） |
| `src/translations/` | i18n（`ja`, `en`, `fr`, `ko`, `de`） |
| `src/consts/` | 定数・設定値の JSON |
| `src/worker/` | SharedWorker（タブ間セッション同期） |
| `dev-docs/` | 開発ドキュメント（下記索引） |
| `docs/` | **ビルド出力先（gitignore 対象）。ドキュメントを置かないこと** |

## コーディング規約

- 既存コードのスタイルに合わせる: インデント 2 スペース、ダブルクォート、セミコロンなし、関数名と `(` の間にスペース（`function foo ()`）
- Vue は `<script lang="ts" setup>`。`$t` と `state` は `inject` で取得する
- グローバル型は `src/@types/` に置き、型名に `TT` / `TI` プレフィックスを付ける
- `.d.ts` では top-level `import` を使わず、`import("@atproto/api").Foo` のようにインラインで参照する（top-level import はファイルをモジュール化してグローバル型が壊れる）
- atp-wrapper の関数は第 1 引数に `this: TIAtpWrapper` を取る。エラーは throw せず `Error` を返す
- `main-state.ts` には状態の定義と初期化以外を書かない。ロジックは `main-state/` や `util/` に切り出す
- 文言を追加するときは全言語の翻訳ファイルにキーを追加する。訳文は短く（"This is" 等の冗長表現を避ける）

## ドキュメント索引（`dev-docs/`）

作業対象に関係するものを着手前に読むこと。

- [features/oauth.md](dev-docs/features/oauth.md) — OAuth ログイン・パスワード認証のトークン更新・セッション管理・マルチアカウント
- [features/chat.md](dev-docs/features/chat.md) — チャットの構成、`getLog` による新着監視、カーソル管理
- [features/post-draft.md](dev-docs/features/post-draft.md) — ポスト下書きと IndexedDB メディアストア
- [features/profile-links.md](dev-docs/features/profile-links.md) — プロフィールリンクの保存手順、死にレコード、favicon とタイトル候補の取得。プロフィール更新処理を変更する時にも読む
- [features/search.md](dev-docs/features/search.md) — 投稿検索の現状実装と searchPostsV2 移行の検討
- [features/stale-response.md](dev-docs/features/stale-response.md) — 遷移後に届いた古いレスポンスの破棄（世代番号）。非同期で画面の状態を書き換える処理を追加・変更する時に読む

## ドキュメントの更新ルール

- 設計判断や注意点など、コードから読み取れない知見は `dev-docs/` に残す
- 機能ごとの実装メモは `features/` に置き、本ファイルの索引に追記する
- 外部仕様の調査結果そのものは置かず、Klearsky に関わる判断や注意点だけを残す
- 本ファイルには全作業で必要な情報だけを書き、詳細は `dev-docs/` に分離する
