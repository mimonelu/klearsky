import type { AppBskyFeedSetVote } from "@atproto/api"

export default async function (this: AbstractAtpWrapper, uri: string, cid: string, direction: "none" | "up" | "down"): Promise<boolean> {
  if (this.agent == null) return false
  if (this.session == null) return false
  try {
    const response: AppBskyFeedSetVote.Response =
      await this.agent.api.app.bsky.feed.setVote({
        subject: { uri, cid },
        direction,
      })
    return response.success
  } catch (error: any) {
    console.error("[klearsky/updateVote]", error)
    return false
  }
}
