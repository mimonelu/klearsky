import type { AppBskyActorProfile, BskyAgent } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  uri?: string
): Promise<Error | boolean> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  let pinned = false
  const response: undefined | Error =
    await (this.agent as BskyAgent)
      .upsertProfile((existing?: any): AppBskyActorProfile.Record => {
        if (existing == null) {
          return { pinnedPost: uri }
        }
        if (uri != null) {
          pinned = true
          existing.pinnedPost = uri
        } else {
          pinned = false
          delete existing.pinnedPost
        }
        return existing
      })
      .catch((error: any) => error)
  console.log("[klearsky/upsertProfile]", response)
  if (response instanceof Error) {
    return response
  }
  return pinned
}
