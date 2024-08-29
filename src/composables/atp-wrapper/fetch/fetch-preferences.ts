import type { AppBskyActorGetPreferences, AtpAgent } from "@atproto/api"
import Util from "@/composables/util"

export default async function (this: TIAtpWrapper): Promise<undefined | Array<TTPreference>> {
  if (this.agent == null) {
    return
  }
  const response: AppBskyActorGetPreferences.Response =
    await (this.agent as AtpAgent).app.bsky.actor.getPreferences()
      .then((value: AppBskyActorGetPreferences.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/getPreferences]", response)
  if (response instanceof Error) {
    return
  }
  if (!response.success) {
    return
  }
  if (response.data?.preferences == null) {
    return
  }
  const preferences = response.data.preferences as Array<TTPreference>
  Util.sanitizePreferences(preferences)
  return preferences
}
