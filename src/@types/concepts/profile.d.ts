type TTProfile = TTUser & {
  __log?: any // Injected
  __repo?: any // Injected
  __enabledContentMask?: boolean // Injected
  banner: string
  followersCount: number
  followsCount: number
  indexedAt?: string
  joinedViaStarterPack?: TIStarterPack
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
  pinnedPost?: TTCidUri
}
