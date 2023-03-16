export default async function (
  this: AbstractAtpWrapper,
  uri: string
): Promise<boolean> {
  if (this.agent == null) return false
  if (this.session == null) return false
  try {
    await this.agent.api.app.bsky.feed.repost.delete({
      did: this.session.did,
      rkey: uri.split("/").pop(),
    })
    return true
  } catch (error: any) {
    console.error("[klearsky/deleteRepost]", error)
    return false
  }
}
