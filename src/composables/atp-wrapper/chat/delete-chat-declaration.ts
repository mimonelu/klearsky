import Util from "@/composables/util"

export default async function (
  this: TIAtpWrapper,
  repo: string,
  uri: string
): Promise<Error | undefined> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  if (this.session == null) {
    return Error("noSessionError")
  }
  const rkey = Util.getRkey(uri)
  const headers: Record<string, string> = {}
  if (this.proxies.chat != null) {
    headers["atproto-proxy"] = this.proxies.chat
  }
  const response: Error | undefined =
    await this.agent.api.chat.bsky.actor.declaration.delete({
      repo,
      rkey,
    }, headers)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/api.chat.bsky.actor.declaration.delete]", response)
  if (response instanceof Error) {
    return response
  }
}
