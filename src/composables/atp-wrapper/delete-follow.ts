import { AtUri } from "@atproto/uri"

export default async function (
  this: TIAtpWrapper,
  uri: string
): Promise<boolean> {
  const { host, rkey } = new AtUri(uri)
  if (this.agent == null) return false
  if (this.session == null) return false
  await this.agent.api.app.bsky.graph.follow.delete({ did: host, rkey })
  return true
}
