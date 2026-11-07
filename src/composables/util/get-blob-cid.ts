// BlobRef の CID を文字列で返す
// NOTICE: `ref` は `agent` 経由なら CID、`fetchWithoutAgent` や Jetstream なら `{ $link }` になる
export default function (blob?: any): undefined | string {
  return blob?.cid ?? blob?.ref?.$link ?? blob?.ref?.toString()
}
