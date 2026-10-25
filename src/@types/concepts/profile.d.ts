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
  website?: string

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

type TTUpdateProfileParams = {
  displayName: string
  description: string
  pronouns: string
  website: string
  labels: Array<string>
  avatar: null | Array<File>
  detachAvatar: Array<boolean>
  banner: null | Array<File>
  detachBanner: Array<boolean>
}
