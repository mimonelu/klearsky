interface TIAtpWrapper {
  agent: null | BskyAgent
  data: { did: string; sessions: { [did: string]: TTSession } }
  session?: TTSession
  lastFetchNotificationsDate?: Date

  // Prototype methods
  canLogin (this: TIAtpWrapper): boolean
  createAgent (this: TIAtpWrapper, service?: string): boolean
  createFileBlob (this: TIAtpWrapper, params: TTCreateFileBlobParams): Promise<null | BlobRef>
  createFollow (this: TIAtpWrapper, declarationDid: string): Promise<null | string>
  createLike (this: TIAtpWrapper, uri: string, cid: string): Promise<undefined | string>
  createPost (this: TIAtpWrapper, params: TTCreatePostParams): Promise<boolean>
  createReport (this: TIAtpWrapper, reasonType: string, reason: string, did?: string, cid?: string, uri?: string): Promise<boolean>
  createRepost (this: TIAtpWrapper, uri: string, cid: string): Promise<boolean>
  deleteAccount (this: TIAtpWrapper, did?: string)
  deleteFollow (this: TIAtpWrapper, uri: string): Promise<boolean>
  deleteLike (this: TIAtpWrapper, uri: string): Promise<boolean>
  deletePost (this: TIAtpWrapper, uri: string): Promise<boolean>
  deleteRepost (this: TIAtpWrapper, uri: string): Promise<boolean>
  deleteSession (this: TIAtpWrapper): Promise<boolean>
  fetchActorsTypeahead (this: TIAtpWrapper, term?: string, limit?: number): Promise<Error | Array<TTUser>>
  fetchAuthorCustomFeeds (this: TIAtpWrapper, generators: Array<TTFeedGenerator>, author: string, limit?: number, cursor?: string): Promise<Error | undefined | string>
  fetchAuthorFeed (this: TIAtpWrapper, oldFeeds: Array<TTFeed>, author: string, limit?: number, cursor?: string, filter?: string, middle?: boolean): Promise<undefined | string>
  fetchAuthorLikes (this: TIAtpWrapper, currentFeeds: Array<TTFeed>, repo: string, limit?: number, cursor?: string): Promise<undefined | string>
  fetchAuthorReposts (this: TIAtpWrapper, currentFeeds: Array<TTFeed>, repo: string, limit?: number, cursor?: string): Promise<undefined | string>
  fetchBlob (this: TIAtpWrapper, cid: string, did?: string): Promise<null | Uint8Array>
  fetchBlockingUsers (this: TIAtpWrapper, users: Array<TTUser>, limit?: number, cursor?: string): Promise<undefined | string>
  fetchCustomFeeds (this: TIAtpWrapper, oldFeeds: Array<TTFeed>, feed: string, limit?: number, cursor?: string, middle?: boolean): Promise<undefined | false | string>
  fetchDid (this: TIAtpWrapper, handle: string): Promise<Error | string>
  fetchFeedGenerator (this: TIAtpWrapper, feed: string): Promise<Error | TTFeedGenerator>
  fetchFeedGenerators (this: TIAtpWrapper, feeds: Array<string>): Promise<Error | Array<TTFeedGenerator>>
  fetchFirstPost (this: TIAtpWrapper, handle: string): Promise<undefined | string>
  fetchFollowers (this: TIAtpWrapper, users: Array<TTUser> | Array<TTUser>, handle: string, limit?: number, cursor?: string): Promise<undefined | string>
  fetchFollowings (this: TIAtpWrapper, users: Array<TTUser> | Array<TTUser>, handle: string, limit?: number, cursor?: string): Promise<undefined | string>
  fetchInviteCodes (this: TIAtpWrapper): Promise<Error | TTInviteCode[]>
  fetchLabels (this: TIAtpWrapper, uriPatterns: Array<string>, ): Promise<undefined | Array<TTLabel>>
  fetchLikeUsers (this: TIAtpWrapper, users: Array<TTUser>, uri: string, limit?: number, cursor?: string): Promise<undefined | string>
  fetchListFeed (this: TIAtpWrapper, currentFeeds: Array<TTFeed>, list: string, limit?: number, cursor?: string): Promise<Error | undefined | string>
  fetchMutingUsers (this: TIAtpWrapper, users: Array<TTUser>, limit?: number, cursor?: string): Promise<undefined | string>
  fetchNotificationCount (this: TIAtpWrapper): Promise<null | number>
  fetchNotifications (this: TIAtpWrapper, values: Array<TTNotificationGroup>, limit?: number, cursor?: string): Promise<undefined | false | { cursor?: string; newNotificationCount: number }>
  fetchOfficialFeedGenerators (this: TIAtpWrapper): Promise<undefined | false | Array<TTFeedGenerator>>
  fetchPopularFeedGenerators (this: TIAtpWrapper, currentValues: Array<TTFeedGenerator>, limit?: number, cursor?: string, term?: string): Promise<Error | undefined | string>
  fetchPosts (this: TIAtpWrapper, uris: Array<string>): Promise<undefined | false | Array<TTPost>>
  fetchPostSearch (this: TIAtpWrapper, query: string): Promise<undefined | false | Array<TTPost>>
  fetchPostThread (this: TIAtpWrapper, uri: string, depth?: number): Promise<undefined | false | Array<TTPost>>
  fetchPreferences (this: TIAtpWrapper): Promise<undefined | Array<TTPreference>>
  fetchProfile (this: TIAtpWrapper, actor: string): Promise<null | TTProfile>
  fetchRepostUsers (this: TIAtpWrapper, users: Array<TTUser>, uri: string, limit?: number, cursor?: string): Promise<undefined | string>
  fetchSuggestions (this: TIAtpWrapper, dataRef: Array<TTUser>, limit?: number, cursor?: string): Promise<undefined | string>
  fetchTimeFeeds (this: TIAtpWrapper, oldPosts: Array<TTPost>, direction: "new" | "old", author: TTUser, limit?: number): Promise<Error | undefined | string>
  fetchTimeline (this: TIAtpWrapper, oldFeeds: Array<TTFeed>, replyControl?: Array<number>, repostControl?: Array<number>, limit?: number, cursor?: string, middle?: boolean): Promise<undefined | false | string>
  fetchUserSearch (this: TIAtpWrapper, users: Array<TTUser>, term: string, limit?: number, cursor?: string): Promise<undefined | string>
  hasLogin (this: TIAtpWrapper): boolean
  login (this: TIAtpWrapper, service?: string, identifier?: string, password?: string): Promise<boolean>
  logout (this: TIAtpWrapper)
  refreshSession (this: TIAtpWrapper): Promise<boolean>
  resetSession (this: TIAtpWrapper, newSession: TTSession, service?: string): void
  resumeSession (this: TIAtpWrapper, session: TTSession): Promise<boolean>
  saveData (this: TIAtpWrapper)
  updateBlockToDisable (this: TIAtpWrapper, uri: string): Promise<boolean>
  updateBlockToEnable (this: TIAtpWrapper, did: string): Promise<null | string>
  updateMuteToDisable (this: TIAtpWrapper, did: string): Promise<boolean>
  updateMuteToEnable (this: TIAtpWrapper, did: string): Promise<boolean>
  updateMyLabels (this: TIAtpWrapper, labels: Array<TTLabel>): Promise<Error | boolean>
  updateNotificationSeen (this: TIAtpWrapper): Promise<boolean>
  updatePreferences  (this: TIAtpWrapper, preferences: Array<TTPreference>, ): Promise<boolean>
  updateProfile (this: TIAtpWrapper, params: TTUpdateProfileParams): Promise<boolean>
}
