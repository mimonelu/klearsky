import type { AppBskyActorGetProfile, BskyAgent } from "@atproto/api"
import text2html from "@/composables/text2html"

export default async function (
  this: TIAtpWrapper,
  actor: string
): Promise<null | TTProfile> {
  if (this.agent == null) return null
  const response: AppBskyActorGetProfile.Response =
    await (this.agent as BskyAgent).getProfile({ actor })
  console.log("[klearsky/getProfile]", response)
  if (!response.success) return null

  // TODO:
  response.data.__descriptionHtml = text2html(response.data.description ?? "")

  return response.data as TTProfile
}
