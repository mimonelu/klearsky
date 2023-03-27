import type { ComAtprotoBlobUpload } from "@atproto/api"

function getFileAs(
  file: File,
  type: "arrayBuffer" | "dataURL"
): Promise<null | string | ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onload = () => {
      const buffer: null | string | ArrayBuffer = fileReader.result ?? null
      if (buffer == null) reject(null)
      resolve(buffer)
    }
    type === "arrayBuffer"
      ? fileReader.readAsArrayBuffer(file)
      : fileReader.readAsDataURL(file)
  })
}

async function getResizedImage(
  file: File,
  maxWidth: number,
  maxHeight: number
): Promise<null | ArrayBuffer> {
  const dataURL: null | string = (await getFileAs(file, "dataURL")) as
    | null
    | string
  if (dataURL == null) return null
  const image = await getImage(dataURL)
  if (image.width <= maxWidth && image.height <= maxHeight)
    return (await getFileAs(file, "arrayBuffer")) as null | ArrayBuffer
  const canvas = document.createElement("canvas")
  const context = canvas.getContext("2d")
  let width = image.width
  let height = image.height
  if (width >= height) {
    if (width > maxWidth) {
      width = maxWidth
      height = Math.floor((maxWidth / image.width) * image.height)
    }
  } else {
    if (height > maxHeight) {
      width = Math.floor((maxHeight / image.height) * image.width)
      height = maxHeight
    }
  }
  canvas.setAttribute("width", width.toString())
  canvas.setAttribute("height", height.toString())
  context?.drawImage(image, 0, 0, width, height)
  return (await getCanvasBlob(canvas, file.type)) as ArrayBuffer
}

function getImage(data: any): Promise<HTMLImageElement> {
  return new Promise(resolve => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.src = data
  })
}

function getCanvasBlob(
  canvas: HTMLCanvasElement,
  mimeType: string
): Promise<null | string | ArrayBuffer> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob == null) reject(null)
      const fileReader = new FileReader()
      fileReader.onload = () => {
        const buffer: null | string | ArrayBuffer = fileReader.result ?? null
        if (buffer == null) reject(null)
        resolve(buffer)
      }
      fileReader.readAsArrayBuffer(blob as Blob)
    }, mimeType)
  })
}

export default async function (
  this: TIAtpWrapper,
  file: File,
  maxWidth: number,
  minWidth: number
): Promise<null | TTFileSchema> {
  if (this.agent == null) return null
  if (file == null) return null
  const dataArrayBuffer: null | string | ArrayBuffer =
    file.type.indexOf("image/") !== -1 && file.type !== "image/svg+xml"
      ? await getResizedImage(file, maxWidth, minWidth)
      : ((await getFileAs(file, "arrayBuffer")) as null | ArrayBuffer)
  if (dataArrayBuffer == null) return null
  const dataUint8Array = new Uint8Array(dataArrayBuffer as ArrayBuffer)
  const response: ComAtprotoBlobUpload.Response =
    await this.agent.api.com.atproto.blob.upload(dataUint8Array, {
      encoding: file.type,
    })
  console.log("[klearsky/createFileSchema]", response)
  if (!response.success) return null
  return {
    cid: response.data.cid,
    mimeType: file.type,
  }
}
