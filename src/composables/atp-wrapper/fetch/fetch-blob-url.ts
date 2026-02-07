import type { BlobRef } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  did: string,
  image: BlobRef
): Promise<Error | string> {
  if (this.agent == null) {
    return Error("noAgentError")
  }

  const cid = (image as any).cid != null
    ? (image as any).cid
    : (image.ref as any).$link != null
      ? (image.ref as any).$link
      : image.ref.toString()

  // ダウンロード
  const data = await this.fetchBlob(cid, did)
  if (data instanceof Error) {
    return data
  }

  // URLオブジェクトに変換
  return URL.createObjectURL(new Blob([data], {
    type: image.mimeType,
  }))
}
