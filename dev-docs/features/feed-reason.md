# フィードの `reason`（リポスト・ピン留め）

`feedViewPost.reason` は `app.bsky.feed.defs#reasonRepost` と `app.bsky.feed.defs#reasonPin` のユニオン。以前は `reason` があればリポストとみなして `reason.by` を参照していたため、ピン留めポストを含むカスタムフィードで例外が発生し、フィードの取得自体が失敗していた（#89）。

## `reasonPin` が返る条件

- フィードジェネレーターがスケルトンで `skeletonReasonPin` を返すと、AppView の `getFeed` が `reasonPin` に変換して返す。中身は `$type` のみで `by` や `indexedAt` を持たない
- `getAuthorFeed` の `includePins` でも返るが、Klearsky は未使用（固定ポストはプロフィールの `pinnedPost` から別途取得している）

## 型と格納先

| 場所 | 型 | 内容 |
|---|---|---|
| `TTFeed.reason` | `TTReason`（`TTReasonRepost \| TTReasonPin`） | API の応答のまま |
| `TTPost.__custom.reason` | `TTReasonRepost` | `sanitize-posts-or-feeds.ts` でリポストのみ格納する |

- `TTFeed.reason` から `by` を参照するには `$type` での絞り込みが必要になり、型チェックで漏れを検出できる
- `__custom.reason` はリポストに限定しているため、`Post.vue` 等の「`__custom.reason` があればリポスト」という判定はそのままでよい

## 注意点

- `TTFeed.reason` のリポスト判定は `reason.$type === "app.bsky.feed.defs#reasonRepost"` で行う。`reason != null` や `reasonPin` の否定で判定しない（ユニオンは将来型が増えうる）
- `inject-folding-to-feeds.ts` は `sanitize-posts-or-feeds.ts` より前に呼ばれるため、`__custom.reason` ではなく `TTFeed.reason` を自前で判定する必要がある
- `reasonRepost` の `uri` / `cid` は省略可能（リポスト経由のいいね・リポストで参照する）
- ピン留めポストは通常のポストとして表示している。「固定」等の表示は未対応
