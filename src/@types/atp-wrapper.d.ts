interface TIAtpWrapper {
  agent: null | BskyAgent
  data: { did: string; sessions: { [did: string]: TTSession } }
  session?: TTSession
  lastFetchNotificationsDate?: Date

  // Prototype methods
  canLogin (this: TIAtpWrapper): boolean
  createAgent (this: TIAtpWrapper, service?: string): boolean
  createFileBlobRef (this: TIAtpWrapper, params: TTCreateFileBlobRefParams): Promise<null | BlobRef>
  createFollow (this: TIAtpWrapper, declarationDid: string): Promise<null | string>
  createLike (this: TIAtpWrapper, uri: string, cid: string): Promise<undefined | string>
  createList (this: TIAtpWrapper, purpose: string, name: string, description?: string, avatarBlobRef?: BlobRef): Promise<string | Error>
  createListUser (this: TIAtpWrapper, listUri: string, userDid: string): Promise<string | Error>
  createPost (this: TIAtpWrapper, params: TTCreatePostParams): Promise<Error | TTCidUri>
  createReport (this: TIAtpWrapper, reasonType: string, reason: string, did?: string, cid?: string, uri?: string): Promise<boolean>
  createRepost (this: TIAtpWrapper, uri: string, cid: string): Promise<boolean>
  deleteAccount (this: TIAtpWrapper, did?: string)
  deleteFollow (this: TIAtpWrapper, uri: string): Promise<boolean>
  deleteLike (this: TIAtpWrapper, uri: string): Promise<boolean>
  deleteList (this: TIAtpWrapper, listUri: string): Promise<true | Error>
  deleteListUser (this: TIAtpWrapper, userUri: string): Promise<true | Error>
  deletePost (this: TIAtpWrapper, uri: string): Promise<boolean>
  deleteRepost (this: TIAtpWrapper, uri: string): Promise<boolean>
  deleteSession (this: TIAtpWrapper): Promise<boolean>
  deleteThreadgate (this: TIAtpWrapper, postUri: string): Promise<boolean | Error>
  fetchActorsTypeahead (this: TIAtpWrapper, q?: string, limit?: number): Promise<Error | Array<TTUser>>
  fetchAuthorCustomFeeds (this: TIAtpWrapper, generators: Array<TTFeedGenerator>, author: string, limit?: number, cursor?: string): Promise<Error | undefined | string>
  fetchAuthorFeed (this: TIAtpWrapper, oldFeeds: Array<TTFeed>, author: string, limit?: number, cursor?: string, filter?: string, middle?: boolean): Promise<undefined | string>
  fetchAuthorLikes (this: TIAtpWrapper, currentFeeds: Array<TTFeed>, repo: string, limit?: number, cursor?: string): Promise<undefined | string>
  fetchAuthorReposts (this: TIAtpWrapper, currentFeeds: Array<TTFeed>, repo: string, limit?: number, cursor?: string): Promise<undefined | string>
  fetchBlob (this: TIAtpWrapper, cid: string, did?: string): Promise<null | Blob>
  fetchBlobUrl (this: TIAtpWrapper, did: string, image: BlobRef): Promise<undefined | string>
  fetchBlockingUsers (this: TIAtpWrapper, users: Array<TTUser>, limit?: number, cursor?: string): Promise<undefined | string>
  fetchCustomFeeds (this: TIAtpWrapper, oldFeeds: Array<TTFeed>, feed: string, limit?: number, cursor?: string, middle?: boolean, checkIdentity?: (params: any) => boolean): Promise<undefined | string | Error>
  fetchDid (this: TIAtpWrapper, handle: string): Promise<Error | string>
  fetchFeedGenerator (this: TIAtpWrapper, feed: string): Promise<Error | TTFeedGenerator>
  fetchFeedGenerators (this: TIAtpWrapper, feeds: Array<string>): Promise<Error | Array<TTFeedGenerator>>
  fetchFirstPost (this: TIAtpWrapper, handle: string): Promise<undefined | string>
  fetchFollowers (this: TIAtpWrapper, users: Array<TTUser> | Array<TTUser>, handle: string, limit?: number, cursor?: string): Promise<undefined | string>
  fetchFollowings (this: TIAtpWrapper, users: Array<TTUser> | Array<TTUser>, handle: string, limit?: number, cursor?: string): Promise<undefined | string>
  fetchSuggestedFollows (this: TIAtpWrapper, users: Array<TTUser> | Array<TTUser>, actor: string): Promise<Error | undefined>
  fetchInviteCodes (this: TIAtpWrapper): Promise<Error | TTInviteCode[]>
  fetchLabels (this: TIAtpWrapper, uriPatterns: Array<string>, ): Promise<undefined | Array<TTLabel>>
  fetchLikeUsers (this: TIAtpWrapper, users: Array<TTUser>, uri: string, limit?: number, cursor?: string): Promise<undefined | string>
  fetchList (this: TIAtpWrapper, list: string): Promise<TTList | Error>
  fetchListBlocks (this: TIAtpWrapper, lists: Array<TTList>, limit?: number, cursor?: string): Promise<undefined | string | Error>
  fetchListItems (this: TIAtpWrapper, currentListItems: Array<TTListItem>, list: string, limit?: number, cursor?: string): Promise<undefined | string | Error>
  fetchListMutes (this: TIAtpWrapper, lists: Array<TTList>, limit?: number, cursor?: string): Promise<undefined | string | Error>
  fetchLists (this: TIAtpWrapper, currentLists: Array<TTList>, actor: string, limit?: number, cursor?: string): Promise<undefined | string | Error>
  fetchListFeed (this: TIAtpWrapper, currentFeeds: Array<TTFeed>, list: string, limit?: number, cursor?: string, middle?: boolean, checkIdentity?: (params: any) => boolean): Promise<Error | undefined | string>
  fetchLogAudit: (this: TIAtpWrapper, did: string) => Promise<undefined | any>
  fetchMutingUsers (this: TIAtpWrapper, users: Array<TTUser>, limit?: number, cursor?: string): Promise<undefined | string>
  fetchNotificationCount (this: TIAtpWrapper): Promise<null | number>
  fetchNotifications (this: TIAtpWrapper, values: Array<TTNotificationGroup>, limit?: number, cursor?: string): Promise<undefined | false | { cursor?: string; newNotificationCount: number }>
  fetchOfficialFeedGenerators (this: TIAtpWrapper): Promise<undefined | false | Array<TTFeedGenerator>>
  fetchPopularFeedGenerators (this: TIAtpWrapper, currentValues: Array<TTFeedGenerator>, limit?: number, cursor?: string, term?: string): Promise<Error | undefined | string>
  fetchPosts (this: TIAtpWrapper, uris: Array<string>): Promise<undefined | false | Array<TTPost>>
  fetchPostSearch (this: TIAtpWrapper, currentPosts: Array<TTPost>, q: string, limit?: number, cursor?: string): Promise<Error | undefined | { cursor?: string, hitsTotal?: number }>
  fetchPostThread (this: TIAtpWrapper, uri: string, depth?: number): Promise<undefined | false | Array<TTPost>>
  fetchPreferences (this: TIAtpWrapper): Promise<undefined | Array<TTPreference>>
  fetchProfile (this: TIAtpWrapper, actor: string): Promise<null | TTProfile>
  fetchRepostUsers (this: TIAtpWrapper, users: Array<TTUser>, uri: string, limit?: number, cursor?: string): Promise<undefined | string>
  fetchServerInfo (this: TIAtpWrapper): Promise<Error | TTServerInfo>
  fetchSuggestions (this: TIAtpWrapper, dataRef: Array<TTUser>, limit?: number, cursor?: string): Promise<undefined | string>
  fetchTimeFeeds (this: TIAtpWrapper, oldPosts: Array<TTPost>, direction: "new" | "old", author: TTUser, limit?: number): Promise<Error | undefined | string>
  fetchTimeline (this: TIAtpWrapper, oldFeeds: Array<TTFeed>, replyControl?: Array<number>, repostControl?: Array<number>, limit?: number, cursor?: string, middle?: boolean): Promise<undefined | false | string>
  fetchUserSearch (this: TIAtpWrapper, users: Array<TTUser>, q: string, limit?: number, cursor?: string): Promise<undefined | string>
  fetchWithoutAgent (this: TIAtpWrapper, pathToXrpc: string, did: string, query: Record<string, string>): Promise<undefined | Response>
  hasLogin (this: TIAtpWrapper): boolean
  login (this: TIAtpWrapper, service?: string, identifier?: string, password?: string, onRefreshSession?: () => void): Promise<undefined | Error>
  logout (this: TIAtpWrapper)
  refreshSession (this: TIAtpWrapper): Promise<undefined | Error>
  resetSession (this: TIAtpWrapper, newSession: TTSession, service?: string): void
  resumeSession (this: TIAtpWrapper, session: TTSession): Promise<undefined | Error>
  saveData (this: TIAtpWrapper)
  updateBlockToDisable (this: TIAtpWrapper, uri: string): Promise<boolean>
  updateBlockToEnable (this: TIAtpWrapper, did: string): Promise<null | string>
  updateJwt (this: TIAtpWrapper, onRefreshSession?: () => void): Promise<undefined | Error>
  updateList (this: TIAtpWrapper, list: TTList, avatarBlobRef?: BlobRef): Promise<undefined | Error>
  updateListBlockToDisable (this: TIAtpWrapper, listUri: string): Promise<undefined | Error>
  updateListBlockToEnable (this: TIAtpWrapper, listUri: string): Promise<string | Error>
  updateListMuteToDisable (this: TIAtpWrapper, listUri: string): Promise<undefined | Error>
  updateListMuteToEnable (this: TIAtpWrapper, listUri: string): Promise<undefined | Error>
  updateMuteToDisable (this: TIAtpWrapper, did: string): Promise<boolean>
  updateMuteToEnable (this: TIAtpWrapper, did: string): Promise<boolean>
  updateNotificationSeen (this: TIAtpWrapper): Promise<boolean>
  updatePreferences  (this: TIAtpWrapper, preferences: Array<TTPreference>, ): Promise<boolean>
  updateProfile (this: TIAtpWrapper, params: TTUpdateProfileParams): Promise<boolean>
  updateThreadgate (this: TIAtpWrapper, postUri: string, allowMention: boolean, allowFollowing: boolean, listUris?: Array<string>): Promise<Error | TTCidUri>
}
