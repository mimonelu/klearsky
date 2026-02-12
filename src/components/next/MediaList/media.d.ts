type TTMedia = {
  $type: string
  external?: TTExternal
  images?: Array<TTImage>
  post?: TTPost
  smallUri?: string
  largeUri?: string
  alt?: string
  isRepost?: boolean
}
