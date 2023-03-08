import type {
  AppBskyFeedFeedViewPost
} from "@atproto/api"

export type Feed = AppBskyFeedFeedViewPost.Main

export type FileSchema = {
  cid: string;
  mimeType: string;
}
