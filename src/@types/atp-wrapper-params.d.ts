type TTPostType = "post" | "reply" | "quoteRepost"

type TTCreateFileBlobParams = {
  file: File
  mimeType?: string
  maxWidth: number
  maxHeight: number
  maxSize: number
}

type TTCreatePostParams = {
  type: TTPostType
  post?: TTPost
  text: string
  createdAt?: string
  url: string
  images: Array<File>
  alts: Array<string>
  languages?: Array<string>
  labels?: Array<string>
  lightning?: string
}

type TTSendPostPopupParams = {
  display?: boolean
  type: TTPostType
  post?: TTPost
  text?: string
  url?: string
  fileList?: FileList
  createdAt?: string
}

type TTUpdateProfileParams = {
  displayName: string
  description: string
  avatar: null | Array<File>
  detachAvatar: Array<boolean>
  banner: null | Array<File>
  detachBanner: Array<boolean>
}
