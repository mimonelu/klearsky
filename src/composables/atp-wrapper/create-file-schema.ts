import type { ComAtprotoBlobUpload } from "@atproto/api"
import Compressor from "compressorjs"

function convertBlobToArrayBuffer (blob: Blob): Promise<null | ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onload = () => {
      const buffer: null | ArrayBuffer =
        (fileReader.result ?? null) as null | ArrayBuffer
      if (buffer == null) reject(null)
      resolve(buffer)
    }
    fileReader.readAsArrayBuffer(blob)
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
      quality: params.quality,
      success: resolve,
      error: reject,
    })
  })
}

export default async function (
  this: TIAtpWrapper,
  params: {
    file: File,
    mimeType: string,
    maxWidth: number,
    maxHeight: number,
    maxSize: number,
    quality?: number,
  }
): Promise<null | TTFileSchema> {
  if (this.agent == null) return null
  if (params.file == null) return null
  const blob: Error | Blob = await compressFileToBlob(params)
  if (blob instanceof Error) return null
  const arrayBuffer = await convertBlobToArrayBuffer(blob)
  if (arrayBuffer == null) return null
  const uint8Array = new Uint8Array(arrayBuffer as ArrayBuffer)
  const response: ComAtprotoBlobUpload.Response =
    await this.agent.api.com.atproto.blob.upload(uint8Array, {
      encoding: params.mimeType,
    })
  console.log("[klearsky/createFileSchema]", response)
  if (!response.success) return null
  return {
    cid: response.data.cid,
    mimeType: params.mimeType,
  }
}
