import type { BlobRef, BskyAgent, ComAtprotoRepoUploadBlob } from "@atproto/api"
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

function compressFileToBlob (params: {
  file: File,
  // mimeType: string,
  maxWidth: number,
  maxHeight: number,
  maxSize: number,
  quality?: number,
}): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // SEE: https://github.com/fengyuanchen/compressorjs#options
    new Compressor(params.file, {
      convertSize: params.maxSize,
      // convertTypes: params.mimeType,
      maxWidth: params.maxWidth,
      maxHeight: params.maxHeight,
      // mimeType: params.mimeType,
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
  }
): Promise<null | BlobRef> {
  if (this.agent == null) return null
  if (params.file == null) return null
  const imageMimeType = convertMap[params.file.type]

  let blob: undefined | Blob = undefined
  if (imageMimeType != null) {
    blob = await compressFileToBlob({ ...params, quality: 0.9 })
    if (blob instanceof Error) return null
  } else {
    blob = params.file
  }

  const arrayBuffer = await convertBlobTo(blob, "readAsArrayBuffer")
  if (arrayBuffer == null) return null
  const input: Uint8Array = new Uint8Array(arrayBuffer as ArrayBuffer)
  const options: ComAtprotoRepoUploadBlob.CallOptions = {
    encoding: params.file.type,
  }
  const response: ComAtprotoRepoUploadBlob.Response =
    await (this.agent as BskyAgent).uploadBlob(input, options)
  console.log("[klearsky/uploadBlob]", response)
  if (!response.success) return null
  return response.data.blob
}
