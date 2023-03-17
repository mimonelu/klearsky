type Author = {
  did: string
  declaration: {
    actorType: string
    cid: string
    [k: string]: unknown
  }
  handle: string
  displayName: string
  avatar: string
  viewer: {
    muted: boolean
    following?: string
    followedBy?: string
    [k: string]: unknown
  }
  [k: string]: unknown
}

type Entity = {
  type: string
  index: {
    end: number
    start: number
  }
  value: string
}

type Reason = {
  $type: string
  by: {
    did: string
    declaration: {
      actorType: string
      cid: string
    }
    handle: string
    displayName: string
    avatar: string
    viewer: {
      muted: boolean
      following?: string
      followedBy?: string
    }
  }
  indexedAt: string
}

type Post = {
  uri: string
  cid: string
  author: Author
  embed?: {
    $type: string
    images: Array<{
      thumb: string
      fullsize: string
      alt: string
    }>
    [k: string]: unknown
  }
  record: {
    text: string
    __textHtml: string // Injected
    $type: string
    createdAt: string
    embed?: {
      $type: string
      external?: {
        uri: string
        thumb?: {
          cid: string
          mimeType: string
        }
        title?: string
        description?: string
      }
      images?: Array<{
        alt: string
        image: {
          cid: string
          mimeType: string
        }
      }>
      [k: string]: unknown
    }
    entities?: Array<Entity>
    [k: string]: unknown
  }
  replyCount: number
  repostCount: number
  upvoteCount: number
  downvoteCount: number
  indexedAt: string
  viewer: {
    repost?: string
    upvote?: string
    downvote?: string
    [k: string]: unknown
  }
  __reason?: Reason // Injected
  [k: string]: unknown
}

type Feed = {
  post: Post
  reply?: {
    root: Post
    parent: Post
    [k: string]: unknown
  }
  reason?: Reason
  [k: string]: unknown
}

type FileSchema = {
  cid: string
  mimeType: string
}

type Follower = {
  avatar: string
  declaration: {
    actorType: string
    cid: string
  }
  did: string
  displayName: string
  handle: string
  viewer: {
    followedBy?: string
    following?: string
    muted: boolean
  }
}

type Following = Follower

type KNotification = {
  avatar?: string
  cid: string
  displayName?: string
  handle: string
  indexedAt: string
  reason:
    | "reply"
    | "mention"
    | "repost"
    | "vote"
    | "follow"
    | "invite"
    | (string & {})
  reasonSubject?: string
}

type Profile = {
  did: string
  declaration: {
    actorType: string
    cid: string
  }
  handle: string
  displayName: string
  description?: string
  __descriptionHtml: string // Injected
  avatar: string
  banner: string
  followsCount: number
  followersCount: number
  postsCount: number
  creator: string
  indexedAt: string
  viewer: {
    followedBy?: string
    following?: string
    muted: boolean
  }
  myState: {
    follow?: string
    muted: boolean
  }
  [k: string]: unknown
}
