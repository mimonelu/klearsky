type TTSetting = {
  autoTranslation?: boolean
  autoTranslationIgnoreLanguage?: string
  backgroundImage?: string
  backgroundOpacity?: number
  colorTheme?: string
  contentLanguages?: Array<string>
  fontSize?: string
  globallineLayout?: "post" | "slim"
  hideNumberOfReaction?: boolean
  imageAspectRatio?: string
  imageOption?: Array<number>
  imageControl?: "all" | "followingEx" | "following" | "self" | "none"
  layout?: "default" | "defaultLeft" | "defaultRight" | "slim" | "slimLeft" | "slimRight"
  lightning?: string
  linkcardEmbeddedControl?: Array<string>
  mainAreaOpacity?: number
  postAnonymization?: boolean
  postLanguages?: Array<string>
  replyControl?: Array<number>
  repostControl?: Array<number>
  tags?: Array<TTMyTag>
  timeControl?: string
  uiLanguage?: string
  wordMute?: Array<TTWordMute>
  [k: string]: any
}
