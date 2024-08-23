import type { AtpAgent } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  uri: string
): Promise<boolean> {
  if (this.agent == null) return false
  await (this.agent as AtpAgent).deleteLike(uri)
  return true
}
