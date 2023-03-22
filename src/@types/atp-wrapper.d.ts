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

interface TIAtpWrapper {
  service: null | string
  agent: null | AtpAgentstring
  session: null | AtpSessionDatastring
  accounts: {
    [handle: string]: {
      service: string
      handle: string
    }
  }

  canLogin(this: TIAtpWrapper): boolean
  createAgent(this: TIAtpWrapper): boolean
  createFileSchema(
    this: TIAtpWrapper,
    file: File,
    maxWidth: number,
    maxHeight: number
  ): Promise<null | TTFileSchema>
  createFollow(
    this: TIAtpWrapper,
    did: string,
    declarationCid: string
  ): Promise<boolean>
  createPost(
    this: TIAtpWrapper,
    params: TTCreatePostParams
  ): Promise<boolean>
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
  fetchNotifications(
    this: TIAtpWrapper,
    values: Array<TTNotification>,
    limit?: number,
    cursor?: string
  ): Promise<undefined | string>
  fetchProfile(
    this: TIAtpWrapper,
    actor: string
  ): Promise<null | TTProfile>
  fetchPostThread(
    this: TIAtpWrapper,
    uri: string,
    depth?: number
  ): Promise<null | Array<TTFeed>>
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
  logout(this: TIAtpWrapper)
  resumeSession(this: TIAtpWrapper, handle?: string): Promise<boolean>
  saveServiceAndHandle(service: string, handle: string)
  setService(this: TIAtpWrapper, service?: string)
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
