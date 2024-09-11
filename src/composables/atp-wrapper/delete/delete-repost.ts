import type { AtpAgent } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  uri: string
): Promise<Error | undefined> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const response: Error | undefined =
    await (this.agent as AtpAgent).deleteRepost(uri)
      .then((value) => value)
      .catch((error) => error)
  if (response instanceof Error) {
    return response
  }
}
