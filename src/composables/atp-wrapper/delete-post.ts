export default async function (
  this: TIAtpWrapper,
  uri: string
): Promise<boolean> {
  if (this.agent == null) return false
  if (this.session == null) return false
  await this.agent.api.app.bsky.feed.post.delete({
    did: this.session.did,
    rkey: uri.split("/").pop(),
  })
  return true
}
