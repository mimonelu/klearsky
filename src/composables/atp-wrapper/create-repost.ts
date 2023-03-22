import { makeCreatedAt } from "@/composables/atp-wrapper/services"

export default async function (
  this: TIAtpWrapper,
  post?: any
): Promise<boolean> {
  if (this.agent == null) return false
  if (this.session == null) return false
  const response = await this.agent.api.app.bsky.feed.repost.create(
    {
      did: this.session.did,
    },
    {
      subject: {
        cid: post?.cid,
        uri: post?.uri,
      },
      createdAt: makeCreatedAt(),
    }
  )
  console.log("[klearsky/createRepost]", response)
  return true
}
