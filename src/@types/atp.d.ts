import type {
  AppBskyActorProfile,
  AppBskyFeedFeedViewPost
} from "@atproto/api"

export type Feed = AppBskyFeedFeedViewPost.Main

export type FileSchema = {
  cid: string;
  mimeType: string;
}

export type Profile = null | AppBskyActorProfile.View
