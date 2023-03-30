type TTPostType = "post" | "reply" | "quoteRepost"

type TTCreatePostParams = {
  type: TTPostType
  post?: TTPost
  text: string
  url: string
  images: Array<File>
  alts: Array<string>
}

type TTUpdateProfileParams = {
  displayName: string
  description: string
  avatar: null | Array<File>
  banner: null | Array<File>
}

type TTSession = {
  accessJwt: string
  did: string
  handle: string
  refreshJwt: string
  __service?: string // Injected
}

type TTData = {
  did: string
  sessions: { [did: string]: TTSession }
}

interface TIAtpWrapper {
  agent: null | AtpAgentstring
  data: TTData
  session?: TTSession

  canLogin(this: TIAtpWrapper): boolean
  createAgent(this: TIAtpWrapper, service?: string): boolean
  createFileSchema(
    this: TIAtpWrapper,
    params: {
      file: File,
      maxWidth: number
      maxHeight: number
      maxSize: number
      quality?: number
    }
  ): Promise<null | TTFileSchema>
  createFollow(
    this: TIAtpWrapper,
    did: string,
    declarationCid: string
  ): Promise<null | string>
  createPost(this: TIAtpWrapper, params: TTCreatePostParams): Promise<boolean>
  createRepost(this: TIAtpWrapper, post?: TTPost): Promise<boolean>
  deleteFollow(this: TIAtpWrapper, uri: string): Promise<boolean>
  deletePost(this: TIAtpWrapper, uri: string): Promise<boolean>
  deleteRepost(this: TIAtpWrapper, uri: string): Promise<boolean>
  fetchAuthorFeed(
    this: TIAtpWrapper,
    oldFeeds: Array<TTFeed>,
    author: string,
    limit?: number,
    cursor?: string
  ): Promise<null | {
    feeds: Array<TTFeed>
    cursor?: string
  }>
  fetchFollowings(
    this: TIAtpWrapper,
    users: Array<TTUser> | Array<TTUser>,
    handle: string,
    limit?: number,
    before?: string
  ): Promise<undefined | string>
  fetchFollowers(
    this: TIAtpWrapper,
    users: Array<TTUser> | Array<TTUser>,
    handle: string,
    limit?: number,
    before?: string
  ): Promise<undefined | string>
  fetchKeywordSearch(
    this: TIAtpWrapper,
    query: string
  ): Promise<undefined | any>
  fetchNotificationCount(this: TIAtpWrapper): Promise<null | number>
  fetchNotifications(
    this: TIAtpWrapper,
    values: Array<TTNotification>,
    limit?: number,
    cursor?: string
  ): Promise<null | {
    cursor?: string
    newNotificationCount: number
  }>
  fetchProfile(this: TIAtpWrapper, actor: string): Promise<null | TTProfile>
  fetchPostThread(
    this: TIAtpWrapper,
    uri: string,
    depth?: number
  ): Promise<null | Array<TTPost>>
  fetchTimeline(
    this: TIAtpWrapper,
    oldFeeds: Array<TTFeed>,
    limit?: number,
    cursor?: string
  ): Promise<null | {
    feeds: Array<TTFeed>
    cursor?: string
  }>
  fetchUserSearch(
    this: TIAtpWrapper,
    users: Array<TTUser>,
    term: string,
    limit?: number,
    before?: string
  ): Promise<undefined | string>
  hasLogin(this: TIAtpWrapper): boolean
  login(
    this: TIAtpWrapper,
    service?: string,
    identifier?: string,
    password?: string
  ): Promise<boolean>
  logout(this: TIAtpWrapper, did?: string)
  resumeSession(this: TIAtpWrapper, session: TTSession): Promise<boolean>
  saveData(this: TIAtpWrapper)
  updateNotificationSeen(this: TIAtpWrapper): Promise<boolean>
  updateProfile(
    this: TIAtpWrapper,
    params: TTUpdateProfileParams
  ): Promise<boolean>
  updateVote(
    this: TIAtpWrapper,
    uri: string,
    cid: string,
    direction: "none" | "up" | "down"
  ): Promise<boolean>
}
