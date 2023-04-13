import type { AppBskyActorGetProfile, BskyAgent } from "@atproto/api"
import Util from "@/composables/atp-wrapper/util"

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
  response.data.__descriptionHtml = Util.text2html(response.data.description ?? "")

  return response.data as TTProfile
}
