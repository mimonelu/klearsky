import type { ComAtprotoRepoCreateRecord } from "@atproto/api"
import { makeCreatedAt } from "@/composables/atp-wrapper/services"

export default async function (
  this: TIAtpWrapper,
  did: string,
  declarationCid: string
): Promise<null | string> {
  if (this.agent == null) return null
  if (this.session == null) return null
  const response: ComAtprotoRepoCreateRecord.OutputSchema =
    await this.agent.api.app.bsky.graph.follow.create(
      { did: this.session.did },
      {
        subject: { did, declarationCid },
        createdAt: makeCreatedAt(),
      }
    )
  console.log("[klearsky/createFollow]", response)
  return response.uri
}
