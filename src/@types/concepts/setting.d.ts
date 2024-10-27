type TTSetting = {
  autoTranslation?: boolean
  autoTranslationIgnoreLanguage?: string
  backgroundImage?: string
  backgroundOpacity?: number
  chatFetchInterval?: number
  colorTheme?: string
  contentLanguages?: Array<string>
  feedSearchKeywordHistory?: Array<string>
  fontAntialiasing?: boolean
  fontKerning?: boolean
  fontSize?: string
  globallineContentLanguages?: Array<string>
  globallineFollowersCountThreshold?: string
  globallineLayout?: "post" | "slim"
  globallinePostTypes?: Array<string>
  globallineSkipPostHasNoLanguage?: boolean
  hideNotificationBadge?: boolean
  hideNumberOfReaction?: boolean
  imageAutoPlay?: boolean
  imageFolding?: "none" | "recommended" | "all"
  imageMaxHeightRatio?: number
  lightning?: string
  linkcardEmbeddedControl?: Array<string>
  linkcardLayout?: "none" | "horizontal" | "vertical"
  mainAreaOpacity?: number
  myWords?: Array<string>
  notificationFetchInterval?: number
  postAnonymization?: boolean
  postLanguages?: Array<string>
  postSearchKeywordHistory?: Array<string>
  replyFolding?: Array<number>
  repostFolding?: Array<number>
  timeControl?: string
  timelineFetchInterval?: number
  uiLanguage?: string
  userSearchKeywordHistory?: Array<string>
  videoPreload?: "none" | "metadata"
  wordMute?: Array<TIWordMute>
  [k: string]: any
}
