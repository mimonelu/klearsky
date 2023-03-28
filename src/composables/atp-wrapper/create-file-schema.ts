import type { ComAtprotoBlobUpload } from "@atproto/api"
import Compressor from "compressorjs"

function convertBlobTo (
  blob: Blob,
  method: "readAsArrayBuffer" | "readAsBinaryString" | "readAsDataURL" | "readAsText"
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

async function convertFileToImage (file: File): Promise<HTMLImageElement> {
  return new Promise(async (resolve, reject) => {
    const dataUrl = await convertBlobTo(file, "readAsDataURL") as string
    const image = new Image()
    image.onerror = reject
    image.onload = () => {
      resolve(image)
    }
    image.src = dataUrl
  })
}

function compressFileToBlob (params: {
  file: File,
  mimeType: string,
  maxWidth: number,
  maxHeight: number,
  maxSize: number,
  quality?: number,
}): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // SEE: https://github.com/fengyuanchen/compressorjs#options
    new Compressor(params.file, {
      convertSize: params.maxSize,
      convertTypes: params.mimeType,
      maxWidth: params.maxWidth,
      maxHeight: params.maxHeight,
      mimeType: params.mimeType,
      quality: params.quality,
      success: resolve,
      error: reject,
    })
  })
}

const convertMap: { [mimeType: string]: string } = {
  "image/bmp": "image/jpeg",
  "image/gif": "image/jpeg",
  "image/jpeg": "image/jpeg",
  "image/png": "image/jpeg",
  "image/webp": "image/jpeg",
}

export default async function (
  this: TIAtpWrapper,
  params: {
    file: File,
    maxWidth: number,
    maxHeight: number,
    maxSize: number,
    quality?: number,
  }
): Promise<null | TTFileSchema> {
  if (this.agent == null) return null
  if (params.file == null) return null
  const imageMimeType = convertMap[params.file.type]

  let input: string | Uint8Array = ""
  let mimeType = ""

  if (imageMimeType != null) {
    mimeType = imageMimeType

    if (params.file.size <= params.maxSize) {
      const image = await convertFileToImage(params.file)
      if (image.width <= params.maxWidth
       && image.height <= params.maxHeight) {
        mimeType = params.file.type
      }
    }

    const blob: Error | Blob = await compressFileToBlob({ ...params, mimeType })
    if (blob instanceof Error) return null
    const arrayBuffer = await convertBlobTo(blob, "readAsArrayBuffer")
    if (arrayBuffer == null) return null
    input = new Uint8Array(arrayBuffer as ArrayBuffer)
  } else {
    mimeType = params.file.type
    input = await convertBlobTo(params.file, "readAsText") as string
  }

  const response: ComAtprotoBlobUpload.Response =
    await this.agent.api.com.atproto.blob.upload(input, {
      encoding: mimeType,
    })
  console.log("[klearsky/createFileSchema]", response)
  if (!response.success) return null
  return {
    cid: response.data.cid,
    mimeType,
  }
}
