import { makeCreatedAt } from "@/composables/atp-wrapper/services"

export default async function (
  this: AbstractAtpWrapper,
  did: string,
  declarationCid: string
): Promise<boolean> {
  if (this.agent == null) return false
  if (this.session == null) return false
  await this.agent.api.app.bsky.graph.follow.create(
    { did: this.session.did },
    {
      subject: { did, declarationCid },
      createdAt: makeCreatedAt(),
    }
  )
  return true
}
