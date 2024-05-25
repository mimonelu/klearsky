interface TTHtmlPopupProps {
  display: boolean
  type?: string
}

interface TTImagePopupPropsImages {
  largeUri: string
  smallUri: string
  blob?: BlobRef
}

type TTMessagePopupProps = {
  display: boolean
  title?: string
  text?: string
  hasTranslateLink?: boolean
}

type TTSendPostPopupParams = {
  display?: boolean
  visibility?: boolean
  type: TTPostType
  post?: TTPost
  text?: string
  url?: string
  fileList?: FileList
  createdAt?: string
}
