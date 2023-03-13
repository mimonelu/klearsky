type Author = {
  did: string;
  declaration: {
    actorType: string;
    cid: string;
    [k: string]: unknown;
  };
  handle: string;
  displayName: string;
  avatar: string;
  viewer: {
    muted: boolean;
    following?: string;
    followedBy?: string;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}

type Entity = {
  type: "link";
  index: {
    end: number;
    start: number;
  };
  value: string;
}

type Post = {
  uri: string;
  cid: string;
  author: Author;
  embed?: {
    $type: string,
    images: Array<{
      thumb: string;
      fullsize: string;
      alt: string;
    }>;
    [k: string]: unknown;
  },
  record: {
    text: string;
    __textHtml: string; // Injected
    $type: string;
    createdAt: string;
    embed?: {
      $type: string;
      images?: Array<{
        alt: string;
        image: {
          cid: string;
          mimeType: string;
        };
      }>;
      [k: string]: unknown;
    };
    entities?: Array<Entity>;
    [k: string]: unknown;
  };
  replyCount: number;
  repostCount: number;
  upvoteCount: number;
  downvoteCount: number;
  indexedAt: string;
  viewer: {
    repost?: string;
    upvote?: string;
    downvote?: string;
    [k: string]: unknown;
  };
  __reason?: unknown; // Injected
  [k: string]: unknown;
}

type Feed = {
  post: Post;
  reply?: {
    root: Post;
    parent: Post;
    [k: string]: unknown;
  };
  reason?: {
    $type: string;
    by: unknown;
    indexedAt: string;
  };
  [k: string]: unknown;
}

type Profile = {
  did: string;
  declaration: {
    actorType: string;
    cid: string;
  };
  handle: string;
  displayName: string;
  description?: string;
  __descriptionHtml: string; // Injected
  avatar: string;
  banner: string;
  followsCount: number;
  followersCount: number;
  postsCount: number;
  creator: string;
  indexedAt: string;
  viewer: {
    muted: boolean;
  };
  myState: {
    muted: boolean;
  };
  [k: string]: unknown;
}

type FileSchema = {
  cid: string;
  mimeType: string;
}
