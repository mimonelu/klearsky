import Encoding from "encoding-japanese"
import Util from "@/composables/util"

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

export default async function (
  atpWrapper: TIAtpWrapper,
  uri: string,
  urlHasImage?: boolean
): Promise<{
  uri: string,
  title: string,
  description: string
}> {
  const response =
    await fetch(`https://mimonelu.net:4649/${uri}`, {
      headers: { "user-agent": "Klearsky" },
    })
    .then((response: Response) => {
      if (!response.ok) throw `Fetch error: ${response.statusText}`
      return response
    })
    .catch((error: any) => {
      throw error
    })

  // 文字エンコードの変換 (for Japanese Language)
  const arrayBuffer = await response.arrayBuffer()
  const uint8Array = new Uint8Array(arrayBuffer)
  const htmlString = Encoding.convert(uint8Array, {
    to: "UNICODE",
    type: "string",
  })

  const parser = new DOMParser()
  const html = parser.parseFromString(htmlString, "text/html")
  const titleElement = html.querySelector("title")
  const ogTitleElement = html.querySelector("meta[property='og:title']")
  const descriptionElement = html.querySelector("meta[name='description']")
  const ogDescriptionElement = html.querySelector("meta[property='og:description']")
  const titleText = titleElement?.innerText ?? ""
  const ogTitleText = ogTitleElement?.getAttribute("content") ?? ""
  const descriptionText = descriptionElement?.getAttribute("content") ?? ""
  const ogDscriptionText = ogDescriptionElement?.getAttribute("content") ?? ""
  let title = ogTitleText || titleText || ""
  let description  = ogDscriptionText || descriptionText || ""

  // 最大文字数まで切り詰め
  // SEE: https://github.com/bluesky-social/atproto/blob/ad0d976188d1f07401b9675b5c6045c91e82a84e/lexicons/app/bsky/embed/external.json#L21-L30
  const titleLength = Util.getGraphemeLength(title)
  if (titleLength > 300) title = Util.unicodeSubstring(title, 0, 300)
  const descriptionLength = Util.getGraphemeLength(description)
  if (descriptionLength > 1000) description = Util.unicodeSubstring(description, 0, 1000)

  const external = {
    uri,
    title,
    description,
  }

  // OGP 画像の対応
  if (urlHasImage) {
    const ogImageElement = html.querySelector("meta[property='og:image']")
    const ogImage = ogImageElement?.getAttribute("content") ?? ""
    if (ogImage !== "") {
      const response =
        await fetch(`https://mimonelu.net:4649/${ogImage}`, {
          headers: { "user-agent": "Klearsky" },
        })
        .then((response: Response) => {
          if (!response.ok) return Error(`Fetch error: ${response.statusText}`)
          return response
        })
        .catch((error: any) => error)
      
      if (response instanceof Error) return external
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
      if (blobRef == null) return external
      ;(external as any).thumb = blobRef
    }
  }

  return external
}
