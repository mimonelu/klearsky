import type { AppBskyActorGetProfile } from "@atproto/api"
import text2html from "@/composables/text2html"

export default async function (
  this: AbstractAtpWrapper,
  actor: string
): Promise<null | Profile> {
  if (this.agent == null) return null
  if (this.session == null) return null
  try {
    const response: AppBskyActorGetProfile.Response =
      await this.agent.api.app.bsky.actor.getProfile({ actor })
    console.log("[klearsky/fetchProfile]", response)
    if (!response.success) return null

    // TODO:
    response.data.__descriptionHtml = text2html(response.data.description ?? "")

    return response.data as Profile
  } catch (error: any) {
    console.error("[klearsky/fetchProfile]", error)
    return null
  }
}
