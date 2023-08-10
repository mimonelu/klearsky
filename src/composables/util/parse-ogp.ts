import Encoding from "encoding-japanese"

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
  uri: string
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
  const title = titleElement?.innerHTML ?? ""
  const ogTitle = ogTitleElement?.getAttribute("content") ?? ""
  const description = descriptionElement?.getAttribute("content") ?? ""
  const ogDscription = ogDescriptionElement?.getAttribute("content") ?? ""
  const external = {
    uri,
    title: ogTitle || title || "",
    description: ogDscription || description || "",
  }

  // OGP 画像の対応
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

    const blobRef = await atpWrapper.createFileBlob({
      file: blob as File,
      maxWidth: 2000,
      maxHeight: 2000,
      maxSize: 0.953671875,
    })
    if (blobRef == null) return external
    ;(external as any).thumb = blobRef
  }

  return external
}
