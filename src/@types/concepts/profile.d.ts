type TTProfile = {
  __log?: any // Injected
  __repo?: any // Injected
  __enabledContentMask?: boolean // Injected
  createdAt?: string
  associated?: TIAssociated
  avatar: string
  banner: string
  description?: string
  did: string
  displayName: string
  followersCount: number
  followsCount: number
  handle: string
  indexedAt?: string
  labels?: Array<TTLabel>
  pinnedPost?: TTCidUri
  postsCount: number
  joinedViaStarterPack?: TIStarterPack
  viewer: TTUserViewer

  // Frontpage
  __frontpage?: Array<TICommonRecord>

  // Linkat
  __linkat?: Array<TICommonRecord>

  // SmokeSignal
  __smokeSignal?: Array<TICommonRecord>

  // WhiteWind
  __whiteWind?: Array<TICommonRecord>
}

type TTUpdateProfileParams = {
  displayName: string
  description: string
  labels: Array<string>
  avatar: null | Array<File>
  detachAvatar: Array<boolean>
  banner: null | Array<File>
  detachBanner: Array<boolean>
  pinnedPost?: TTCidUri
}
