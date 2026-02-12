type TTImage = {
  image?: TIBlob
  video?: TIBlob

  thumb?: string
  fullsize?: string

  alt: string
  aspectRatio?: TTAspectRatio
}

type TTAspectRatio = {
  width: number
  height: number
}

interface TTImagePopupPropsImages {
  largeUri: string
  smallUri: string
  blob?: BlobRef
}

type TTCreateFileBlobRefParams = {
  file: File
  mimeType?: string
  maxWidth?: number
  maxHeight?: number
  maxSize?: number
}
