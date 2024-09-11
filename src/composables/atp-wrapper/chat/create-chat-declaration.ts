import type { AtpAgent } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  repo: string,
  allowIncoming: TTAllowIncoming
): Promise<Error | TTCidUri> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  if (this.session == null) {
    return Error("noSessionError")
  }
  const headers = { "atproto-proxy": "did:web:api.bsky.chat#bsky_chat" }
  const response: Error | TTCidUri =
    await (this.agent as AtpAgent).api.chat.bsky.actor.declaration.create({ repo }, { allowIncoming }, headers)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/api.chat.bsky.actor.declaration.create]", response)
  if (response instanceof Error) {
    return response
  }
  return response
}
