import type { AppBskyActorGetPreferences } from "@atproto/api"
import Util from "@/composables/util"

export default async function (this: TIAtpWrapper): Promise<Error | Array<TTPreference>> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const response: Error | AppBskyActorGetPreferences.Response =
    await this.agent.app.bsky.actor.getPreferences()
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/getPreferences]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
  if (response.data?.preferences == null) {
    return Error("apiError")
  }
  const preferences = response.data.preferences as Array<TTPreference>
  Util.sanitizePreferences(preferences)
  return preferences
}
