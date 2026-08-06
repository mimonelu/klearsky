# app.bsky.feed.searchPostsV2 仕様メモ

- 参照元: https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/feed/searchPostsV2.json
- 追加日: 2026-06-23（PR #5114）
- 既存の `app.bsky.feed.searchPosts`（V1）の後継エンドポイント

## V1との主な違い

| 観点 | V1 (searchPosts) | V2 (searchPostsV2) |
|---|---|---|
| 必須パラメータ | `q` 必須 | クエリ or フィルタのいずれか必須 |
| クエリ引数名 | `q` | `query` |
| 単数→複数化 | `author`, `mentions`, `lang`, `domain`, `url`, `tag` | `authors`, `mentions`, `languages`, `domains`, `urls`, `hashtags` すべて配列 |
| 除外フィルタ | なし | `excludeAuthors`, `excludeMentions`, `excludeLanguages`, `excludeDomains`, `excludeUrls`, `excludeHashtags`, `excludeEmbeddedAtUris` |
| メディアフィルタ | なし | `hasMedia`, `hasVideo` |
| スレッド系 | なし | `replyParentUri`, `threadRootUri`, `excludeReplies`, `repliesOnly`（相互排他） |
| フォロイング限定 | なし | `following` |
| 全期間検索 | なし | `allTime`（デフォルトは最近の投稿ウィンドウのみ） |
| 言語ヒント | なし | `queryLanguage`（ja/zh/ko/th/ar） |
| AT URI埋め込み | なし | `embeddedAtUris` |
| ソート | `top` / `latest`（デフォルト`latest`） | `top` / `recent`（デフォルト`top`） |
| 認証 | 任意 | **必須**（未ログインは401/AuthMissing） |

## リクエストパラメータ一覧

| パラメータ名 | 型 | デフォルト | 説明 |
|---|---|---|---|
| query | string | - | 検索クエリ文字列（V1の`q`から改名）。query または少なくとも1つのフィルタが必須 |
| sort | enum | `top` | `recent`(最新順) / `top`(検索ランキング) |
| cursor | string | - | ページネーション用カーソル |
| limit | integer (1-100) | 25 | 返却結果数の最大値 |
| authors | array[at-identifier] | - | これらの著者の投稿を含める |
| mentions | array[at-identifier] | - | これらのアカウントにメンションされた投稿を含める |
| domains | array[string] | - | これらのドメインにリンクする投稿を含める |
| urls | array[uri] | - | これらのURLにリンクする投稿を含める |
| embeddedAtUris | array[at-uri] | - | これらのAT URIを埋め込む投稿を含める |
| hashtags | array[string] | - | ハッシュタグ（#記号なし、maxLength 640, maxGraphemes 64） |
| excludeAuthors | array[at-identifier] | - | これらの著者の投稿を除外 |
| excludeMentions | array[at-identifier] | - | これらのアカウントへのメンション投稿を除外 |
| excludeDomains | array[string] | - | これらのドメインへのリンク投稿を除外 |
| excludeUrls | array[uri] | - | これらのURLへのリンク投稿を除外 |
| excludeEmbeddedAtUris | array[at-uri] | - | これらのAT URIを埋め込む投稿を除外 |
| excludeHashtags | array[string] | - | これらのハッシュタグの投稿を除外 |
| since | string (ISO date/datetime) | - | この時刻以降にインデックスされた投稿（`sortAt`基準、`createdAt`ではない） |
| until | string (ISO date/datetime) | 現在時刻 | この時刻より前にインデックスされた投稿（`sortAt`基準） |
| allTime | boolean | false | フルインデックスから検索。falseだと最近の投稿ウィンドウのみ |
| languages | array[language] | - | 含める言語コード |
| excludeLanguages | array[language] | - | 除外する言語コード |
| hasMedia | boolean | - | メディア付き投稿のみ |
| hasVideo | boolean | - | ビデオ付き投稿のみ |
| replyParentUri | at-uri | - | この投稿への直接返信のみ |
| threadRootUri | at-uri | - | このスレッドルート配下の投稿のみ |
| excludeReplies | boolean | - | 返信を除外（repliesOnlyと相互排他） |
| repliesOnly | boolean | - | 返信のみ（excludeRepliesと相互排他） |
| following | boolean | - | ビューアーがフォロー中のアカウントの投稿のみ |
| queryLanguage | enum | 自動検出 | クエリテキストの言語ヒント: `ja`/`zh`/`ko`/`th`/`ar` |

## レスポンス構造

```json
{
  "cursor": "string (optional)",
  "hitsTotal": "integer (optional)",
  "posts": ["app.bsky.feed.defs#postView", "..."],
  "detectedQueryLanguages": ["ja", "zh", "ko", "th", "ar"]
}
```

- `posts`: `postView` 配列。構造自体はV1と同じ
- `hitsTotal`: マッチ件数の推定値（丸め・切り詰めの可能性あり）
- `detectedQueryLanguages`: クエリから検出された言語（CJK/Thai/Arabicのみ、それ以外は空/省略）

## エラー

- `BadQueryString`: クエリ文字列が無効な場合

## 実装上の注意点

- `since`/`until` は投稿の `sortAt` タイムスタンプ基準（`createdAt` ではない点に注意）
- `repliesOnly` と `excludeReplies` はレキシコン上の相互排他制約だが、サーバー側ハンドラでの検証は未実装との指摘がPRレビューにあり
- 認証必須化はブレーキングチェンジ。ログアウト状態のクライアントは401を受け取る（V1はオプション認証だった）

## 関連PR

| PR | 日時 | 内容 |
|---|---|---|
| #5114 | 2026-06-23 | 初版追加。`embed_uris`→`embedded_at_uris`リネーム、`detectedQueryLanguages`追加 |
| #5127 | 2026-06-23 | デフォルトソートを`top`に変更（検索バックエンドが未指定を拒否するため） |
| #5143 | 2026-06-24 | V1検索と日付処理を統一 |
| #5146 | 2026-06-24 | 複数言語フィルタリング対応（単数`language`→`languages`+`excludeLanguages`） |

## klearskyへの統合について（未着手）

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
