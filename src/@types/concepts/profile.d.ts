type TTProfile = TTUser & {
  __log?: any // Injected
  __repo?: any // Injected
  banner: string
  followersCount: number
  followsCount: number
  indexedAt?: string
  joinedViaStarterPack?: TIStarterPack
  links?: Array<TTProfileLink>
  pinnedPost?: TTCidUri
  postsCount: number

  // Frontpage
  __frontpage?: Array<TICommonRecord>

  // Linkat
  __linkat?: Array<TICommonRecord>

  // SkyBeMoreBlue
  __skyBeMoreBlue?: Array<any>

  // SmokeSignal
  __smokeSignal?: Array<TICommonRecord>

  // WhiteWind
  __whiteWind?: Array<TICommonRecord>
}

// `app.bsky.actor.defs#profileLinkView`
type TTProfileLink = {
  uri: string
  cid: string
  url: string
  title?: string
  icon?: string
  labels?: Array<TTLabel>
}

// 編集中のプロフィールリンク
type TTProfileLinkDraft = {
  // 保存済みのリンクレコード（新規の場合は未設定）
  uri?: string
  cid?: string
  value?: import("@atproto/api").AppBskyActorLink.Record

  url: string
  title?: string

  // 保存済みの favicon
  icon?: import("@atproto/api").BlobRef

  // 未アップロードの favicon
  iconFile?: Blob

  // 表示用の favicon の URL（保存済みは CDN の URL、未保存は data URL）
  iconUrl?: string
}

type TTUpdateProfileParams = {
  displayName: string
  description: string
  pronouns: string
  labels: Array<string>
  avatar: null | Array<File>
  detachAvatar: Array<boolean>
  banner: null | Array<File>
  detachBanner: Array<boolean>

  // 指定時のみプロフィールリンクを更新する
  links?: Array<TTProfileLinkDraft>
}
