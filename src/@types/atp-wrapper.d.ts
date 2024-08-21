interface TIAtpWrapper {
  agent: null | BskyAgent
  proxies: { [k: string]: undefined | string }
  data: { did: string; sessions: { [did: string]: TTSession } }
  session?: TTSession

  // Prototype methods
  canLogin (this: TIAtpWrapper): boolean
  createAgent (this: TIAtpWrapper, service?: string): boolean
  createChatDeclaration (this: TIAtpWrapper, repo: string, allowIncoming: TTAllowIncoming): Promise<Error | TTCidUri>
  createChatMessage (this: TIAtpWrapper, convoId: string, params: TTCreatePostParams): Promise<Error | TIChatMessage>
  createFileBlobRef (this: TIAtpWrapper, params: TTCreateFileBlobRefParams): Promise<null | BlobRef>
  createFollow (this: TIAtpWrapper, declarationDid: string): Promise<null | string>
  createLike (this: TIAtpWrapper, uri: string, cid: string): Promise<undefined | string>
  createList (this: TIAtpWrapper, purpose: string, name: string, description?: string, avatarBlobRef?: BlobRef): Promise<string | Error>
  createListUser (this: TIAtpWrapper, listUri: string, userDid: string): Promise<string | Error>
  createPost (this: TIAtpWrapper, params: TTCreatePostParams): Promise<Error | TTCidUri>
  createRecord (this: TIAtpWrapper, repo: string, collection: string, record: { [k: string]: any }, rkey?: string, validate?: boolean, swapCommit?: string): Promise<Error | TTCidUri>
  createReport (this: TIAtpWrapper, reasonType: string, reason: string, did?: string, cid?: string, uri?: string, type?: string): Promise<boolean>
  createRepost (this: TIAtpWrapper, uri: string, cid: string): Promise<boolean>
  createStarterPack (this: TIAtpWrapper, starterPack: TIStarterPack): Promise<Error | TTCidUri>
  deleteAccount (this: TIAtpWrapper, did?: string)
  deleteChatDeclaration (this: TIAtpWrapper, repo: string, uri: string): Promise<Error | void>
  deleteChatMessage (this: TIAtpWrapper, convoId: string, messageId: string): Promise<Error | boolean>
  deleteFollow (this: TIAtpWrapper, uri: string): Promise<boolean>
  deleteLike (this: TIAtpWrapper, uri: string): Promise<boolean>
  deleteList (this: TIAtpWrapper, listUri: string): Promise<true | Error>
  deleteListUser (this: TIAtpWrapper, userUri: string): Promise<true | Error>
  deletePost (this: TIAtpWrapper, uri: string): Promise<boolean>
  deleteRecord (this: TIAtpWrapper, repo: string, collection: string, uri: string, swapCommit?: string, swapRecord?: string): Promise<Error | undefined>
  deleteRepost (this: TIAtpWrapper, uri: string): Promise<boolean>
  deleteSession (this: TIAtpWrapper): Promise<boolean>
  deleteStarterPack (this: TIAtpWrapper, uri: string): Promise<undefined | Error>
  deleteThreadgate (this: TIAtpWrapper, postUri: string): Promise<boolean | Error>
  fetchActorLists (this: TIAtpWrapper, currentLists: Array<TTList>, actor: string, limit?: number, cursor?: string): Promise<undefined | string | Error>
  fetchActorStarterPacks (this: TIAtpWrapper, currentStarterPacks: Array<TIStarterPack>, actor: string, limit?: number, cursor?: string): Promise<undefined | string | Error>
  fetchActorsTypeahead (this: TIAtpWrapper, q?: string, limit?: number): Promise<Error | Array<TTUser>>
  fetchAuthorFeedGenerators (this: TIAtpWrapper, generators: Array<TTFeedGenerator>, author: string, limit?: number, cursor?: string): Promise<Error | undefined | string>
  fetchAuthorFeed (this: TIAtpWrapper, oldFeeds: Array<TTFeed>, author: string, limit?: number, cursor?: string, filter?: string, direction?: TTDirection): Promise<undefined | string>
  fetchAuthorLikes (this: TIAtpWrapper, currentFeeds: Array<TTFeed>, repo: string, limit?: number, cursor?: string): Promise<undefined | string>
  fetchAuthorReposts (this: TIAtpWrapper, currentFeeds: Array<TTFeed>, repo: string, limit?: number, cursor?: string): Promise<undefined | string>
  fetchBlob (this: TIAtpWrapper, cid: string, did?: string): Promise<null | Blob>
  fetchBlobUrl (this: TIAtpWrapper, did: string, image: BlobRef): Promise<undefined | string>
  fetchBlockingUsers (this: TIAtpWrapper, users: Array<TTUser>, limit?: number, cursor?: string): Promise<undefined | string>
  fetchChatConvo (this: TIAtpWrapper, members: Array<string>): Promise<Error | TIChatConvo>
  fetchChatConvos (this: TIAtpWrapper, limit?: number, cursor?: string): Promise<Error | TIFetchChatConvosResponse>
  fetchChatDeclarations (this: TIAtpWrapper, repo: string, limit?: number, cursor?: string): Promise<Error | TIFetchChatDeclarationsResponse>
  fetchChatLogs (this: TIAtpWrapper, cursor?: string): Promise<Error | Array<TIChatLog>>
  fetchChatMessages (this: TIAtpWrapper, convoId: string, limit?: number, cursor?: string): Promise<Error | { cursor?: string; messages: Array<TIChatMessage> }>
  fetchCustomFeeds (this: TIAtpWrapper, oldFeeds: Array<TTFeed>, feed: string, replyFolding?: Array<number>, repostFolding?: Array<number>, limit?: number, cursor?: string, direction?: TTDirection, checkIdentity?: (params: any) => boolean): Promise<undefined | string | Error>
  fetchDid (this: TIAtpWrapper, handle: string): Promise<Error | string>
  fetchFeedGenerator (this: TIAtpWrapper, feed: string): Promise<Error | TTFeedGenerator>
  fetchFeedGenerators (this: TIAtpWrapper, feeds: Array<string>): Promise<Error | Array<TTFeedGenerator>>
  fetchFirstPost (this: TIAtpWrapper, handle: string): Promise<undefined | Error | TTPost>
  fetchFollowers (this: TIAtpWrapper, users: Array<TTUser> | Array<TTUser>, handle: string, limit?: number, cursor?: string): Promise<undefined | string>
  fetchFollowings (this: TIAtpWrapper, users: Array<TTUser> | Array<TTUser>, handle: string, limit?: number, cursor?: string): Promise<undefined | string>
  fetchInviteCodes (this: TIAtpWrapper): Promise<Error | TTInviteCode[]>
  fetchLabelers (this: TIAtpWrapper, dids: string[], detailed?: boolean): Promise<Error | Array<TILabeler>>
  fetchLabels (this: TIAtpWrapper, since?: number, limit?: number): Promise<Error | Array<TTLabel>>
  fetchLikeUsers (this: TIAtpWrapper, users: Array<TTUser>, uri: string, limit?: number, cursor?: string): Promise<undefined | string>
  fetchList (this: TIAtpWrapper, list: string): Promise<TTList | Error>
  fetchListBlocks (this: TIAtpWrapper, lists: Array<TTList>, limit?: number, cursor?: string): Promise<undefined | string | Error>
  fetchListFeeds (this: TIAtpWrapper, currentFeeds: Array<TTFeed>, list: string, replyFolding?: Array<number>, repostFolding?: Array<number>, limit?: number, cursor?: string, direction?: TTDirection, checkIdentity?: (params: any) => boolean): Promise<Error | undefined | string>
  fetchListItems (this: TIAtpWrapper, currentListItems: Array<TTListItem>, list: string, limit?: number, cursor?: string): Promise<undefined | string | Error>
  fetchListMutes (this: TIAtpWrapper, lists: Array<TTList>, limit?: number, cursor?: string): Promise<undefined | string | Error>
  fetchLists (this: TIAtpWrapper, lists: string[]): Promise<TTList[]>
  fetchLogAudit: (this: TIAtpWrapper, did: string) => Promise<undefined | any>
  fetchMutingUsers (this: TIAtpWrapper, users: Array<TTUser>, limit?: number, cursor?: string): Promise<undefined | string>
  fetchNotificationCount (this: TIAtpWrapper): Promise<null | number>
  fetchNotifications (this: TIAtpWrapper, values: Array<TTNotificationGroup>, limit?: number, cursor?: string): Promise<undefined | false | { cursor?: string; newNotificationCount: number }>
  fetchOfficialFeedGenerators (this: TIAtpWrapper): Promise<undefined | false | Array<TTFeedGenerator>>
  fetchPopularFeedGenerators (this: TIAtpWrapper, currentValues: Array<TTFeedGenerator>, limit?: number, cursor?: string, term?: string): Promise<Error | undefined | string>
  fetchPostedImageRefs (this: TIAtpWrapper, did: string): Promise<Error | string[]>
  fetchPosts (this: TIAtpWrapper, uris: Array<string>): Promise<undefined | false | Array<TTPost>>
  fetchPostSearch (this: TIAtpWrapper, currentPosts: Array<TTPost>, q: string, params: { [k: string]: any }, limit?: number, cursor?: string): Promise<Error | undefined | string>
  fetchPostThread (this: TIAtpWrapper, uri: string, depth?: number): Promise<undefined | false | Array<TTPost>>
  fetchPreferences (this: TIAtpWrapper): Promise<undefined | Array<TTPreference>>
  fetchProfile (this: TIAtpWrapper, actor: string): Promise<Error | TTProfile>
  fetchProfiles (this: TIAtpWrapper, actors: string[]): Promise<Error | TTProfile[]>
  fetchRecord (this: TIAtpWrapper, repo: string, collection: string, uri: string, cid?: string): Promise<Error | { uri: string; cid?: string; value: {} }>
  fetchRecords (this: TIAtpWrapper, repo: string, collection: string, limit?: number, cursor?: string, reverse?: boolean): Promise<Error | { cursor?: string; records: TICommonRecord[] }>
  fetchRepo (this: TIAtpWrapper, repo: string): Promise<Error | {}>
  fetchRepostUsers (this: TIAtpWrapper, users: Array<TTUser>, uri: string, limit?: number, cursor?: string): Promise<undefined | string>
  fetchServerInfo (this: TIAtpWrapper): Promise<Error | TTServerInfo>
  fetchStarterPackSharedUrl (this: TIAtpWrapper, starterPack: TIStarterPack): Promise<Error | string>
  fetchStarterPack (this: TIAtpWrapper, uri: string): Promise<Error | TIStarterPack>
  fetchStarterPacks (this: TIAtpWrapper, uris: Array<string>): Promise<Error | Array<TIStarterPack>>
  fetchSuggestedFollows (this: TIAtpWrapper, users: Array<TTUser> | Array<TTUser>, actor: string): Promise<Error | undefined>
  fetchSuggestions (this: TIAtpWrapper, dataRef: Array<TTUser>, limit?: number, cursor?: string): Promise<undefined | string>
  fetchTimeFeeds (this: TIAtpWrapper, oldPosts: Array<TTPost>, direction: "new" | "old", author: TTUser, limit?: number): Promise<Error | undefined | string>
  fetchTimeline (this: TIAtpWrapper, oldFeeds: Array<TTFeed>, replyFolding?: Array<number>, repostFolding?: Array<number>, limit?: number, cursor?: string, direction?: TTDirection): Promise<undefined | false | string>
  fetchUserSearch (this: TIAtpWrapper, users: Array<TTUser>, q: string, limit?: number, cursor?: string): Promise<undefined | string>
  fetchWithoutAgent (this: TIAtpWrapper, pathToXrpc: string, did: string, query: Record<string, any>, server?: string): Promise<Error | Response>
  hasLogin (this: TIAtpWrapper): boolean
  leaveChatConvo (this: TIAtpWrapper, convoId: string): Promise<Error | boolean>
  login (this: TIAtpWrapper, service?: string, identifier?: string, password?: string, authFactorToken?: string, onRefreshSession?: () => void): Promise<undefined | Error>
  logout (this: TIAtpWrapper)
  muteChatConvo (this: TIAtpWrapper, convoId: string): Promise<Error | boolean>
  refreshSession (this: TIAtpWrapper): Promise<undefined | Error>
  resetSession (this: TIAtpWrapper, newSession: TTSession, service?: string): void
  resumeSession (this: TIAtpWrapper, session: TTSession): Promise<Error | ComAtprotoServerGetSession.OutputSchema>
  saveData (this: TIAtpWrapper)
  signUp (this: TIAtpWrapper, service: string, email: string, handle: string, password: string, inviteCode?: string): Promise<undefined | Error>
  unmuteChatConvo (this: TIAtpWrapper, convoId: string): Promise<Error | boolean>
  updateBlockToDisable (this: TIAtpWrapper, uri: string): Promise<boolean>
  updateBlockToEnable (this: TIAtpWrapper, did: string): Promise<null | string>
  updateChatConvoRead (this: TIAtpWrapper, convoId: string, messageId?: string): Promise<Error | TIChatConvo>
  updateJwt (this: TIAtpWrapper, onRefreshSession?: () => void): Promise<undefined | Error>
  updateList (this: TIAtpWrapper, list: TTList, avatarBlobRef?: BlobRef): Promise<undefined | Error>
  updateListBlockToDisable (this: TIAtpWrapper, listUri: string): Promise<undefined | Error>
  updateListBlockToEnable (this: TIAtpWrapper, listUri: string): Promise<string | Error>
  updateListMuteToDisable (this: TIAtpWrapper, listUri: string): Promise<undefined | Error>
  updateListMuteToEnable (this: TIAtpWrapper, listUri: string): Promise<undefined | Error>
  updateMuteToDisable (this: TIAtpWrapper, did: string): Promise<boolean>
  updateMuteToEnable (this: TIAtpWrapper, did: string): Promise<boolean>
  updateNotificationSeen (this: TIAtpWrapper, seenAtDate?: Date): Promise<boolean>
  updatePinnedPost (this: TIAtpWrapper, uri?: string): Promise<Error | boolean>
  updatePreferences  (this: TIAtpWrapper, preferences: Array<TTPreference>): Promise<boolean>
  updateProfile (this: TIAtpWrapper, params: TTUpdateProfileParams): Promise<undefined | Error>
  updateRecord (this: TIAtpWrapper, repo: string, collection: string, uri: string, record: { [k: string]: any }, validate?: boolean, swapCommit?: string, swapRecord?: string): Promise<Error | TTCidUri>
  updateThreadgate (this: TIAtpWrapper, postUri: string, allowMention: boolean, allowFollowing: boolean, listUris?: Array<string>): Promise<Error | TTCidUri>
  updateThreadMuteToDisable (this: TIAtpWrapper, uri: string): Promise<Error | boolean>
  updateThreadMuteToEnable (this: TIAtpWrapper, uri: string): Promise<Error | boolean>
  updateStarterPack (this: TIAtpWrapper, starterPack: TIStarterPack): Promise<undefined | Error>
}
