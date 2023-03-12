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
    [k: string]: unknown;
  };
  [k: string]: unknown;
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
    $type: string;
    createdAt: string;
    embed: {
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
  [k: string]: unknown;
}

type Feed = {
  post: Post;
  reply?: {
    root: Post;
    parent: Post;
    [k: string]: unknown;
  };
  reason?: unknown;
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
  description: string;
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
