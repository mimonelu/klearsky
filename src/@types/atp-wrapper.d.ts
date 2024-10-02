interface TIAtpWrapper {
  agent: null | import("@atproto/api/dist/atp-agent").AtpAgent
  proxies: { [k: string]: undefined | string }
  data: { did: string; sessions: { [did: string]: TTSession } }
  session?: TTSession
  canLogin
    (): boolean
  createAgent
    (service: string, pdsUrl?: string): boolean
  createChatDeclaration
    (repo: string, allowIncoming: TTAllowIncoming): Promise<Error | TTCidUri>
  createChatMessage
    (convoId: string, params: TTCreatePostParams): Promise<Error | TIChatMessage>
  createFileBlobRef
    (params: TTCreateFileBlobRefParams): Promise<Error | BlobRef>
  createFollow
    (declarationDid: string): Promise<Error | string>
  createLike
    (uri: string, cid: string): Promise<Error | string>
  createList
    (purpose: string, name: string, description?: string, avatarBlobRef?: BlobRef): Promise<Error | string>
  createListUser
    (listUri: string, userDid: string): Promise<Error | string>
  createPost
    (params: TTCreatePostParams): Promise<Error | TTCidUri>
  createRecord
    (repo: string, collection: string, record: { [k: string]: any }, rkey?: string, validate?: boolean, swapCommit?: string): Promise<Error | TTCidUri>
  createReport
    (reasonType: string, reason: string, did?: string, cid?: string, uri?: string, type?: string): Promise<Error | undefined>
  createRepost
    (uri: string, cid: string): Promise<Error | undefined>
  createStarterPack
    (starterPack: TIStarterPack): Promise<Error | TTCidUri>
  createVideo
    (file: File): Promise<Error | BlobRef>
  deleteAccount
    (did?: string)
  deleteChatDeclaration
    (repo: string, uri: string): Promise<Error | undefined>
  deleteChatMessage
    (convoId: string, messageId: string): Promise<Error | undefined>
  deleteCustomBookmark
    (this: TIAtpWrapper, uri: string): Promise<Error | undefined>
  deleteFollow
    (uri: string): Promise<Error | undefined>
  deleteLike
    (uri: string): Promise<Error | undefined>
  deleteList
    (listUri: string): Promise<Error | undefined>
  deleteListUser
    (userUri: string): Promise<Error | undefined>
  deletePost
    (uri: string): Promise<Error | undefined>
  deleteRecord
    (repo: string, collection: string, uri: string, swapCommit?: string, swapRecord?: string): Promise<Error | undefined>
  deleteRepost
    (uri: string): Promise<Error | undefined>
  deleteSession
    (): Promise<Error | undefined>
  deleteStarterPack
    (uri: string): Promise<Error | undefined>
  deleteThreadgate
    (postUri: string): Promise<Error | undefined>
  fetchActorLists
    (currentLists: Array<TTList>, actor: string, limit?: number, cursor?: string): Promise<Error | undefined | string>
  fetchActorStarterPacks
    (currentStarterPacks: Array<TIStarterPack>, actor: string, limit?: number, cursor?: string): Promise<Error | undefined | string>
  fetchActorsTypeahead
    (q?: string, limit?: number): Promise<Error | Array<TTUser>>
  fetchAuthorFeedGenerators
    (generators: Array<TTFeedGenerator>, author: string, limit?: number, cursor?: string): Promise<Error | undefined | string>
  fetchAuthorFeed
    (oldFeeds: Array<TTFeed>, author: string, limit?: number, cursor?: string, filter?: string, direction?: TTDirection): Promise<Error | undefined | string>
  fetchAuthorLikes
    (currentFeeds: Array<TTFeed>, repo: string, limit?: number, cursor?: string): Promise<Error | undefined | string>
  fetchAuthorReposts
    (currentFeeds: Array<TTFeed>, repo: string, limit?: number, cursor?: string): Promise<Error | undefined | string>
  fetchBlob
    (cid: string, did?: string): Promise<Error | Blob>
  fetchBlobUrl
    (did: string, image: BlobRef): Promise<Error | string>
  fetchBlockingUsers
    (users: Array<TTUser>, limit?: number, cursor?: string): Promise<Error | undefined | string>
  fetchChatConvo
    (members: Array<string>): Promise<Error | TIChatConvo>
  fetchChatConvos
    (limit?: number, cursor?: string): Promise<Error | TIFetchChatConvosResponse>
  fetchChatDeclarations
    (repo: string, limit?: number, cursor?: string): Promise<Error | TIFetchChatDeclarationsResponse>
  fetchChatLogs
    (cursor?: string): Promise<Error | Array<TIChatLog>>
  fetchChatMessages
    (convoId: string, limit?: number, cursor?: string): Promise<Error | { cursor?: string; messages: Array<TIChatMessage> }>
  fetchCustomBookmarkPacks
    (this: TIAtpWrapper, currentCustomBookmarkPacks: Array<TICustomBookmarkPack>, did: string, limit?: number, cursor?: string): Promise<Error | undefined | string>
  fetchCustomFeeds
    (oldFeeds: Array<TTFeed>, feed: string, replyFolding?: Array<number>, repostFolding?: Array<number>, limit?: number, cursor?: string, direction?: TTDirection, checkIdentity?: (params: any) => boolean): Promise<Error | undefined | string>
  fetchDid
    (handle: string): Promise<Error | string>
  fetchFeedGenerator
    (feed: string): Promise<Error | TTFeedGenerator>
  fetchFeedGenerators
    (feeds: Array<string>): Promise<Error | Array<TTFeedGenerator>>
  fetchFirstPost
    (handle: string): Promise<Error | undefined | TTPost>
  fetchFollowers
    (users: Array<TTUser> | Array<TTUser>, handle: string, limit?: number, cursor?: string): Promise<Error | undefined | string>
  fetchFollowings
    (users: Array<TTUser> | Array<TTUser>, handle: string, limit?: number, cursor?: string): Promise<Error | undefined | string>
  fetchInviteCodes
    (): Promise<Error | TTInviteCode[]>
  fetchLabelers
    (dids: string[], detailed?: boolean): Promise<Error | Array<TILabeler>>
  fetchLabels
    (since?: number, limit?: number): Promise<Error | Array<TTLabel>>
  fetchLikeUsers
    (users: Array<TTUser>, uri: string, limit?: number, cursor?: string): Promise<Error | undefined | string>
  fetchList
    (list: string): Promise<Error | TTList>
  fetchListBlocks
    (lists: Array<TTList>, limit?: number, cursor?: string): Promise<Error | undefined | string>
  fetchListFeeds
    (currentFeeds: Array<TTFeed>, list: string, replyFolding?: Array<number>, repostFolding?: Array<number>, limit?: number, cursor?: string, direction?: TTDirection, checkIdentity?: (params: any) => boolean): Promise<Error | undefined | string>
  fetchListItems
    (currentListItems: Array<TTListItem>, list: string, limit?: number, cursor?: string): Promise<Error | undefined | string>
  fetchListMutes
    (lists: Array<TTList>, limit?: number, cursor?: string): Promise<Error | undefined | string>
  fetchLists
    (lists: string[]): Promise<TTList[]> // ok
  fetchLogAudit:
    (did: string) => Promise<Error | undefined | any>
  fetchMutingUsers
    (users: Array<TTUser>, limit?: number, cursor?: string): Promise<Error | undefined | string>
  fetchNotificationCount
    (): Promise<Error | number>
  fetchNotifications
    (values: Array<TTNotificationGroup>, limit?: number, cursor?: string): Promise<Error | { cursor?: string; newNotificationCount: number }>
  fetchOfficialFeedGenerators
    (): Promise<Error | Array<TTFeedGenerator>>
  fetchPopularFeedGenerators
    (currentValues: Array<TTFeedGenerator>, limit?: number, cursor?: string, term?: string): Promise<Error | undefined | string>
  fetchPostedImageRefs
    (did: string): Promise<Error | string[]>
  fetchPostgate
    (this: TIAtpWrapper, post: string): Promise<Error | { uri: string; cid: string; value: TIPostgate; }>
  fetchPosts
    (uris: Array<string>): Promise<Error | Array<TTPost>>
  fetchPostSearch
    (currentPosts: Array<TTPost>, q: string, params: { [k: string]: any }, limit?: number, cursor?: string): Promise<Error | undefined | string>
  fetchPostThread
    (uri: string, depth?: number): Promise<Error | Array<TTPost>>
  fetchPreferences
    (): Promise<Error | Array<TTPreference>>
  fetchProfile
    (actor: string): Promise<Error | TTProfile>
  fetchProfiles
    (actors: string[]): Promise<Error | TTProfile[]>
  fetchQuoteReposts
    (currentPosts: Array<TTPost>, uri: string, limit?: number, cursor?: string): Promise<Error | undefined | string>
  fetchRecord
    (repo: string, collection: string, uri: string, cid?: string): Promise<Error | { uri: string; cid?: string; value: {} }>
  fetchRecords
    (repo: string, collection: string, limit?: number, cursor?: string, reverse?: boolean): Promise<Error | { cursor?: string; records: TICommonRecord[] }>
  fetchRepo
    (repo: string): Promise<Error | {}>
  fetchRepostUsers
    (users: Array<TTUser>, uri: string, limit?: number, cursor?: string): Promise<Error | undefined | string>
  fetchServiceAuth
    (aud: string, lxm?: string, exp?: number): Promise<Error | string>
  fetchServerInfo
    (): Promise<Error | TTServerInfo>
  fetchStarterPackSharedUrl
    (starterPack: TIStarterPack): Promise<Error | string>
  fetchStarterPack
    (uri: string): Promise<Error | TIStarterPack>
  fetchStarterPacks
    (uris: Array<string>): Promise<Error | Array<TIStarterPack>>
  fetchSuggestedFollows
    (users: Array<TTUser> | Array<TTUser>, actor: string): Promise<Error | undefined>
  fetchSuggestions
    (dataRef: Array<TTUser>, limit?: number, cursor?: string): Promise<Error | undefined | string>
  fetchTimeFeeds
    (oldPosts: Array<TTPost>, direction: "new" | "old", author: TTUser, limit?: number): Promise<Error | undefined | string>
  fetchTimeline
    (oldFeeds: Array<TTFeed>, replyFolding?: Array<number>, repostFolding?: Array<number>, limit?: number, cursor?: string, direction?: TTDirection): Promise<Error | undefined | string>
  fetchTimelineNewArrival
    (): Promise<Error | Array<TTFeed>>
  fetchUserSearch
    (users: Array<TTUser>, q: string, limit?: number, cursor?: string): Promise<Error | undefined | string>
  fetchVideoLimits
    (): Promise<Error | TIVideoLimits>
  fetchWithoutAgent
    (pathToXrpc: string, did: string, query: Record<string, any>, server?: string, method?: "blob" | "json"): Promise<Error | Response | any | Blob>
  hasLogin
    (): boolean
  leaveChatConvo
    (convoId: string): Promise<Error | undefined>
  login
    (service?: string, identifier?: string, password?: string, authFactorToken?: string, onRefreshSession?: () => void): Promise<Error | undefined>
  logout
    ()
  muteChatConvo
    (convoId: string): Promise<Error | undefined>
  refreshSession
    (): Promise<Error | undefined>
  resetSession
    (newSession: TTSession, service?: string): Error | undefined
  resumeSession
    (session: TTSession): Promise<Error | ComAtprotoServerGetSession.OutputSchema>
  saveData
    ()
  signUp
    (service: string, email: string, handle: string, password: string, inviteCode?: string): Promise<Error | undefined>
  unmuteChatConvo
    (convoId: string): Promise<Error | undefined>
  updateBlockToDisable
    (uri: string): Promise<Error | undefined>
  updateBlockToEnable
    (did: string): Promise<Error | string>
  updateChatConvoRead
    (convoId: string, messageId?: string): Promise<Error | TIChatConvo>
  updateCustomBookmarks
    (this: TIAtpWrapper, uri: string, cid?: string, tags?: Array<string>): Promise<Error | TTCidUri>
  updateJwt
    (onRefreshSession?: () => void): Promise<Error | undefined>
  updateList
    (list: TTList, avatarBlobRef?: BlobRef): Promise<Error | undefined>
  updateListBlockToDisable
    (listUri: string): Promise<Error | undefined>
  updateListBlockToEnable
    (listUri: string): Promise<Error | string>
  updateListMuteToDisable
    (listUri: string): Promise<Error | undefined>
  updateListMuteToEnable
    (listUri: string): Promise<Error | undefined>
  updateMuteToDisable
    (did: string): Promise<Error | undefined>
  updateMuteToEnable
    (did: string): Promise<Error | undefined>
  updateNotificationSeen
    (seenAtDate?: Date): Promise<Error | undefined>
  updatePinnedPost
    (uri?: string, cid?: string): Promise<Error | boolean>
  updatePostgate
    (this: TIAtpWrapper, post: string, allow: boolean, detachedEmbeddingUris?: Array<string>): Promise<Error | TTCidUri>
  updatePreferences 
    (preferences: Array<TTPreference>): Promise<Error | undefined>
  updateProfile
    (params: TTUpdateProfileParams): Promise<Error | undefined>
  updateRecord
    (repo: string, collection: string, uri: string, record: { [k: string]: any }, validate?: boolean, swapCommit?: string, swapRecord?: string): Promise<Error | TTCidUri>
  updateThreadgate
    (postUri: string, allowMention: boolean, allowFollowing: boolean, listUris?: Array<string>): Promise<Error | TTCidUri>
  updateThreadMuteToDisable
    (uri: string): Promise<Error | undefined>
  updateThreadMuteToEnable
    (uri: string): Promise<Error | undefined>
  updateStarterPack
    (starterPack: TIStarterPack): Promise<Error | undefined>
}
