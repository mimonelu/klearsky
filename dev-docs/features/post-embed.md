# ポストの embed（添付と引用）

API レスポンスの構造を組み替えず、`Util.resolveEmbed` で読み解く（#108）。以前は `sanitize-posts-or-feeds.ts` が `embeds[0]` や `value` を移し替え、メディア付き引用を平坦化していた。引用先がポストの時だけ平坦化されるため `embed.record` の意味が場合によって変わり、切り離しやブロックの判定漏れの原因になっていた。

## 形

`$type` の `#view` の有無で View と Raw（生レコード）を区別する。

| 階層 | ポストの形 | 本文 | 添付 |
|---|---|---|---|
| 1 | `postView` | `record` | `embed`（View） |
| 2 | `viewRecord` | `value` | `embeds[0]`（View） |
| 3 | `viewRecord` | `value` | `embeds` がなく、`value.embed`（Raw）のみ |

TimeFeeds と Jetstream のポストは `post.record.embed`（Raw）だけを持つ。階層の上限はレキシコンに定義がないため、階層を固定せず再帰で処理する。

## 読み方

- `Util.resolveEmbed(embed)` は `media`、`quote`、`quoteRef` を返す
  - `quote` は View の引用先。`viewRecord`、`viewDetached`、`viewBlocked`、フィードなどのユニオン
  - `quoteRef` は Raw の引用先。strongRef しかなく、引用先の内容は分からない
- `Util.toPostLike(viewRecord)` は `viewRecord` を `Post.vue` に渡せる形にする。元のデータは書き換えない
- 型は `src/@types/concepts/embed.d.ts`。API の型のユニオンは `{ $type: string }` を含み `$type` で絞り込めないため、既知の型だけを並べている。未知の型は実行時に `resolveEmbed` の `default` へ流れる

## 注意点

- **`__custom`**: `sanitize-posts-or-feeds.ts` が各階層の `viewRecord` に付ける。`toPostLike` は同じオブジェクトを参照するので、`Post.vue` が書き込んだ状態は元のデータに残る
- **データの置き換え**: `updatePostProps` と `mergeFeeds` は `Util.inheritQuoteCustom` で引用先の `__custom` を引き継ぐ。引き継がないと、いいねなどの更新で引用先のマスク解除や翻訳が失われる
- **`Post.vue` の更新**: 引用先は切り離しや再接続で変わるので `computed` にしている。メディアは更新で変わらないので、リアクティブの依存を増やさないよう定数にしている（#104）
- **Raw の欠落**: Raw は他のクライアントが自由に書けるので、`$type` が正しくても中身が欠けている場合を想定する
- **BlobRef**: `ref` は `agent` 経由なら CID、`fetchWithoutAgent` と Jetstream なら `{ $link }` になる。`toString()` を直接呼ばず `Util.getBlobCid` を使う
- **画像の BlobRef**: View の画像は BlobRef を持たない。アニメーション画像の表示（`Thumbnail.vue`、`Post.vue` の `openImagePopup`）に必要なので、`Post.vue` が同じ位置の Raw の画像から合わせている。ギャラリーは対象外
