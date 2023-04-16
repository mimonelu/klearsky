import type { BlobRef, BskyAgent, ComAtprotoRepoUploadBlob } from "@atproto/api"
import imageCompression from "browser-image-compression"

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

async function compressFileToBlob (params: {
  file: File,
  mimeType: string,
  maxWidth: number,
  maxHeight: number,
  maxSize: number,
}): Promise<Blob> {
  return await imageCompression(params.file, {
    fileType: params.mimeType,
    maxSizeMB: params.maxSize,
    maxWidthOrHeight: Math.max(params.maxWidth, params.maxHeight),
    useWebWorker: true,
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
  let mimeType = ""

  let blob: undefined | Blob = undefined
  if (imageMimeType != null) {
    mimeType = imageMimeType
    blob = await compressFileToBlob({ ...params, mimeType })
    if (blob instanceof Error) return null
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
