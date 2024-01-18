import type { BlobRef, BskyAgent, ComAtprotoRepoUploadBlob } from "@atproto/api"
import imageCompression from "browser-image-compression/dist/browser-image-compression"

function convertBlobTo(
  blob: Blob,
  method:
    | "readAsArrayBuffer"
    | "readAsBinaryString"
    | "readAsDataURL"
    | "readAsText"
): Promise<null | string | ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onload = () => {
      const buffer: null | string | ArrayBuffer = fileReader.result
      if (buffer == null) reject(null)
      resolve(buffer)
    }
    fileReader[method](blob)
  })
}

const convertMapForCompress: { [mimeType: string]: string } = {
  "image/apng": "image/jpeg",
  "image/avif": "image/jpeg",
  "image/bmp": "image/jpeg",
  "image/gif": "image/jpeg",
  "image/jpeg": "image/jpeg",
  "image/png": "image/jpeg",
  "image/svg+xml": "image/jpeg",
  "image/webp": "image/jpeg",
}

export default async function (
  this: TIAtpWrapper,
  params: {
    file: File
    maxWidth: number
    maxHeight: number
    maxSize: number
  }
): Promise<null | BlobRef> {
  if (this.agent == null) return null
  if (params.file == null) return null

  let mimeType = ""
  let blob: undefined | Error | Blob
  const fileSizeMb = params.file.size / 1024 / 1024
  const imageMimeType = convertMapForCompress[params.file.type]

  // ファイルサイズ上限以上かつ変換可能なファイルの場合は変換する
  if (fileSizeMb >= params.maxSize && imageMimeType != null) {
    mimeType = imageMimeType

    // SEE: https://github.com/Donaldcwl/browser-image-compression#main-function
    try {
      blob = await imageCompression(params.file, {
        fileType: mimeType,
        maxIteration: 20, // Default: 10
        maxSizeMB: params.maxSize,
        maxWidthOrHeight: Math.max(params.maxWidth, params.maxHeight),
        useWebWorker: true,
      })
    } catch (error) {
      console.error("[klearsky/imageCompression]", error)
      blob = Error("imageCompressionError")
    }

    if (blob instanceof Error) return null

  // ファイルサイズ上限未満または変換不可能なファイルの場合はそのまま
  } else {
    mimeType = params.file.type
    blob = params.file
  }

  const arrayBuffer = await convertBlobTo(blob, "readAsArrayBuffer")
  if (arrayBuffer == null) return null
  const input: Uint8Array = new Uint8Array(arrayBuffer as ArrayBuffer)
  const options: ComAtprotoRepoUploadBlob.CallOptions = {
    encoding: mimeType,
  }
  const response: ComAtprotoRepoUploadBlob.Response =
    await (this.agent as BskyAgent).uploadBlob(input, options)
  console.log("[klearsky/uploadBlob]", response)
  if (!response.success) return null
  return response.data.blob
}
