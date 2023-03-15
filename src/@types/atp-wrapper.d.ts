type CreatePostParams = {
  type: "post" | "reply" | "repost";
  post?: Post;
  text: string;
  url: string;
  images: Array<File>;
  alts: Array<string>;
}

type UpdateProfileParams = {
  displayName: string;
  description: string;
  avatar: null | Array<File>;
  banner: null | Array<File>;
}

interface AbstractAtpWrapper {
  service: null | string = null
  agent: null | AtpAgent = null
  session: null | AtpSessionData = null

  canLogin(this: AbstractAtpWrapper): boolean
  createAgent(this: AbstractAtpWrapper)
  createFollow(this: AbstractAtpWrapper, did: string, declarationCid: string): Promise<boolean>
  createPost(this: AbstractAtpWrapper, params: CreatePostParams): Promise<boolean>
  createRepost(this: AbstractAtpWrapper, post?: Post): Promise<boolean>
  deleteFollow(this: AbstractAtpWrapper, uri: string): Promise<boolean>
  deleteRepost(this: AbstractAtpWrapper, uri: string): Promise<boolean>
  fetchAuthorFeed(this: AbstractAtpWrapper, oldFeeds: Array<Feed>, author: string, limit?: number, cursor?: string): Promise<null | {
    feeds: Array<Feed>;
    cursor?: string;
  }>
  fetchFileSchema(this: AbstractAtpWrapper, file: File): Promise<null | FileSchema>
  fetchFollowings (this: AbstractAtpWrapper, handle: string, limit?: number, before?: string): Promise<null | {
    cursor?: string;
    followings: Array<Following>;
  }>
  fetchFollowers (this: AbstractAtpWrapper, handle: string, limit?: number, before?: string): Promise<null | {
    cursor?: string;
    followers: Array<Following>;
  }>
  fetchProfile(this: AbstractAtpWrapper, actor: string): Promise<null | Profile>
  fetchPostThread(this: AbstractAtpWrapper, uri: string, depth?: number): Promise<null | Array<Feed>>
  fetchTimeline(this: AbstractAtpWrapper, oldFeeds: Array<Feed>, limit?: number, cursor?: string): Promise<null | {
    feeds: Array<Feed>;
    cursor?: string;
  }>
  hasLogin(this: AbstractAtpWrapper): boolean
  login(this: AbstractAtpWrapper, service?: string, identifier?: string, password?: string)
  logout(this: AbstractAtpWrapper)
  resumeSession(this: AbstractAtpWrapper)
  setService(this: AbstractAtpWrapper, service?: string)
  updateProfile(this: AbstractAtpWrapper, params: UpdateProfileParams): Promise<boolean>
  updateVote(this: AbstractAtpWrapper, uri: string, cid: string, direction: "none" | "up" | "down"): Promise<boolean>
}
