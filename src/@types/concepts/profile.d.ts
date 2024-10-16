type TTProfile = {
  __log?: any // Injected
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

  // Linkat
  __linkat?: Array<TICommonRecord>

  // WhiteWind
  __whiteWinds?: Array<TICommonRecord>
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
