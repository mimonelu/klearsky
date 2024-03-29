import type { BskyAgent, ComAtprotoRepoCreateRecord } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  declarationDid: string
): Promise<null | string> {
  if (this.agent == null) return null
  const response: ComAtprotoRepoCreateRecord.OutputSchema = await (
    this.agent as BskyAgent
  ).follow(declarationDid)
  console.log("[klearsky/follow]", response)
  return response.uri
}
