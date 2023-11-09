import type { BlobRef } from "@atproto/api"
import Util from "@/composables/util"

export default async function (
  this: TIAtpWrapper,
  did: string,
  image: BlobRef
): Promise<undefined | string> {
  if (this.agent == null) return

  const ref = (image.ref as any).$link != null
    ? (image.ref as any).$link
    : image.ref.toString()

  // キャッシュがあればキャッシュを使用
  let url: null | string = Util.cache.get(ref)
  if (url != null) return url

  // キャッシュがなければダウンロード
  const data = await this.fetchBlob(ref, did)
  if (data == null) return

  // キャッシュに保存
  url = URL.createObjectURL(new Blob([data], {
    type: image.mimeType,
  }))
  Util.cache.set(ref, url)

  return url
}

