import type { BlobRef, ComAtprotoRepoUploadBlob } from "@atproto/api"
import imageCompression from "browser-image-compression/dist/browser-image-compression"

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
  params: TTCreateFileBlobRefParams
): Promise<Error | BlobRef> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  if (params.file == null) {
    return Error("paramError")
  }

  let mimeType = ""
  let blob: Error | undefined | Blob
  const fileSizeMb = params.file.size / 1024 / 1024
  const imageMimeType = convertMapForCompress[params.file.type]

  // ファイルサイズ上限以上かつ変換可能なファイルの場合は変換する
  if (params.maxSize != null && fileSizeMb >= params.maxSize && imageMimeType != null) {
    mimeType = imageMimeType

    // SEE: https://github.com/Donaldcwl/browser-image-compression#main-function
    try {
      blob = await imageCompression(params.file, {
        fileType: mimeType,
        maxIteration: 20, // Default: 10
        maxSizeMB: params.maxSize,
        maxWidthOrHeight: Math.max(params.maxWidth ?? 0, params.maxHeight ?? 0) || undefined,
        useWebWorker: true,
      })
    } catch (error) {
      console.warn("[klearsky/imageCompression]", error)
      blob = Error("imageCompressionError")
    }

    if (blob instanceof Error) {
      return blob
    }

  // ファイルサイズ上限未満または変換不可能なファイルの場合はそのまま
  } else {
    mimeType = params.file.type
    blob = params.file
  }

  const arrayBuffer = await convertBlobTo(blob, "readAsArrayBuffer")
  if (arrayBuffer == null) {
    return Error("apiError")
  }
  const input = new Uint8Array(arrayBuffer as ArrayBuffer)
  const options: ComAtprotoRepoUploadBlob.CallOptions = {
    encoding: mimeType,
  }
  const response: Error | ComAtprotoRepoUploadBlob.Response =
    await this.agent.uploadBlob(input, options)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/uploadBlob]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
  return response.data.blob
}

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
      if (buffer == null) {
        reject(null)
      }
      resolve(buffer)
    }
    fileReader[method](blob)
  })
}
