type TTSetting = {
  autoTranslation?: boolean
  autoTranslationIgnoreLanguage?: string
  backgroundImage?: string
  backgroundOpacity?: number
  colorTheme?: string
  contentLanguages?: Array<string>
  feedSearchKeywordHistory?: Array<string>
  fontSize?: string
  fontKerning?: boolean
  fontAntialiasing?: boolean
  globallineContentLanguages?: Array<string>
  globallineSkipPostHasNoLanguage?: boolean
  globallinePostTypes?: Array<string>
  globallineMinFollowersCount?: string
  globallineLayout?: "post" | "slim"
  hideNotificationBadge?: boolean
  hideNumberOfReaction?: boolean
  imageFolding?: "none" | "recommended" | "all"
  imageMaxHeightRatio?: number
  imageAutoPlay?: boolean
  lightning?: string
  linkcardLayout?: "none" | "horizontal" | "vertical"
  linkcardEmbeddedControl?: Array<string>
  mainAreaOpacity?: number
  myFeedsIndex?: Array<string>
  notificationFetchInterval?: number
  postAnonymization?: boolean
  postLanguages?: Array<string>
  postSearchKeywordHistory?: Array<string>
  replyFolding?: Array<number>
  repostFolding?: Array<number>
  tags?: Array<TTMyTag>
  timeControl?: string
  uiLanguage?: string
  userSearchKeywordHistory?: Array<string>
  wordMute?: Array<TTWordMute>
  [k: string]: any
}
