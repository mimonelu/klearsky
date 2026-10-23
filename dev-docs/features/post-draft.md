# ポスト下書き

## ファイル構成

| ファイル | 役割 |
|---|---|
| `components/next/PostDraft/post-draft-utils.ts` | `buildPostDraft`, `extractSendPostPopupParams`, `deleteDraftWithMedia`, `deleteDraftMedia` 等 |
| `components/next/PostDraft/post-draft-media-store.ts` | 添付メディアを保存する IndexedDB ストア |
| `components/next/PostDraft/PostDraftPopup.vue` | 下書き一覧ポップアップ |
| `atp-wrapper/create/create-draft.ts` ほか | 下書き API ラッパー |

## 状態管理

- `mainState.currentPostDrafts`（`AppBskyDraftDefs.DraftView[]`）と `mainState.currentPostDraftsCursor` で管理

## メディアストア

- 下書きレコードにはメディア本体を保存できないため、ローカルの IndexedDB に保存
- key: `image:<21文字>` / value: `{ blob, createdAt }`

## 実装上の注意

- `extractSendPostPopupParams` は `DraftView` を受け取り、`draftId` を含む params を返す
- `main-state.ts` の `openSendPostPopup` で `draftId` のコピーと reset が必要
- 下書き更新後は、古いメディアを `deleteDraftMedia` で削除してから mainState を更新する
- `create-video.ts`: `file.name` が空の場合は MIME タイプから拡張子を補完する
