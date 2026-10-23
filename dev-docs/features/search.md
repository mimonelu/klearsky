# 投稿検索（Klearsky 実装）

> API 仕様は [searchPostsV2 仕様メモ](../atproto/search-posts-v2.md) を参照

## searchPostsV2 への移行（未着手）

検索UIへの統合は未実施。着手時に検討すべき点:
- 認証必須化への対応（未ログイン時のフォールバック）
- 既存の検索パラメータ（単数）からV2（複数配列）へのUI変更
- 新規フィルタ（`hasMedia`, `hasVideo`, `following`, `allTime`など）をUIにどこまで露出するか

## 現状のklearsky検索実装（V1ベース、2026-07-16調査）

- `src/composables/atp-wrapper/fetch/fetch-post-search.ts`: `searchPosts`（V1）を呼ぶ唯一の低レベル実装。`TIPostSearch`（`text`, `sort`, `lang`, `author`, `to`, `mentions`, `domain`, `since`, `until`）から `lang:`/`from:`/`to:`/`mentions:`/`domain:`/`since:`/`until:` プレフィックス付きの `q` 文字列を組み立てる方式
- `src/composables/atp-wrapper/index.ts`（92, 322行目）: `fetchPostSearch` としてラップ
- `src/composables/main-state.ts`（1962行目付近）: `fetchSearchPosts(cursor?)`、`currentSearchPostCursor` 等の状態管理
- `src/components/popups/AdvancedSearchPopup.vue`: 詳細検索フォームUI（キーワード・ソート・言語・著者・メンション・ドメイン・日付範囲）。`to`(宛先)フィルタは`mentions`と挙動が同じになる不具合でコメントアウト・未使用（TODOあり）
- `src/@types/concepts/search.d.ts`: `TIPostSearch` 型定義
- `src/views/main/search/PostSearchView.vue`: 検索結果一覧・カーソルページネーション
- `src/views/main/home/TrendingView.vue`（72行目）: トレンド関連投稿検索でも `fetchPostSearch` を直接使用

## ユーザーからの機能要望（2026-07-16受領、未実装）

要望: 「いいね数/リポスト数の最小値でのフィルタ」「返信の含む/除外」「メディアの含む/除外」を検索オプションに追加してほしい

対応可否の調査結果:

| 要望 | 対応可否 | 理由 |
|---|---|---|
| いいね数/リポスト数の最小値 | ❌ 不可 | `searchPosts`(V1)・`searchPostsV2` いずれにも該当パラメータが存在しない。API側の対応が必要 |
| 返信の含む/除外 | ✅ 可能 | V2の `excludeReplies`/`repliesOnly`（相互排他） |
| メディアの含む/除外 | ✅ 可能 | V2の `hasMedia` |

返信・メディアフィルタを使うには、V1からV2への移行が必要（V1にはパラメータ自体が存在しないため）。移行時の変更範囲:
- `fetch-post-search.ts` を `searchPostsV2` ベースに書き換え（`q`文字列組み立てから構造化パラメータへ）
- `TIPostSearch` 型に `excludeReplies`/`repliesOnly`/`hasMedia` を追加
- `AdvancedSearchPopup.vue` にUI追加
- 既存の著者/メンション/ドメイン/日付/言語パラメータも単数→配列(V2形式)へ変更が必要
- V2は認証必須（V1はオプション）という差異への対応も必要

**ステータス: 2026-07-16時点でユーザー判断により実装保留。設計検討のみ完了。**
