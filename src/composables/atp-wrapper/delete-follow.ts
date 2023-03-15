import { AtUri } from "@atproto/uri"

export default async function (this: AbstractAtpWrapper, uri: string): Promise<boolean> {
  const { host, rkey } = new AtUri(uri)
  if (this.agent == null) return false
  if (this.session == null) return false
  try {
    await this.agent.api.app.bsky.graph.follow.delete({ did: host, rkey })
    return true
  } catch (error: any) {
    console.error("[klearsky/unfollow]", error)
    return false
  }
}
