import type { AtpAgent } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  listUri: string
): Promise<undefined | Error> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const response: void | Error =
    await (this.agent as AtpAgent).unblockModList(listUri)
      .then((value: any) => value)
      .catch((error: any) => error)
  console.log("[klearsky/unblockModList]", response)
  if (response instanceof Error) return response
}
