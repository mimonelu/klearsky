import type { AppBskyFeedSetVote } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  uri: string,
  cid: string,
  direction: "none" | "up" | "down"
): Promise<boolean> {
  if (this.agent == null) return false
  const response: AppBskyFeedSetVote.Response =
    await this.agent.api.app.bsky.feed.setVote({
      subject: { uri, cid },
      direction,
    })
  return response.success
}
