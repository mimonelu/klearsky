import Util from "@/composables/util"

export default async function (
  atpWrapper: TIAtpWrapper,
  uri: string,
  urlHasImage?: boolean
): Promise<Error | TTExternal> {
  const response: Error | any =
    await Util.fetchWithTimeout(`https://cardyb.bsky.app/v1/extract?url=${uri}`)
      .then((value) => {
        if (!value.ok) {
          return Error("fetchOgpError")
        }
        return value.json()
      })
      .catch((error) => error)
  console.log("[klearsky/parse-ogp", response)

  // エラーをスルー
  /*
  if (response instanceof Error) {
    return response
  }
  if (response.error) {
    return Error("fetchOgpError")
  }
  */

  let title = response.title || ""
  let description = response.description || ""
  let imageFetchUrl = response.image || ""

  // 最大文字数まで切り詰め
  // SEE: https://github.com/bluesky-social/atproto/blob/ad0d976188d1f07401b9675b5c6045c91e82a84e/lexicons/app/bsky/embed/external.json#L21-L30
  const titleLength = Util.getGraphemeLength(title)
  if (titleLength > 300) {
    title = Util.unicodeSubstring(title, 0, 300)
  }
  const descriptionLength = Util.getGraphemeLength(description)
  if (descriptionLength > 1000) {
    description = Util.unicodeSubstring(description, 0, 1000)
  }

  const external: TTExternal = {
    uri,
    title,
    description,
    preview: response.image,
  }

  if (urlHasImage && imageFetchUrl) {
    const response =
      await Util.fetchWithTimeout(imageFetchUrl)
        .then((value) => {
          if (!value.ok) {
            return Error("fetchOgpImageError")
          }
          return value
        })
        .catch((error) => error)
    if (response instanceof Error) {
      // エラーをスルー
      return external
    }
    const blob = await response.blob()

    // NOTICE: 横幅の規定値チェック
    // TODO: 間に合わせの処理のため要検討
    const size = await imagesize(blob as File)
    if ((size?.width ?? 0) < (548 / 2)) return external

    const blobRef = await atpWrapper.createFileBlobRef({
      file: blob as File,
      maxWidth: 2000,
      maxHeight: 2000,
      maxSize: 0.953671875,
    })
    if (blobRef instanceof Error) {
      return external
    }
    external.thumb = blobRef
  }

  return external
}

async function imagesize (file: File): Promise<{ width: number; height: number; }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const size = {
        width: img.naturalWidth,
        height: img.naturalHeight,
      }
      URL.revokeObjectURL(img.src)
      resolve(size)
    }
    img.onerror = (error) => {
      reject(error)
    }
    img.src = URL.createObjectURL(file)
  })
}
