import type { BlobRef } from "@atproto/api"
import Util from "@/composables/util"

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

  // キャッシュがあればキャッシュを使用
  let url: null | string = Util.cache.get("blob", cid)
  if (url != null) {
    return url
  }

  // キャッシュがなければダウンロード
  const data = await this.fetchBlob(cid, did)
  if (data instanceof Error) {
    return data
  }

  // キャッシュに保存
  url = URL.createObjectURL(new Blob([data], {
    type: image.mimeType,
  }))
  Util.cache.set("blob", cid, url)

  return url
}

